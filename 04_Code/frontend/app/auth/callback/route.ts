import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(new URL('/einladung-willkommen', requestUrl.origin))
      }
    } catch {}
  }

  return NextResponse.redirect(new URL('/login?error=link-abgelaufen', requestUrl.origin))
}
