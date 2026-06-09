'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { validateContact } from './validate-contact'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${process.env.VERCEL_URL}` ?? 'http://localhost:3000'

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

  const { error: insertError } = await admin
    .from('player_contacts')
    .insert({ player_id: playerId, full_name: full_name.trim(), role, email, phone, status: 'pending' })
  if (insertError) throw new Error(insertError.message)

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: full_name.trim(), role: 'parent' },
    redirectTo: `${SITE_URL}/auth/callback`,
  })
  if (inviteError && !inviteError.message.includes('already been registered')) {
    throw new Error(inviteError.message)
  }

  revalidatePath('/spieler')
}
