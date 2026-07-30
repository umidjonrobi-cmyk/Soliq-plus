import { supabase } from './supabase'
import type { DbCompany, DbEntry } from './supabase'
import { companies as mockCompanies, entries as mockEntries } from '../data/mock'

// ── Profile ──────────────────────────────────────────────────────────────────
export async function getProfile() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (error) throw error
  return data as { id: string; full_name: string; company_name: string; phone: string; seeded: boolean } | null
}

// ── Companies ────────────────────────────────────────────────────────────────
export async function listCompanies(): Promise<DbCompany[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as DbCompany[]
}

export type CompanyInput = Omit<DbCompany, 'id' | 'user_id' | 'created_at'>

export async function addCompany(input: CompanyInput): Promise<DbCompany> {
  const { data, error } = await supabase.from('companies').insert(input).select().single()
  if (error) throw error
  return data as DbCompany
}

// ── Entries ──────────────────────────────────────────────────────────────────
export async function listEntries(): Promise<DbEntry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as DbEntry[]
}

export type EntryInput = Omit<DbEntry, 'id' | 'user_id' | 'created_at'>

export async function addEntry(input: EntryInput): Promise<DbEntry> {
  const { data, error } = await supabase.from('entries').insert(input).select().single()
  if (error) throw error
  return data as DbEntry
}

// ── Seeding — populate a brand-new account with demo data on first login ──────
export async function seedIfNeeded(): Promise<void> {
  const profile = await getProfile()
  if (!profile || profile.seeded) return

  // Insert demo companies (Latin fields; user-owned via default auth.uid()).
  const companyRows = mockCompanies.map((c) => ({
    name: c.name,
    inn: c.inn,
    oked: c.oked,
    director: c.director,
    accountant: c.accountant,
    address: c.address[0],
    tax_mode: c.taxMode,
    bank_account: c.bankAccount,
    bank_name: c.bankName[0],
    mfo: c.mfo,
  }))
  const { data: inserted, error: cErr } = await supabase
    .from('companies')
    .insert(companyRows)
    .select('id')
  if (cErr) throw cErr

  const firstCompanyId = inserted?.[0]?.id ?? null

  // Insert demo journal entries, linked to the first seeded company.
  const entryRows = mockEntries.map((e) => ({
    company_id: firstCompanyId,
    no: e.no,
    date: e.date,
    debit: e.debit,
    credit: e.credit,
    amount: e.amount,
    memo: e.memo[0],
    status: e.status,
    doc: e.doc,
  }))
  const { error: eErr } = await supabase.from('entries').insert(entryRows)
  if (eErr) throw eErr

  // Mark seeded so this only runs once.
  const { error: pErr } = await supabase
    .from('profiles')
    .update({ seeded: true })
    .eq('id', profile.id)
  if (pErr) throw pErr
}
