import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addPlayer, deletePlayer } from './actions'
import { Trash2 } from 'lucide-react'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export default async function SpielerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  const { data: players } = await supabase
    .from('players').select('*').eq('team_id', TEAM_ID).order('first_name')

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Spieler</h1>
      <form action={addPlayer} className="mb-6 space-y-2">
        <input name="first_name" placeholder="Vorname" required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
        <div className="flex gap-2">
          <input name="birth_year" type="number" placeholder="Jahrgang (z.B. 2014)" min={1990} max={new Date().getFullYear()} required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm" />
          <button type="submit" className="px-5 py-2.5 rounded-lg text-white text-sm font-medium bg-[#9B1C2E]">+</button>
        </div>
      </form>
      <ul className="space-y-2">
        {players?.map(player => (
          <li key={player.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{player.first_name}</p>
              <p className="text-xs text-gray-500">Jahrgang {player.birth_year}</p>
            </div>
            <form action={deletePlayer.bind(null, player.id)}>
              <button type="submit" className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </form>
          </li>
        ))}
      </ul>
      {!players?.length && (
        <p className="text-sm text-gray-500 text-center py-8">Noch keine Spieler eingetragen.</p>
      )}
    </div>
  )
}
