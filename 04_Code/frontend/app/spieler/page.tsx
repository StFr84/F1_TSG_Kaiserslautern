import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { addPlayer, deletePlayer, assignParent } from './actions'
import { Trash2, UserPlus } from 'lucide-react'

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
    .from('profiles').select('id, full_name').eq('role', 'parent').order('full_name')

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

      <ul className="space-y-3">
        {players?.map(player => {
          const linkedParent = parents?.find(p => p.id === player.parent_id)
          return (
            <li key={player.id} className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{player.first_name}</p>
                  <p className="text-xs text-gray-500">Jahrgang {player.birth_year}</p>
                </div>
                <form action={deletePlayer.bind(null, player.id)}>
                  <button type="submit" className="text-gray-400 p-1"><Trash2 size={16} /></button>
                </form>
              </div>

              <form action={assignParent.bind(null, player.id)} className="flex gap-2">
                <select name="parent_id" defaultValue={player.parent_id ?? ''}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white text-gray-700">
                  <option value="">Kein Elternteil</option>
                  {parents?.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
                <button type="submit"
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-medium bg-[#9B1C2E]">
                  ✓
                </button>
              </form>

              {!linkedParent && parents?.length === 0 && (
                <Link href="/einladen" className="flex items-center gap-1 text-xs text-[#9B1C2E]">
                  <UserPlus size={12} /> Elternteil einladen
                </Link>
              )}
            </li>
          )
        })}
      </ul>

      {!players?.length && (
        <p className="text-sm text-gray-500 text-center py-8">Noch keine Spieler eingetragen.</p>
      )}
    </div>
  )
}
