'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changeRole(userId: string, role: string): Promise<void> {
  if (!['trainer', 'parent'].includes(role)) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles').select('is_lead').eq('id', user.id).single()
  if (!profile?.is_lead) return

  await supabase.from('profiles').update({ role }).eq('id', userId)
  revalidatePath('/profil')
}

export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt' }

  const { data: profile } = await supabase
    .from('profiles').select('is_lead').eq('id', user.id).single()
  if (!profile?.is_lead) return { error: 'Keine Berechtigung' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${process.env.VERCEL_URL}`
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/passwort-setzen`,
  })
  return { error: error?.message ?? null }
}
