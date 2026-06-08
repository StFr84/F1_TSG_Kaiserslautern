'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PasswortSetzenPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben.')
      return
    }
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/')
  }

  return (
    <div className="px-4 py-10 max-w-sm mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Passwort festlegen</h1>
      <p className="text-sm text-gray-500 mb-6">
        Wähle ein Passwort, mit dem du dich zukünftig einloggst.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="Mindestens 8 Zeichen"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passwort wiederholen</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="Passwort bestätigen"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-white font-medium bg-[#9B1C2E] disabled:opacity-50"
        >
          {loading ? 'Wird gespeichert…' : 'Passwort speichern'}
        </button>
      </form>
    </div>
  )
}
