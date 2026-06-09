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

    // Implicit flow: Supabase sends #access_token=... in hash, client SDK picks it up
    let handled = false

    const timer = setTimeout(() => {
      if (!handled) router.replace('/login?error=link-abgelaufen')
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled) return
      if (event === 'SIGNED_IN' && session) {
        handled = true
        clearTimeout(timer)
        subscription.unsubscribe()
        router.replace('/einladung-willkommen')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (handled) return
      if (session) {
        handled = true
        clearTimeout(timer)
        subscription.unsubscribe()
        router.replace('/einladung-willkommen')
      }
    })

    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
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
