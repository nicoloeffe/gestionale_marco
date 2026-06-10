const devGlobal = globalThis as typeof globalThis & {
  __auditPlanDevSessionId?: string
}

export const DEV_SESSION_COOKIE = 'auditplan-dev-session'

export function getDevSessionId() {
  if (process.env.NODE_ENV !== 'development') return null

  devGlobal.__auditPlanDevSessionId ??= crypto.randomUUID()
  return devGlobal.__auditPlanDevSessionId
}

export function hasSupabaseAuthCookie(cookies: { name: string }[]) {
  return cookies.some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token'))
}

