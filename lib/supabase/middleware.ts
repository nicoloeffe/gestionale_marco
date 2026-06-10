import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { DEV_SESSION_COOKIE, getDevSessionId, hasSupabaseAuthCookie } from '@/lib/dev-session'
import { getSupabaseEnv } from '@/lib/env'

const publicPaths = ['/login', '/auth/login']

function isPublicPath(pathname: string) {
  return publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { url, anonKey, isConfigured } = getSupabaseEnv()
  const pathname = request.nextUrl.pathname
  const devSessionId = getDevSessionId()
  const requestCookies = request.cookies.getAll()
  const devSessionCookie = request.cookies.get(DEV_SESSION_COOKIE)?.value

  if (devSessionId && hasSupabaseAuthCookie(requestCookies) && devSessionCookie !== devSessionId) {
    const nextResponse = isPublicPath(pathname)
      ? NextResponse.next({ request })
      : NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url))

    requestCookies
      .filter(
        (cookie) =>
          cookie.name === DEV_SESSION_COOKIE || (cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')),
      )
      .forEach((cookie) => {
        nextResponse.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
        })
      })

    return nextResponse
  }

  if (!isConfigured) {
    if (isPublicPath(pathname)) return response

    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    loginUrl.searchParams.set('missing_config', '1')
    return NextResponse.redirect(loginUrl)
  }

  const supabase = createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathname === '/login') {
    const nextPath = request.nextUrl.searchParams.get('next') || '/'
    const nextUrl = request.nextUrl.clone()
    nextUrl.pathname = nextPath.startsWith('/') ? nextPath : '/'
    nextUrl.search = ''
    return NextResponse.redirect(nextUrl)
  }

  return response
}
