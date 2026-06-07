import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { inviteParent } from './actions'

export default async function EinladenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Elternteil einladen</h1>
      <p className="text-sm text-gray-500 mb-6">Das Elternteil erhält eine E-Mail mit einem Einladungslink.</p>
      <form action={inviteParent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="full_name" required placeholder="Vorname Nachname"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input name="email" type="email" required placeholder="elternteil@beispiel.de"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium bg-[#9B1C2E]">
          Einladung senden
        </button>
      </form>
    </div>
  )
}
