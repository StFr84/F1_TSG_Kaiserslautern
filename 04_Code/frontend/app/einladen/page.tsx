import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EinladenForm from './EinladenForm'

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
      <EinladenForm />
    </div>
  )
}
