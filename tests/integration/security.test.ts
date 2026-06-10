import { config } from 'dotenv'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

config({ path: '.env.local' })

const supabaseUrl = process.env.TEST_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.TEST_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const attachmentBucket = 'event-attachments'

const hasSupabaseTestEnv = Boolean(supabaseUrl && anonKey && serviceRoleKey)
const describeIfSupabase = hasSupabaseTestEnv ? describe : describe.skip

type TestUser = {
  email: string
  password: string
  userId: string
}

function authClient() {
  return createClient(supabaseUrl!, anonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function signIn(email: string, password: string) {
  const client = authClient()
  const { error } = await client.auth.signInWithPassword({ email, password })
  expect(error).toBeNull()
  return client
}

async function createUser(
  service: SupabaseClient,
  suffix: string,
  role: 'admin' | 'operator' | 'viewer',
  ente: string,
  seesAll = false
): Promise<TestUser> {
  const email = `test-${role}-${suffix}@example.invalid`
  const password = `Test-${suffix}-Password1`
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  expect(error).toBeNull()
  expect(data.user?.id).toBeTruthy()

  const userId = data.user!.id
  const { error: profileError } = await service.from('profiles').insert({
    user_id: userId,
    full_name: `Test ${role}`,
    role,
    ente,
    sees_all: seesAll,
  })

  if (profileError) {
    await service.auth.admin.deleteUser(userId)
  }

  expect(profileError).toBeNull()
  return { email, password, userId }
}

describeIfSupabase('security base: INV-1 / INV-2 / INV-3', () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const enteA = `ENTE_A_${suffix}`
  const enteB = `ENTE_B_${suffix}`
  const clientAId = crypto.randomUUID()
  const clientBId = crypto.randomUUID()
  const auditAId = crypto.randomUUID()
  const auditBId = crypto.randomUUID()
  const eventAId = crypto.randomUUID()
  const eventBId = crypto.randomUUID()
  const attachmentAId = crypto.randomUUID()
  const attachmentBId = crypto.randomUUID()
  const attachmentAPath = `${enteA}/${eventAId}/a-${suffix}.txt`
  const attachmentBPath = `${enteB}/${eventBId}/b-${suffix}.txt`
  const insertedClientIds = new Set<string>([clientAId, clientBId])
  let service: SupabaseClient
  let operatorA: TestUser
  let viewerA: TestUser
  let seesAllAdmin: TestUser

  beforeAll(async () => {
    service = createClient(supabaseUrl!, serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    operatorA = await createUser(service, suffix, 'operator', enteA)
    viewerA = await createUser(service, suffix, 'viewer', enteA)
    seesAllAdmin = await createUser(service, suffix, 'admin', enteA, true)

    const { error } = await service.from('clients').insert([
      {
        id: clientAId,
        company_name: `Cliente A ${suffix}`,
        ente: enteA,
        active: true,
      },
      {
        id: clientBId,
        company_name: `Cliente B ${suffix}`,
        ente: enteB,
        active: true,
      },
    ])

    expect(error).toBeNull()

    const { error: auditError } = await service.from('audits').insert([
      {
        id: auditAId,
        audit_number: `ATT-A-${suffix}`,
        client_id: clientAId,
        status: 'pianificato',
        ente: enteA,
      },
      {
        id: auditBId,
        audit_number: `ATT-B-${suffix}`,
        client_id: clientBId,
        status: 'pianificato',
        ente: enteB,
      },
    ])
    expect(auditError).toBeNull()

    const { error: eventError } = await service.from('calendar_events').insert([
      {
        id: eventAId,
        audit_id: auditAId,
        start_datetime: '2026-05-16T09:00:00.000Z',
        end_datetime: '2026-05-16T17:00:00.000Z',
        all_day: false,
        title: `Attachment A ${suffix}`,
        status: 'pianificato',
        performed_status: 'no',
        ente: enteA,
      },
      {
        id: eventBId,
        audit_id: auditBId,
        start_datetime: '2026-05-17T09:00:00.000Z',
        end_datetime: '2026-05-17T17:00:00.000Z',
        all_day: false,
        title: `Attachment B ${suffix}`,
        status: 'pianificato',
        performed_status: 'no',
        ente: enteB,
      },
    ])
    expect(eventError).toBeNull()

    const { error: uploadError } = await service.storage.from(attachmentBucket).upload(attachmentAPath, `file A ${suffix}`, {
      contentType: 'text/plain',
      upsert: true,
    })
    expect(uploadError).toBeNull()

    const { error: uploadBError } = await service.storage.from(attachmentBucket).upload(attachmentBPath, `file B ${suffix}`, {
      contentType: 'text/plain',
      upsert: true,
    })
    expect(uploadBError).toBeNull()

    const { error: attachmentError } = await service.from('event_attachments').insert([
      {
        id: attachmentAId,
        event_id: eventAId,
        ente: enteA,
        categoria: 'rapporto',
        nome_file: `a-${suffix}.txt`,
        storage_path: attachmentAPath,
      },
      {
        id: attachmentBId,
        event_id: eventBId,
        ente: enteB,
        categoria: 'fattura',
        nome_file: `b-${suffix}.txt`,
        storage_path: attachmentBPath,
      },
    ])
    expect(attachmentError).toBeNull()
  })

  afterAll(async () => {
    if (!service) return

    const userIds = [operatorA?.userId, viewerA?.userId, seesAllAdmin?.userId].filter((id): id is string => Boolean(id))

    await service.storage.from(attachmentBucket).remove([attachmentAPath, attachmentBPath])
    await service.from('event_attachments').delete().in('id', [attachmentAId, attachmentBId])
    await service.from('calendar_events').delete().in('id', [eventAId, eventBId])
    await service.from('audits').delete().in('id', [auditAId, auditBId])
    await service.from('clients').delete().in('id', [...insertedClientIds])
    await service.from('profiles').delete().in('user_id', userIds)

    for (const user of [operatorA, viewerA, seesAllAdmin]) {
      if (user?.userId) {
        await service.auth.admin.deleteUser(user.userId)
      }
    }
  })

  it('INV-1: user of ente A cannot read ente B rows', async () => {
    const client = await signIn(operatorA.email, operatorA.password)
    const { data, error } = await client.from('clients').select('id, ente').in('id', [clientAId, clientBId])

    expect(error).toBeNull()
    expect(data).toEqual([{ id: clientAId, ente: enteA }])
  })

  it('INV-1: sees_all can read all tenant rows but cannot write another ente', async () => {
    const client = await signIn(seesAllAdmin.email, seesAllAdmin.password)
    const { data, error } = await client.from('clients').select('id, ente').in('id', [clientAId, clientBId])

    expect(error).toBeNull()
    expect(data?.map((row) => row.id).sort()).toEqual([clientAId, clientBId].sort())

    const forbiddenId = crypto.randomUUID()
    insertedClientIds.add(forbiddenId)
    const { error: insertError } = await client.from('clients').insert({
      id: forbiddenId,
      company_name: `Cross ente ${suffix}`,
      ente: enteB,
      active: true,
    })

    expect(insertError).not.toBeNull()
  })

  it('INV-1: user of ente A cannot write rows for ente B', async () => {
    const client = await signIn(operatorA.email, operatorA.password)
    const forbiddenId = crypto.randomUUID()
    insertedClientIds.add(forbiddenId)
    const { error } = await client.from('clients').insert({
      id: forbiddenId,
      company_name: `Forbidden ${suffix}`,
      ente: enteB,
      active: true,
    })

    expect(error).not.toBeNull()
  })

  it('INV-2: anonymous clients cannot read or mutate tenant data', async () => {
    const client = authClient()
    const { data, error } = await client.from('clients').select('id').in('id', [clientAId, clientBId])

    expect(error).toBeNull()
    expect(data).toEqual([])

    const forbiddenId = crypto.randomUUID()
    insertedClientIds.add(forbiddenId)
    const { error: insertError } = await client.from('clients').insert({
      id: forbiddenId,
      company_name: `Anon ${suffix}`,
      ente: enteA,
      active: true,
    })

    expect(insertError).not.toBeNull()
  })

  it('INV-3: viewer cannot mutate data', async () => {
    const client = await signIn(viewerA.email, viewerA.password)
    const forbiddenId = crypto.randomUUID()
    insertedClientIds.add(forbiddenId)
    const { error } = await client.from('clients').insert({
      id: forbiddenId,
      company_name: `Viewer ${suffix}`,
      ente: enteA,
      active: true,
    })

    expect(error).not.toBeNull()
  })

  it('INV-3: operator can mutate own ente data but cannot manage users', async () => {
    const client = await signIn(operatorA.email, operatorA.password)
    const allowedId = crypto.randomUUID()
    insertedClientIds.add(allowedId)
    const { error: clientError } = await client.from('clients').insert({
      id: allowedId,
      company_name: `Allowed ${suffix}`,
      ente: enteA,
      active: true,
    })

    expect(clientError).toBeNull()

    const { error: profileError } = await client.from('profiles').insert({
      user_id: crypto.randomUUID(),
      full_name: 'Forbidden profile',
      role: 'viewer',
      ente: enteA,
    })

    expect(profileError).not.toBeNull()
  })

  it('INV-7: user of ente A cannot list or sign files of ente B', async () => {
    const bucket = await service.storage.getBucket(attachmentBucket)
    expect(bucket.error).toBeNull()
    expect(bucket.data?.public).toBe(false)

    const client = await signIn(operatorA.email, operatorA.password)
    const { data, error } = await client
      .from('event_attachments')
      .select('id, event_id, ente, storage_path')
      .in('event_id', [eventAId, eventBId])

    expect(error).toBeNull()
    expect(data).toEqual([
      {
        id: attachmentAId,
        event_id: eventAId,
        ente: enteA,
        storage_path: attachmentAPath,
      },
    ])

    const ownSignedUrl = await client.storage.from(attachmentBucket).createSignedUrl(attachmentAPath, 60)
    expect(ownSignedUrl.error).toBeNull()
    expect(ownSignedUrl.data?.signedUrl).toContain('/object/sign/')
    expect(ownSignedUrl.data?.signedUrl).not.toContain('/object/public/')

    const forbiddenSignedUrl = await client.storage.from(attachmentBucket).createSignedUrl(attachmentBPath, 60)
    expect(forbiddenSignedUrl.error).not.toBeNull()
    expect(forbiddenSignedUrl.data?.signedUrl).toBeFalsy()
  })
})
