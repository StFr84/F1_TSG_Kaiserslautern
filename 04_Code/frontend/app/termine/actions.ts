'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { error } = await supabase.from('events').insert({
    team_id: TEAM_ID,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    starts_at: formData.get('starts_at') as string,
    location: (formData.get('location') as string) || null,
    opponent: (formData.get('opponent') as string) || null,
    meetup_at: (formData.get('meetup_at') as string) || null,
    rsvp_deadline: (formData.get('rsvp_deadline') as string) || null,
    created_by: user.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/termine')
  redirect('/termine')
}
