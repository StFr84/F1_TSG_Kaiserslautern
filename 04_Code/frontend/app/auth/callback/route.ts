import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    const url = new URL(`${origin}/login`)
    url.searchParams.set('error', 'auth_callback_failed')
    return NextResponse.redirect(url)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      const url = new URL(`${origin}/login`)
      url.searchParams.set('error', 'auth_callback_failed')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
