'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      router.replace('/login?error=link-abgelaufen')
      return
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? '/login?error=link-abgelaufen' : '/einladung-willkommen')
      })
      return
    }

    // Implicit flow: email invites send #access_token=... in the URL hash.
    // @supabase/ssr defaults to PKCE and won't auto-process hash tokens,
    // so we read them manually and call setSession directly.
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const access_token = hashParams.get('access_token')
    const refresh_token = hashParams.get('refresh_token')

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(({ data: { session }, error }) => {
        router.replace(session && !error ? '/einladung-willkommen' : '/login?error=link-abgelaufen')
      })
      return
    }

    router.replace('/login?error=link-abgelaufen')
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400">Einladung wird verarbeitet…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Einladung wird verarbeitet…</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
