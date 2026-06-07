import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profil</h1>
      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-[#9B1C2E] flex items-center justify-center flex-shrink-0">
          <User size={28} color="white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile?.full_name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#9B1C2E]/10 text-[#9B1C2E]">
            {profile?.role === 'trainer' ? 'Trainer' : 'Elternteil'}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-400 text-center">Weitere Profil-Einstellungen folgen in einer späteren Version.</p>
    </div>
  )
}
