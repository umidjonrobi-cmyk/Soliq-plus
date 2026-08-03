import { supabase } from './supabase'
import type { DbCompany, DbEntry } from './supabase'
import { companies as mockCompanies, entries as mockEntries } from '../data/mock'

const DEMO_EMAIL = 'demo@uzbalance.uz'

/** Unified company shape the UI renders (both DB rows and demo mock map to it). */
export type UiCompany = {
  id: string
  name: string
  inn: string
  oked: string
  director: string
  accountant: string
  address: string
  taxMode: 'general' | 'simple'
  bankAccount: string
  bankName: string
  mfo: string
}

export function dbToUi(c: DbCompany): UiCompany {
  return {
    id: c.id,
    name: c.name,
    inn: c.inn,
    oked: c.oked,
    director: c.director,
    accountant: c.accountant,
    address: c.address,
    taxMode: c.tax_mode,
    bankAccount: c.bank_account,
    bankName: c.bank_name,
    mfo: c.mfo,
  }
}

// ── Profile ──────────────────────────────────────────────────────────────────
async function getProfile() {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, company_name, seeded')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (error) throw error
  return data as { id: string; full_name: string; company_name: string; seeded: boolean } | null
}

// ── Companies ────────────────────────────────────────────────────────────────
export async function listCompanies(): Promise<UiCompany[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as DbCompany[]).map(dbToUi)
}

export type CompanyInput = Omit<UiCompany, 'id'>

export async function addCompany(input: CompanyInput): Promise<UiCompany> {
  const row = {
    name: input.name,
    inn: input.inn,
    oked: input.oked,
    director: input.director,
    accountant: input.accountant,
    address: input.address,
    tax_mode: input.taxMode,
    bank_account: input.bankAccount,
    bank_name: input.bankName,
    mfo: input.mfo,
  }
  const { data, error } = await supabase.from('companies').insert(row).select().single()
  if (error) throw error
  return dbToUi(data as DbCompany)
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

// ── Seeding — first login sets up the account's own data ──────────────────────
export async function seedIfNeeded(): Promise<void> {
  const profile = await getProfile()
  if (!profile || profile.seeded) return

  const { data: auth } = await supabase.auth.getUser()
  const email = auth.user?.email || ''

  if (email === DEMO_EMAIL) {
    // Demo account → rich sample dataset (3 companies + journal entries).
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
    const { data: inserted, error: cErr } = await supabase.from('companies').insert(companyRows).select('id')
    if (cErr) throw cErr
    const firstId = inserted?.[0]?.id ?? null
    const entryRows = mockEntries.map((e) => ({
      company_id: firstId,
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
  } else {
    // Real account → just their own company, empty ledger to fill.
    const { error: cErr } = await supabase.from('companies').insert({
      name: profile.company_name || 'Mening korxonam',
      director: profile.full_name || '',
      tax_mode: 'general',
    })
    if (cErr) throw cErr
  }

  const { error: pErr } = await supabase.from('profiles').update({ seeded: true }).eq('id', profile.id)
  if (pErr) throw pErr
}
