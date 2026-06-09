import { expect, test, type Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local', quiet: true })

const supabaseUrl = process.env.TEST_SUPABASE_URL
const anonKey = process.env.TEST_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY

async function login(page: Page, email: string, password: string, target = '/calendario') {
  await page.goto(target)
  await expect(page.getByRole('heading', { name: 'Accesso AuditPlan' })).toBeVisible()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: 'Entra' }).click()
  await expect(page).toHaveURL(new RegExp(target))
}

test('INV-2: unauthenticated users are redirected to login', async ({ page }) => {
  await page.goto('/clienti')

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Accesso AuditPlan' })).toBeVisible()
})

test.describe('calendar real data flow', () => {
  test.skip(!supabaseUrl || !anonKey || !serviceRoleKey, 'Missing TEST_SUPABASE_* env vars')

  let service: SupabaseClient
  let userId: string
  let clientId: string
  let auditorId: string
  let standardId: string
  let email: string
  let password: string
  let suffix: string

  test.beforeEach(async () => {
    suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    const ente = `E2E_${suffix}`
    clientId = crypto.randomUUID()
    auditorId = crypto.randomUUID()
    standardId = crypto.randomUUID()
    email = `e2e-calendar-${suffix}@example.invalid`
    password = `E2e-${suffix}-Password1`

    service = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: userData, error: userError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    expect(userError).toBeNull()
    userId = userData.user!.id

    const { error: seedError } = await service.from('profiles').insert({
      user_id: userId,
      full_name: 'E2E Calendar Operator',
      role: 'operator',
      ente,
      sees_all: false,
    })
    expect(seedError).toBeNull()

    const { error: clientError } = await service.from('clients').insert({
      id: clientId,
      company_name: `Cliente E2E ${suffix}`,
      ente,
      active: true,
    })
    expect(clientError).toBeNull()

    const { error: auditorError } = await service.from('auditors').insert({
      id: auditorId,
      name: `Auditor E2E ${suffix}`,
      ente,
      active: true,
    })
    expect(auditorError).toBeNull()

    const { error: standardError } = await service.from('standards').insert({
      id: standardId,
      code: `STD-E2E-${suffix.slice(0, 8)}`,
      name: `Standard E2E ${suffix}`,
      active: true,
    })
    expect(standardError).toBeNull()
  })

  test.afterEach(async () => {
    if (!service) return

    const { data: audits } = await service.from('audits').select('id').eq('client_id', clientId)
    const auditIds = (audits ?? []).map((audit) => audit.id)

    if (auditIds.length > 0) {
      await service.from('calendar_events').delete().in('audit_id', auditIds)
      await service.from('audit_standards').delete().in('audit_id', auditIds)
      await service.from('audits').delete().in('id', auditIds)
    }

    await service.from('standards').delete().eq('id', standardId)
    await service.from('auditors').delete().eq('id', auditorId)
    await service.from('clients').delete().eq('id', clientId)
    await service.from('profiles').delete().eq('user_id', userId)
    if (userId) await service.auth.admin.deleteUser(userId)
  })

  test('login -> create event -> see it -> edit it -> cancel it', async ({ page }) => {
    const clientName = `Cliente E2E ${suffix}`
    const auditNumber = `AU-E2E-${suffix}`
    const editedAuditNumber = `${auditNumber}-MOD`
    const standardCode = `STD-E2E-${suffix.slice(0, 8)}`

    await login(page, email, password)
    await expect(page.getByRole('heading', { name: 'Pianificazione Audit' })).toBeVisible()

    await page.getByRole('button', { name: 'Nuovo evento' }).click()
    const formDrawer = page.locator('aside').filter({ hasText: 'Nuovo evento audit' })
    await expect(formDrawer).toBeVisible()
    await formDrawer.getByLabel('Azienda / Cliente').selectOption(clientId)
    await formDrawer.getByLabel('Tipo audit').selectOption('Sorveglianza')
    await formDrawer.getByLabel('Auditor').selectOption(auditorId)
    await formDrawer.getByText('Aggiungi').click()
    await formDrawer.getByText(standardCode).click()
    await formDrawer.getByLabel('Numero audit').fill(auditNumber)
    await formDrawer.getByLabel('Data inizio').fill('2026-05-15T09:00')
    await formDrawer.getByLabel('Data fine').fill('2026-05-15T17:00')
    await formDrawer.getByRole('button', { name: 'Crea evento' }).click()

    const eventChip = page.getByTestId('calendar-event-chip').filter({ hasText: clientName }).first()
    await expect(eventChip).toBeVisible()

    await eventChip.click()
    await page.getByRole('button', { name: 'Modifica' }).click()
    const editDrawer = page.getByTestId('event-form-drawer').filter({ hasText: 'Modifica evento audit' })
    await expect(editDrawer).toBeVisible()
    await editDrawer.getByLabel('Numero audit').fill(editedAuditNumber)
    await editDrawer.getByRole('button', { name: 'Salva modifiche' }).click()

    await eventChip.click()
    const detailDrawer = page.getByTestId('event-detail-drawer')
    await expect(detailDrawer.getByText(editedAuditNumber).first()).toBeVisible()
    await detailDrawer.getByRole('button', { name: 'Annulla' }).click()

    await eventChip.click()
    await expect(page.getByTestId('event-detail-drawer').getByText('Annullato').first()).toBeVisible()
  })

  test('login -> audit list shows a real created event', async ({ page }) => {
    const clientName = `Cliente E2E ${suffix}`
    const auditNumber = `LIST-E2E-${suffix}`

    const { data: audit, error: auditError } = await service
      .from('audits')
      .insert({
        audit_number: auditNumber,
        client_id: clientId,
        audit_type: 'Sorveglianza',
        status: 'pianificato',
        ente: `E2E_${suffix}`,
      })
      .select('id')
      .single<{ id: string }>()
    expect(auditError).toBeNull()

    const { error: standardLinkError } = await service.from('audit_standards').insert({
      audit_id: audit!.id,
      standard_id: standardId,
    })
    expect(standardLinkError).toBeNull()

    const { error: eventError } = await service.from('calendar_events').insert({
      audit_id: audit!.id,
      auditor_id: auditorId,
      start_datetime: '2026-05-18T09:00:00.000Z',
      end_datetime: '2026-05-18T17:00:00.000Z',
      all_day: false,
      title: 'Evento lista E2E',
      status: 'pianificato',
      performed_status: 'no',
      ente: `E2E_${suffix}`,
    })
    expect(eventError).toBeNull()

    await login(page, email, password, '/audit')
    await expect(page.getByRole('heading', { name: 'Eventi audit' })).toBeVisible()

    const row = page.getByTestId('audit-event-row').filter({ hasText: clientName }).filter({ hasText: auditNumber })
    await expect(row).toBeVisible()

    await page.getByPlaceholder('Cerca per azienda, auditor, n. audit, norma...').fill(auditNumber)
    await expect(row).toBeVisible()
  })
})
