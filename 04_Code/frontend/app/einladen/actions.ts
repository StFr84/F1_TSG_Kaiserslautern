'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type State = { error: string; success: boolean }

export async function inviteParent(prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string
  const full_name = formData.get('full_name') as string
  if (!email || !full_name) return { error: 'E-Mail und Name erforderlich', success: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt', success: false }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') return { error: 'Keine Berechtigung', success: false }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${process.env.VERCEL_URL}`
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role: 'parent' },
    redirectTo: `${siteUrl}/auth/callback`,
  })
  if (error) return { error: error.message, success: false }

  return { error: '', success: true }
}

export async function deleteInvite(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') throw new Error('Keine Berechtigung')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  revalidatePath('/einladen')
}
