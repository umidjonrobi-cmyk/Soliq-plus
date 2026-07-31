import type { Provider, ProviderId, InvoiceDraft, SendResult, ConnectionResult, ProviderConfig } from './types'

// ── Shared helpers ───────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function fakeDocId(prefix: string): string {
  const n = Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, '0')
  return `${prefix}-${n}`
}

/**
 * Call OUR server proxy (/api/integration). Returns null if the proxy is
 * unreachable — e.g. the Vite dev server without server.js — so the caller
 * falls back to client-side demo simulation. In production (server.js) the
 * proxy forwards to the real provider using env credentials.
 */
async function proxyCall(
  provider: ProviderId,
  action: 'test' | 'send',
  payload: { config: ProviderConfig; draft?: InvoiceDraft; pkcs7?: string },
): Promise<any | null> {
  try {
    const res = await fetch('/api/integration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, action, payload }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function demoConnect(configured: boolean): Promise<ConnectionResult> {
  await delay(400)
  return { ok: true, mode: configured ? 'live' : 'demo', message: 'ok' }
}

async function demoSend(prefix: string, draft: InvoiceDraft, configured: boolean, pkcs7?: string): Promise<SendResult> {
  await delay(600)
  if (!draft.buyerInn || !draft.sellerInn) {
    return { ok: false, mode: configured ? 'live' : 'demo', message: 'INN missing', signed: Boolean(pkcs7) }
  }
  return {
    ok: true,
    mode: configured ? 'live' : 'demo',
    providerDocId: fakeDocId(prefix),
    status: 'sent',
    message: 'ok',
    signed: Boolean(pkcs7),
  }
}

/** Build a provider from its metadata + a doc-id prefix; wire proxy + demo fallback. */
function makeProvider(
  meta: Provider['meta'],
  prefix: string,
  isConfigured: (cfg: ProviderConfig) => boolean,
): Provider {
  return {
    meta,
    isConfigured,
    async testConnection(cfg) {
      const r = await proxyCall(meta.id, 'test', { config: cfg })
      if (r) return { ok: Boolean(r.ok), mode: r.mode || 'demo', message: r.message || '' }
      return demoConnect(isConfigured(cfg))
    },
    async sendInvoice(draft, cfg, pkcs7) {
      const r = await proxyCall(meta.id, 'send', { config: cfg, draft, pkcs7 })
      if (r) {
        return {
          ok: Boolean(r.ok),
          mode: r.mode || 'demo',
          providerDocId: r.providerDocId,
          status: r.status,
          message: r.message || '',
          signed: Boolean(r.signed ?? pkcs7),
        }
      }
      return demoSend(prefix, draft, isConfigured(cfg), pkcs7)
    },
  }
}

// ── DIDOX — INN + parol (Model 1: har mijoz o'z hisobi; partner token serverda) ─
const didox = makeProvider(
  {
    id: 'didox',
    name: 'DIDOX',
    site: 'didox.uz',
    docsUrl: 'https://api-docs.didox.uz/',
    baseUrl: 'https://api-partners.didox.uz',
    descKey: 'int.didox.desc',
    authFields: [
      { key: 'inn', labelKey: 'co.inn', type: 'text', placeholder: '3XX XXX XXX' },
      { key: 'password', labelKey: 'int.field.password', type: 'password' },
    ],
  },
  'DDX',
  (cfg) => Boolean(cfg.inn && cfg.password),
)

// ── Faktura.uz (E-Faktura) ───────────────────────────────────────────────────
const faktura = makeProvider(
  {
    id: 'faktura',
    name: 'Faktura.uz',
    site: 'faktura.uz',
    docsUrl: 'https://api.faktura.uz/help/',
    baseUrl: 'https://api.faktura.uz/Api',
    descKey: 'int.faktura.desc',
    authFields: [
      { key: 'login', labelKey: 'int.field.login', type: 'text', placeholder: 'account.faktura.uz login' },
      { key: 'password', labelKey: 'int.field.password', type: 'password' },
    ],
  },
  'EFV',
  (cfg) => Boolean(cfg.login && cfg.password),
)

// ── SOLIQ Servis ─────────────────────────────────────────────────────────────
const soliqservis = makeProvider(
  {
    id: 'soliqservis',
    name: 'SOLIQ Servis',
    site: 'soliqservis.uz',
    docsUrl: 'https://api.soliq-servis.uz/',
    baseUrl: 'https://api.soliq-servis.uz',
    descKey: 'int.soliqservis.desc',
    authFields: [{ key: 'token', labelKey: 'int.field.token', type: 'password', placeholder: 'API token' }],
  },
  'SLS',
  (cfg) => Boolean(cfg.token),
)

export const PROVIDERS: Record<ProviderId, Provider> = { didox, faktura, soliqservis }
export const PROVIDER_LIST: Provider[] = [didox, faktura, soliqservis]
export const getProvider = (id: ProviderId): Provider => PROVIDERS[id]
