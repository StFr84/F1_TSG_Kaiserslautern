'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { validateContact } from './validate-contact'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export async function inviteContact(playerId: string, formData: FormData) {
  const full_name = (formData.get('full_name') as string) ?? ''
  const role = (formData.get('role') as string) ?? ''
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase()
  const phone = ((formData.get('phone') as string) ?? '').trim() || null

  const validationError = validateContact({ full_name, email, role })
  if (validationError) throw new Error(validationError)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht angemeldet')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') throw new Error('Nur Trainer können Kontakte einladen')

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('player_contacts')
    .select('id')
    .eq('player_id', playerId)
    .eq('email', email)
    .maybeSingle()

  if (!existing) {
    const { error: insertError } = await admin
      .from('player_contacts')
      .insert({ player_id: playerId, full_name: full_name.trim(), role, email, phone, status: 'pending' })
    if (insertError) throw new Error(insertError.message)
  }

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name.trim(), role: 'parent' },
    redirectTo: `${SITE_URL}/auth/callback`,
  })
  // All invite errors are non-fatal: the player_contacts entry is already in the DB.
  // Email delivery failures (rate limit, SMTP config, already registered) can be retried.

  revalidatePath('/spieler')
}
