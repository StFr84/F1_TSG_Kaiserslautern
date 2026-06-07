import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Dumbbell, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { formatEventDate, formatEventTime } from '@/lib/format'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'
const typeIcon = { training: Dumbbell, game: Trophy, other: Calendar }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: nextEvents } = await supabase
    .from('events').select('*').eq('team_id', TEAM_ID)
    .gte('starts_at', new Date().toISOString()).order('starts_at').limit(3)

  const playerQuery = supabase.from('players').select('*')
  if (profile?.role === 'parent') playerQuery.eq('parent_id', user.id)
  else playerQuery.eq('team_id', TEAM_ID)
  const { data: players } = await playerQuery

  const gameEvents = nextEvents?.filter(e => e.type === 'game') || []
  let pendingGames: typeof gameEvents = []
  if (gameEvents.length > 0 && players?.length) {
    const { data: existingRsvps } = await supabase
      .from('rsvps').select('event_id, player_id')
      .in('event_id', gameEvents.map(e => e.id))
      .in('player_id', players.map(p => p.id))
    const rsvpSet = new Set((existingRsvps || []).map(r => `${r.event_id}:${r.player_id}`))
    pendingGames = gameEvents.filter(event =>
      players.some(player => !rsvpSet.has(`${event.id}:${player.id}`))
    )
  }

  const nextEvent = nextEvents?.[0]

  return (
    <div>
      <div className="px-4 pt-10 pb-5 bg-[#9B1C2E]">
        <p className="text-white/70 text-sm">Willkommen</p>
        <h1 className="text-white text-xl font-bold">{profile?.full_name}</h1>
        <p className="text-white/60 text-xs mt-0.5">F1 · TSG 1861 Kaiserslautern</p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {nextEvent ? (
          <Link href={`/termine/${nextEvent.id}`}>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              {(() => { const Icon = typeIcon[nextEvent.type as keyof typeof typeIcon] || Calendar; return (
                <div className="rounded-lg p-2 bg-gray-50 flex-shrink-0"><Icon size={20} color="#9B1C2E" /></div>
              )})()}
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Nächster Termin</p>
                <p className="font-semibold text-gray-900">{nextEvent.title}</p>
                <p className="text-sm text-gray-500">{formatEventDate(nextEvent.starts_at)} · {formatEventTime(nextEvent.starts_at)}</p>
              </div>
              <ChevronRight size={18} className="text-gray-400 mt-1 flex-shrink-0" />
            </div>
          </Link>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Keine bevorstehenden Termine</p>
          </div>
        )}

        {pendingGames.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-600" />
              <p className="text-sm font-medium text-amber-800">Zusage ausstehend</p>
            </div>
            {pendingGames.map(event => (
              <Link key={event.id} href={`/termine/${event.id}`}>
                <p className="text-sm text-amber-700 underline">Spiel am {formatEventDate(event.starts_at)} →</p>
              </Link>
            ))}
          </div>
        )}

        {nextEvents && nextEvents.length > 1 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Weitere Termine</p>
            <ul className="space-y-1">
              {nextEvents.slice(1).map(event => {
                const Icon = typeIcon[event.type as keyof typeof typeIcon] || Calendar
                return (
                  <li key={event.id}>
                    <Link href={`/termine/${event.id}`} className="flex items-center gap-3 py-2">
                      <Icon size={16} color="#9ca3af" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{formatEventDate(event.starts_at)}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-400" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
