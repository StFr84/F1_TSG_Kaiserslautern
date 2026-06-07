import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatEventDate, formatEventTime } from '@/lib/format'
import { getDefaultRSVP, isDeadlinePassed } from '@/lib/rsvp'
import RSVPButtons from './RSVPButtons'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
  if (!event) notFound()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const playerQuery = supabase.from('players').select('*')
  if (profile?.role === 'parent') {
    playerQuery.eq('parent_id', user.id)
  } else {
    playerQuery.eq('team_id', event.team_id)
  }
  const { data: players } = await playerQuery.order('first_name')

  const { data: rsvps } = await supabase.from('rsvps').select('*')
    .eq('event_id', event.id)
    .in('player_id', players?.map(p => p.id) || [])

  const rsvpMap = Object.fromEntries((rsvps || []).map(r => [r.player_id, r]))
  const deadlinePassed = isDeadlinePassed(event.rsvp_deadline)

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h1>
      <p className="text-sm text-gray-500 mb-1">{formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}</p>
      {event.location && <p className="text-sm text-gray-500 mb-2">{event.location}</p>}
      {event.type === 'game' && event.opponent && (
        <p className="text-sm font-medium text-gray-700 mb-2">vs. {event.opponent}</p>
      )}
      {event.rsvp_deadline && (
        <p className={`text-xs mb-4 ${deadlinePassed ? 'text-red-500' : 'text-amber-600'}`}>
          {deadlinePassed ? 'Deadline abgelaufen' : `Deadline: ${formatEventDate(event.rsvp_deadline)}`}
        </p>
      )}

      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {event.type === 'training' ? 'Abmeldungen' : 'Zusagen / Absagen'}
      </h2>

      <ul className="space-y-2">
        {players?.map(player => {
          const existing = rsvpMap[player.id]
          const currentStatus = existing?.status || getDefaultRSVP(event.type)
          return (
            <li key={player.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium text-sm text-gray-900">{player.first_name}</p>
                <p className="text-xs text-gray-400">Jg. {player.birth_year}</p>
              </div>
              <RSVPButtons eventId={event.id} playerId={player.id} eventType={event.type}
                currentStatus={currentStatus} disabled={deadlinePassed && profile?.role !== 'trainer'} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
