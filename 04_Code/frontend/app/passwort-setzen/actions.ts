'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function linkContactToUser(userId: string, email: string) {
  const admin = createAdminClient()
  await admin
    .from('player_contacts')
    .update({ user_id: userId, status: 'active' })
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
}
