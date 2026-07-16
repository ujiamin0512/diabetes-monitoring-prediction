import { supabase } from './supabaseClient'
import type { NewReading, Reading } from './types'

export async function insertReading(reading: NewReading): Promise<Reading> {
  const { data, error } = await supabase
    .from('readings')
    .insert(reading)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Reading
}

export async function listReadings(memberId: string): Promise<Reading[]> {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data as Reading[]
}

export async function updateReading(readingId: string, updates: Partial<NewReading>): Promise<Reading> {
  const { data, error } = await supabase
    .from('readings')
    .update(updates)
    .eq('id', readingId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Reading
}
