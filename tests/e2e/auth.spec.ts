import { expect, test, type Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local', quiet: true })

const supabaseUrl = process.env.TEST_SUPABASE_URL
const anonKey = process.env.TEST_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY
const attachmentBucket = 'event-attachments'

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
      const { data: events } = await service.from('calendar_events').select('id').in('audit_id', auditIds)
      const eventIds = (events ?? []).map((event) => event.id)

      if (eventIds.length > 0) {
        const { data: attachments } = await service.from('event_attachments').select('storage_path').in('event_id', eventIds)
        const storagePaths = (attachments ?? []).map((attachment) => attachment.storage_path).filter((path): path is string => Boolean(path))

        if (storagePaths.length > 0) {
          await service.storage.from(attachmentBucket).remove(storagePaths)
        }

        await service.from('event_attachments').delete().in('event_id', eventIds)
      }

      await service.from('calendar_events').delete().in('audit_id', auditIds)
      await service.from('audit_standards').delete().in('audit_id', auditIds)
      await service.from('audits').delete().in('id', auditIds)
    }

    await service.from('standards').delete().eq('id', standardId)
    await service.from('standards').delete().like('code', `REG-E2E-${suffix.slice(0, 8)}%`)
    await service.from('auditors').delete().like('name', `%${suffix}%`)
    await service.from('clients').delete().like('company_name', `%${suffix}%`)
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

    await page.getByRole('button', { name: 'Nuovo evento', exact: true }).click()
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

  test('login -> export downloads a real xlsx file', async ({ page }) => {
    const auditNumber = `EXPORT-E2E-${suffix}`

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

    const { error: eventError } = await service.from('calendar_events').insert({
      audit_id: audit!.id,
      auditor_id: auditorId,
      start_datetime: '2026-05-20T09:00:00.000Z',
      end_datetime: '2026-05-20T17:00:00.000Z',
      all_day: false,
      title: 'Evento export E2E',
      status: 'pianificato',
      performed_status: 'no',
      ente: `E2E_${suffix}`,
    })
    expect(eventError).toBeNull()

    await login(page, email, password, '/audit')
    await page.getByPlaceholder('Cerca per azienda, auditor, n. audit, norma...').fill(auditNumber)

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Esporta Excel' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/lista-eventi-audit-\d{4}-\d{2}-\d{2}\.xlsx/)
    expect(await download.path()).toBeTruthy()
  })

  test('viewer can read but cannot see mutation actions', async ({ page }) => {
    const auditNumber = `VIEW-E2E-${suffix}`

    const { error: roleError } = await service.from('profiles').update({ role: 'viewer' }).eq('user_id', userId)
    expect(roleError).toBeNull()

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

    const { error: eventError } = await service.from('calendar_events').insert({
      audit_id: audit!.id,
      auditor_id: auditorId,
      start_datetime: '2026-05-21T09:00:00.000Z',
      end_datetime: '2026-05-21T17:00:00.000Z',
      all_day: false,
      title: 'Evento viewer E2E',
      status: 'pianificato',
      performed_status: 'no',
      ente: `E2E_${suffix}`,
    })
    expect(eventError).toBeNull()

    await login(page, email, password, '/audit')
    await expect(page.getByRole('button', { name: 'Nuovo evento' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Esporta Excel' })).toBeVisible()

    const row = page.getByTestId('audit-event-row').filter({ hasText: auditNumber })
    await expect(row).toBeVisible()
    await expect(row.getByTitle('Modifica')).toHaveCount(0)
    await expect(row.getByTitle('Annulla / Elimina')).toHaveCount(0)

    await row.getByTitle('Apri').click()
    const detailDrawer = page.getByTestId('event-detail-drawer')
    await expect(detailDrawer.getByText(auditNumber).first()).toBeVisible()
    await expect(detailDrawer.getByRole('button', { name: 'Modifica' })).toHaveCount(0)
    await expect(detailDrawer.getByRole('button', { name: 'Annulla' })).toHaveCount(0)

    await page.goto('/clienti')
    await expect(page.getByRole('button', { name: 'Nuovo cliente' })).toHaveCount(0)
  })

  test('login -> create registries -> they appear in the event form', async ({ page }) => {
    const createdClientName = `Cliente Registro ${suffix}`
    const createdAuditorName = `Auditor Registro ${suffix}`
    const createdStandardCode = `REG-E2E-${suffix.slice(0, 8)}`

    await login(page, email, password, '/clienti')
    await expect(page.getByRole('heading', { name: 'Aziende', level: 2 })).toBeVisible()
    await page.getByRole('button', { name: 'Nuovo cliente' }).click()
    await page.getByLabel('Ragione sociale').fill(createdClientName)
    await page.getByLabel('Provincia').fill('MI')
    await page.getByRole('button', { name: 'Crea cliente' }).click()
    await expect(page.getByTestId('client-row').filter({ hasText: createdClientName })).toBeVisible()

    await page.goto('/auditor')
    await expect(page.getByRole('heading', { name: 'Auditor', level: 2 })).toBeVisible()
    await page.getByRole('button', { name: 'Nuovo auditor' }).click()
    await page.getByLabel('Nome').fill(createdAuditorName)
    await page.getByLabel('Email').fill(`auditor-${suffix}@example.invalid`)
    await page.getByRole('button', { name: 'Crea auditor' }).click()
    await expect(page.getByTestId('auditor-row').filter({ hasText: createdAuditorName })).toBeVisible()

    await page.goto('/norme')
    await expect(page.getByRole('heading', { name: 'Norme', level: 2 })).toBeVisible()
    await page.getByRole('button', { name: 'Nuova norma' }).click()
    await page.getByLabel('Codice').fill(createdStandardCode)
    await page.getByLabel('Nome').fill(`Norma Registro ${suffix}`)
    await page.getByRole('button', { name: 'Crea norma' }).click()
    await expect(page.getByTestId('standard-row').filter({ hasText: createdStandardCode })).toBeVisible()

    await page.goto('/calendario')
    await page.getByRole('button', { name: 'Nuovo evento', exact: true }).click()
    const formDrawer = page.getByTestId('event-form-drawer').filter({ hasText: 'Nuovo evento audit' })
    await expect(formDrawer).toBeVisible()
    await expect(formDrawer.getByLabel('Azienda / Cliente').locator(`option`, { hasText: createdClientName })).toHaveCount(1)
    await expect(formDrawer.getByLabel('Auditor').locator(`option`, { hasText: createdAuditorName })).toHaveCount(1)
    await formDrawer.getByText('Aggiungi').click()
    await expect(formDrawer.getByText(createdStandardCode)).toBeVisible()
  })

  test('login -> open event -> upload attachment -> see it -> download it', async ({ page }) => {
    const auditNumber = `ATTACH-E2E-${suffix}`
    const fileName = `allegato-${suffix}.txt`

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

    const { error: eventError } = await service.from('calendar_events').insert({
      audit_id: audit!.id,
      auditor_id: auditorId,
      start_datetime: '2026-05-22T09:00:00.000Z',
      end_datetime: '2026-05-22T17:00:00.000Z',
      all_day: false,
      title: 'Evento allegati E2E',
      status: 'pianificato',
      performed_status: 'no',
      ente: `E2E_${suffix}`,
    })
    expect(eventError).toBeNull()

    await login(page, email, password, '/audit')
    await page.getByPlaceholder('Cerca per azienda, auditor, n. audit, norma...').fill(auditNumber)

    const row = page.getByTestId('audit-event-row').filter({ hasText: auditNumber })
    await expect(row).toBeVisible()
    await row.getByTitle('Apri').click()

    const panel = page.getByTestId('event-attachments-panel')
    await expect(panel.getByRole('heading', { name: 'Allegati' })).toBeVisible()
    await panel.getByLabel('Categoria').selectOption('rapporto')
    await panel.locator('input[type="file"]').setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from(`contenuto allegato ${suffix}`),
    })

    const attachmentRow = panel.getByTestId('event-attachment-row').filter({ hasText: fileName })
    await expect(attachmentRow).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await attachmentRow.getByRole('button', { name: 'Scarica' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe(fileName)
    expect(await download.path()).toBeTruthy()
  })
})
