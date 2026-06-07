'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RSVPStatus } from '@/lib/types'

export async function upsertRSVP(eventId: string, playerId: string, status: RSVPStatus, reason?: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('rsvps').upsert(
    { event_id: eventId, player_id: playerId, status, reason: reason || null, updated_at: new Date().toISOString() },
    { onConflict: 'event_id,player_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath(`/termine/${eventId}`)
}
