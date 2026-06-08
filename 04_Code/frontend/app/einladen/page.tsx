import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import EinladenForm from './EinladenForm'
import { deleteInvite } from './actions'
import { Trash2 } from 'lucide-react'

export default async function EinladenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  const admin = createAdminClient()
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 200 })
  const pending = users.filter(u => u.invited_at && !u.confirmed_at)

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Elternteil einladen</h1>
      <p className="text-sm text-gray-500 mb-6">Das Elternteil erhält eine E-Mail mit einem Einladungslink.</p>
      <EinladenForm />

      {pending.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Ausstehende Einladungen ({pending.length})
          </p>
          <ul className="space-y-2">
            {pending.map(u => (
              <li key={u.id} className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {u.user_metadata?.full_name ?? '–'}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <form action={deleteInvite.bind(null, u.id)}>
                  <button type="submit" className="p-2 rounded-lg text-red-400 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
