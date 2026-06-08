import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import NutzerTab from './NutzerTab'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, role, is_lead').eq('id', user.id).single()

  let nutzerUsers: { id: string; email: string; full_name: string; role: string }[] = []

  if (profile?.role === 'trainer') {
    const admin = createAdminClient()
    const [{ data: { users: authUsers } }, { data: profiles }] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 200 }),
      admin.from('profiles').select('id, full_name, role'),
    ])
    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
    nutzerUsers = (authUsers ?? [])
      .filter(u => u.confirmed_at)
      .map(u => ({
        id: u.id,
        email: u.email ?? '',
        full_name: profileMap.get(u.id)?.full_name ?? (u.user_metadata?.full_name as string) ?? '',
        role: profileMap.get(u.id)?.role ?? 'parent',
      }))
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#9B1C2E] flex items-center justify-center flex-shrink-0">
          <User size={22} color="white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{profile?.full_name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          <span className="inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-[#9B1C2E]/10 text-[#9B1C2E]">
            {profile?.role === 'trainer' ? 'Trainer' : 'Elternteil'}
          </span>
        </div>
      </div>

      {profile?.role === 'trainer' ? (
        <NutzerTab users={nutzerUsers} isLead={profile?.is_lead ?? false} />
      ) : (
        <p className="text-sm text-gray-400 text-center">Weitere Profil-Einstellungen folgen in einer späteren Version.</p>
      )}
    </div>
  )
}
