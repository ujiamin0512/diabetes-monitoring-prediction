import { supabase } from './supabaseClient'

export async function ensureAnonSession(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session?.user?.id) {
    return sessionData.session.user.id
  }

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Failed to start anonymous session')
  }
  return data.user.id
}
