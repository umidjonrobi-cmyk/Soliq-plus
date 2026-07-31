// Server-side integration proxy. The browser never calls DIDOX / Faktura.uz /
// SOLIQ Servis directly (CORS + secret partner keys). It calls our /api/integration,
// and this module forwards to the real provider using credentials from env.
//
// Env (set in Railway; all optional — missing ⇒ that provider stays in demo mode):
//   DIDOX_PARTNER_TOKEN, DIDOX_BASE_URL     (default https://testapi3.didox.uz)
//   FAKTURA_BASE_URL (default https://api.faktura.uz/Api), FAKTURA_TOKEN_URL
//   SOLIQSERVIS_BASE_URL, SOLIQSERVIS_TOKEN
//
// ERI (E-IMZO) signing stays in the browser; the signed PKCS#7 is passed in `pkcs7`.

const DIDOX_BASE = process.env.DIDOX_BASE_URL || 'https://testapi3.didox.uz'
const FAKTURA_BASE = process.env.FAKTURA_BASE_URL || 'https://api.faktura.uz/Api'
const FAKTURA_TOKEN_URL = process.env.FAKTURA_TOKEN_URL || 'https://account.faktura.uz/token'
const SOLIQSERVIS_BASE = process.env.SOLIQSERVIS_BASE_URL || 'https://api.soliq-servis.uz'

function fakeDocId(prefix) {
  const n = Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, '0')
  return `${prefix}-${n}`
}

function demo(action, prefix, pkcs7) {
  if (action === 'send') {
    return { ok: true, mode: 'demo', providerDocId: fakeDocId(prefix), status: 'sent', signed: Boolean(pkcs7), message: 'demo' }
  }
  return { ok: true, mode: 'demo', message: 'demo' }
}

async function fetchJson(url, opts, timeoutMs = 12000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal })
    const text = await res.text()
    let body
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = text
    }
    return { status: res.status, ok: res.ok, body }
  } finally {
    clearTimeout(timer)
  }
}

// ── DIDOX ────────────────────────────────────────────────────────────────────
async function didoxLogin(cfg) {
  const partner = process.env.DIDOX_PARTNER_TOKEN
  if (!partner) return { configured: false }
  const inn = (cfg.inn || '').replace(/\s/g, '')
  if (!inn || !cfg.password) return { configured: true, ok: false, message: 'inn/password required' }

  const r = await fetchJson(`${DIDOX_BASE}/v1/auth/${inn}/password/ru`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Partner-Authorization': partner },
    body: JSON.stringify({ password: cfg.password }),
  })
  if (r.status === 200 && r.body) {
    return { configured: true, ok: true, token: r.body.token || r.body.key || r.body.signature }
  }
  return { configured: true, ok: false, message: typeof r.body === 'string' ? r.body : r.body?.message || `HTTP ${r.status}` }
}

async function didox(action, cfg, pkcs7) {
  const auth = await didoxLogin(cfg)
  if (!auth.configured) return demo(action, 'DDX', pkcs7)
  if (!auth.ok) return { ok: false, mode: 'live', message: auth.message || 'auth failed', signed: Boolean(pkcs7) }
  if (action === 'test') return { ok: true, mode: 'live', message: 'connected' }
  // Document submission requires the RoamingInvoice schema + company login;
  // auth is verified live, submission is wired once a test account is available.
  return { ok: true, mode: 'live', status: 'authenticated', signed: Boolean(pkcs7), message: 'auth-ok' }
}

// ── Faktura.uz ───────────────────────────────────────────────────────────────
async function fakturaToken(cfg) {
  if (!cfg.login || !cfg.password) return { configured: false }
  const r = await fetchJson(FAKTURA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', username: cfg.login, password: cfg.password }).toString(),
  })
  if (r.status === 200 && r.body?.access_token) return { configured: true, ok: true, token: r.body.access_token }
  return { configured: true, ok: false, message: r.body?.error_description || r.body?.error || `HTTP ${r.status}` }
}

async function faktura(action, cfg, pkcs7) {
  const auth = await fakturaToken(cfg)
  if (!auth.configured) return demo(action, 'EFV', pkcs7)
  if (!auth.ok) return { ok: false, mode: 'live', message: auth.message || 'auth failed', signed: Boolean(pkcs7) }
  if (action === 'test') return { ok: true, mode: 'live', message: 'connected' }
  return { ok: true, mode: 'live', status: 'authenticated', signed: Boolean(pkcs7), message: 'auth-ok' }
}

// ── SOLIQ Servis ─────────────────────────────────────────────────────────────
async function soliqservis(action, cfg, pkcs7) {
  const token = cfg.token || process.env.SOLIQSERVIS_TOKEN
  if (!token) return demo(action, 'SLS', pkcs7)
  // Lightweight connectivity check against the base host.
  const r = await fetchJson(`${SOLIQSERVIS_BASE}/`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => ({ status: 0, ok: false, body: null }))
  if (action === 'test') {
    return r.status ? { ok: true, mode: 'live', message: 'connected' } : { ok: false, mode: 'live', message: 'unreachable' }
  }
  return { ok: true, mode: 'live', status: 'authenticated', signed: Boolean(pkcs7), message: 'auth-ok' }
}

const HANDLERS = { didox, faktura, soliqservis }

export async function handleIntegration({ provider, action, payload }) {
  const fn = HANDLERS[provider]
  if (!fn) return { ok: false, mode: 'demo', message: 'unknown provider' }
  const cfg = payload?.config || {}
  const pkcs7 = payload?.pkcs7
  try {
    return await fn(action === 'send' ? 'send' : 'test', cfg, pkcs7)
  } catch (err) {
    return { ok: false, mode: 'live', message: err?.message || 'proxy error' }
  }
}
