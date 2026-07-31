// Local, persistent account store — real registration/login without a backend.
// Accounts live in localStorage; passwords are stored as a SHA-256 hash (never
// plaintext). This is the "live" auth for the prototype; it upgrades to Supabase
// (real email confirmation) once VITE_SUPABASE_* keys are set.

export type Account = {
  name: string
  company: string
  email: string
  passHash: string
  createdAt: string
}

const KEY = 'uzb.accounts'

function load(): Record<string, Account> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as Record<string, Account>
  } catch {
    return {}
  }
}

function persist(all: Record<string, Account>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

const norm = (email: string) => email.trim().toLowerCase()

export async function hashPassword(pw: string): Promise<string> {
  const data = new TextEncoder().encode(pw)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function accountExists(email: string): boolean {
  return Boolean(load()[norm(email)])
}

export type PublicUser = { name: string; email: string; company: string }

export async function registerAccount(input: {
  name: string
  company: string
  email: string
  password: string
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: 'email-taken' }> {
  const all = load()
  const email = norm(input.email)
  if (all[email]) return { ok: false, error: 'email-taken' }
  const acc: Account = {
    name: input.name.trim(),
    company: input.company.trim(),
    email,
    passHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  }
  all[email] = acc
  persist(all)
  return { ok: true, user: { name: acc.name, email: acc.email, company: acc.company } }
}

export async function verifyAccount(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const acc = load()[norm(email)]
  if (!acc) return null
  const hash = await hashPassword(password)
  if (hash !== acc.passHash) return null
  return { name: acc.name, email: acc.email, company: acc.company }
}

/** Instant demo account — seeded on demand so "Demo kirish" always works. */
export async function ensureDemoAccount(): Promise<PublicUser> {
  const email = 'demo@uzbalance.uz'
  if (!accountExists(email)) {
    await registerAccount({ name: 'Demo foydalanuvchi', company: '"NUR SAVDO" MChJ', email, password: 'demo123' })
  }
  return { name: 'Demo foydalanuvchi', email, company: '"NUR SAVDO" MChJ' }
}
