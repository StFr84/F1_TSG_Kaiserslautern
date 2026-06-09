'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validatePlayer } from './validate'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export async function addPlayer(formData: FormData) {
  const first_name = formData.get('first_name') as string
  if (!validatePlayer({ first_name })) throw new Error('Ungültige Daten')
  const supabase = await createClient()
  const { error } = await supabase.from('players').insert({
    team_id: TEAM_ID,
    first_name: first_name.trim(),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}

export async function renamePlayer(playerId: string, first_name: string) {
  if (!first_name.trim()) return
  const supabase = await createClient()
  const { error } = await supabase.from('players').update({ first_name: first_name.trim() }).eq('id', playerId)
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}

export async function deletePlayer(playerId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}

export async function assignParent(playerId: string, formData: FormData) {
  const parent_id = (formData.get('parent_id') as string) || null
  const supabase = await createClient()
  const { error } = await supabase.from('players').update({ parent_id }).eq('id', playerId)
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}
