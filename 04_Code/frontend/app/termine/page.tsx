import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trophy, Dumbbell, Calendar } from 'lucide-react'
import { formatEventDate, formatEventTime } from '@/lib/format'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'
const typeIcon = { training: Dumbbell, game: Trophy, other: Calendar }

export default async function TerminePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: events } = await supabase
    .from('events').select('*').eq('team_id', TEAM_ID)
    .gte('starts_at', new Date().toISOString()).order('starts_at')

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Termine</h1>
        {profile?.role === 'trainer' && (
          <Link href="/termine/neu" className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-white bg-[#9B1C2E]">
            <Plus size={16} /> Neu
          </Link>
        )}
      </div>
      <ul className="space-y-3">
        {events?.map(event => {
          const Icon = typeIcon[event.type as keyof typeof typeIcon] || Calendar
          return (
            <li key={event.id}>
              <Link href={`/termine/${event.id}`} className="block bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg p-2 bg-gray-50 flex-shrink-0">
                    <Icon size={20} color="#9B1C2E" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">{formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}</p>
                    {event.location && <p className="text-xs text-gray-400 mt-0.5">{event.location}</p>}
                    {event.type === 'game' && event.opponent && <p className="text-xs text-gray-400">vs. {event.opponent}</p>}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      {!events?.length && <p className="text-sm text-gray-500 text-center py-12">Keine bevorstehenden Termine.</p>}
    </div>
  )
}
