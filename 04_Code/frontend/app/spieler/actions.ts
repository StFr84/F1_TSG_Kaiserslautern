'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export function validatePlayer(data: { first_name: string; birth_year: number }): boolean {
  const currentYear = new Date().getFullYear()
  return (
    data.first_name.trim().length > 0 &&
    data.birth_year >= 1990 &&
    data.birth_year <= currentYear
  )
}

export async function addPlayer(formData: FormData) {
  const first_name = formData.get('first_name') as string
  const birth_year = parseInt(formData.get('birth_year') as string)
  if (!validatePlayer({ first_name, birth_year })) throw new Error('Ungültige Daten')
  const supabase = await createClient()
  const { error } = await supabase.from('players').insert({
    team_id: TEAM_ID,
    first_name: first_name.trim(),
    birth_year,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}

export async function deletePlayer(playerId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}
