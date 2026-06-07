'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { RSVPStatus } from '@/lib/types'

export async function deleteEvent(eventId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) throw new Error(error.message)
  revalidatePath('/termine')
  redirect('/termine')
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')
  const { error } = await supabase.from('events').update({
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    starts_at: formData.get('starts_at') as string,
    location: (formData.get('location') as string) || null,
    opponent: (formData.get('opponent') as string) || null,
    meetup_at: (formData.get('meetup_at') as string) || null,
    rsvp_deadline: (formData.get('rsvp_deadline') as string) || null,
  }).eq('id', eventId)
  if (error) throw new Error(error.message)
  revalidatePath('/termine')
  revalidatePath(`/termine/${eventId}`)
  redirect(`/termine/${eventId}`)
}

export async function upsertRSVP(eventId: string, playerId: string, status: RSVPStatus, reason?: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('rsvps').upsert(
    { event_id: eventId, player_id: playerId, status, reason: reason || null, updated_at: new Date().toISOString() },
    { onConflict: 'event_id,player_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath(`/termine/${eventId}`)
}
