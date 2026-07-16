import { supabase } from './supabaseClient'
import type { Member, NewMember } from './types'

export async function listMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from('members').select('*').order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Member[]
}

export async function addMember(ownerId: string, member: NewMember): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .insert({ ...member, owner_id: ownerId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Member
}

export async function updateMember(memberId: string, updates: NewMember): Promise<Member> {
  const { data, error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Member
}

export function computeBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return Math.round(bmi * 10) / 10
}
