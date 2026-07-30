import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when both env vars are present — lets the app run in demo mode without a backend. */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // Not an error: the app falls back to local demo mode until Supabase is wired.
  console.info('[UZBalance] Supabase env not set — running in local demo mode.')
}

// A single shared client. Safe to import anywhere.
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'public-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

export type DbCompany = {
  id: string
  user_id: string
  name: string
  inn: string
  oked: string
  director: string
  accountant: string
  address: string
  tax_mode: 'general' | 'simple'
  bank_account: string
  bank_name: string
  mfo: string
  created_at: string
}

export type DbEntry = {
  id: string
  user_id: string
  company_id: string | null
  no: string
  date: string
  debit: string
  credit: string
  amount: number
  memo: string
  status: 'posted' | 'draft'
  doc: string
  created_at: string
}
