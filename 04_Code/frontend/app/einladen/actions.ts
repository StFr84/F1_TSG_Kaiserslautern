'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function inviteParent(formData: FormData) {
  const email = formData.get('email') as string
  const full_name = formData.get('full_name') as string
  if (!email || !full_name) throw new Error('E-Mail und Name erforderlich')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') throw new Error('Keine Berechtigung')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role: 'parent' },
  })
  if (error) throw new Error(error.message)
}
