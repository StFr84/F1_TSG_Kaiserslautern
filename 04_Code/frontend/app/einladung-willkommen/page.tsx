import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function EinladungWillkommenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) redirect('/login')

  const admin = createAdminClient()

  const { data: contact } = await admin
    .from('player_contacts')
    .select('full_name, role, player_id')
    .eq('email', user.email!.toLowerCase())
    .eq('status', 'pending')
    .maybeSingle()

  let playerName: string | null = null
  if (contact?.player_id) {
    const { data: player } = await admin
      .from('players')
      .select('first_name')
      .eq('id', contact.player_id)
      .maybeSingle()
    playerName = player?.first_name ?? null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#9B1C2E]/10 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#9B1C2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center">Willkommen!</h1>
          {playerName ? (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Du wurdest als{' '}
              <span className="font-medium text-gray-700">{contact?.role || 'Elternteil'}</span>{' '}
              von{' '}
              <span className="font-medium text-gray-700">{playerName}</span>{' '}
              eingeladen.
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Du wurdest zur TSG Connect App eingeladen.
            </p>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 text-center">
          Lege jetzt ein Passwort fest, um dich zukünftig einzuloggen.
        </div>

        <Link
          href="/passwort-setzen"
          className="block w-full py-2.5 rounded-lg text-white font-medium text-sm text-center bg-[#9B1C2E]"
        >
          Passwort festlegen
        </Link>
      </div>
    </div>
  )
}
