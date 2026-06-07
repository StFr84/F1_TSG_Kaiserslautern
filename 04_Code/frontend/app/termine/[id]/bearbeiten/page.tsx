import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import BearbeitenForm from './BearbeitenForm'

export default async function BearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect(`/termine/${id}`)

  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
  if (!event) notFound()

  return <BearbeitenForm event={event} />
}
