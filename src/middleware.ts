// src/middleware.ts
// Runs on every request to protected routes.
// Checks account_status and auto-lifts expired suspensions.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/editor', '/settings', '/browse', '/novel']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (!isProtected) return NextResponse.next()

  // Extract session token from Supabase auth cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Find the Supabase session cookie (format: sb-<ref>-auth-token)
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/)
  if (!tokenMatch) return NextResponse.next()

  let accessToken: string
  try {
    const decoded = decodeURIComponent(tokenMatch[1])
    const parsed = JSON.parse(decoded)
    accessToken = Array.isArray(parsed) ? parsed[0] : parsed.access_token
    if (!accessToken) return NextResponse.next()
  } catch {
    return NextResponse.next()
  }

  // Decode JWT to get user id without a DB call
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    const userId = payload.sub
    if (!userId) return NextResponse.next()

    // Fetch user status via Supabase REST API
    const res = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${userId}&select=account_status,status_expires_at`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!res.ok) return NextResponse.next()
    const rows = await res.json()
    const userData = rows?.[0]
    if (!userData) return NextResponse.next()

    const status = userData.account_status
    const expiresAt = userData.status_expires_at

    // Auto-lift expired suspension
    if (status === 'suspended' && expiresAt && new Date(expiresAt) <= new Date()) {
      await fetch(
        `${supabaseUrl}/rest/v1/users?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            account_status: 'active',
            status_reason: null,
            status_expires_at: null,
            status_updated_at: new Date().toISOString(),
          }),
        }
      )
      // Suspension lifted — let them through
      return NextResponse.next()
    }

    if (status === 'suspended' || status === 'permanently_banned') {
      const reason = status === 'permanently_banned' ? 'banned' : 'suspended'
      const loginUrl = new URL(`/login?status=${reason}`, request.url)
      const response = NextResponse.redirect(loginUrl)
      // Clear auth cookies to force sign-out
      response.cookies.set(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`, '', { maxAge: 0 })
      return response
    }

  } catch {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/editor/:path*',
    '/settings/:path*',
    '/browse/:path*',
    '/novel/:path*',
  ],
}