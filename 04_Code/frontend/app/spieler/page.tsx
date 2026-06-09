import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KaderListe from './KaderListe'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export default async function KaderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  const { data: players } = await supabase
    .from('players')
    .select('id, first_name')
    .eq('team_id', TEAM_ID)
    .order('first_name')

  const playerIds = (players ?? []).map(p => p.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contacts: any[] = []
  if (playerIds.length) {
    const { data } = await supabase
      .from('player_contacts')
      .select('*')
      .in('player_id', playerIds)
      .order('created_at')
    contacts = data ?? []
  }

  return (
    <div>
      <div className="bg-[#9B1C2E] px-4 pt-8 pb-5">
        <p className="text-white/65 text-xs mb-0.5">TSG 1861 Kaiserslautern</p>
        <h1 className="text-white text-xl font-bold">Kader</h1>
        <p className="text-white/60 text-xs mt-1">{players?.length ?? 0} Spieler</p>
      </div>
      <KaderListe players={players ?? []} contacts={contacts} />
    </div>
  )
}
