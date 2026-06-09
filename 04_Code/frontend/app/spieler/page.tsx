import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addPlayer } from './actions'
import SpielerItem from './SpielerItem'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export default async function SpielerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  const { data: players } = await supabase
    .from('players').select('*').eq('team_id', TEAM_ID).order('first_name')

  const { data: parents } = await supabase
    .from('profiles').select('id, full_name, role').order('full_name')

  return (
    <div className="px-4 py-6">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Spieler</h1>
        {players?.length ? (
          <span className="text-sm text-gray-400">{players.length} im Kader</span>
        ) : null}
      </div>

      <form action={addPlayer} className="mb-6 flex gap-2">
        <input name="first_name" placeholder="Vorname" required
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
        <button type="submit"
          className="px-5 py-2.5 rounded-lg text-white text-sm font-medium bg-[#9B1C2E]">+</button>
      </form>

      <ul className="space-y-3">
        {players?.map((player, index) => (
          <SpielerItem
            key={player.id}
            player={player}
            index={index + 1}
            parents={parents ?? []}
          />
        ))}
      </ul>

      {!players?.length && (
        <p className="text-sm text-gray-500 text-center py-8">Noch keine Spieler eingetragen.</p>
      )}
    </div>
  )
}
