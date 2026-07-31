import type { Provider, ProviderId, InvoiceDraft, SendResult, ConnectionResult } from './types'

// ── Shared helpers ───────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function fakeDocId(prefix: string): string {
  const n = Math.floor(Math.random() * 1e10)
    .toString()
    .padStart(10, '0')
  return `${prefix}-${n}`
}

/**
 * In this prototype the actual network call is simulated. When real credentials
 * exist they must flow through OUR server (server.js → provider) to avoid CORS
 * and keep tokens server-side; ERI signing (pkcs7) stays client-side. The
 * `live` branch below is where that server call is dropped in.
 */
async function simulateSend(
  provider: string,
  draft: InvoiceDraft,
  configured: boolean,
  pkcs7?: string,
): Promise<SendResult> {
  await delay(700)
  if (!draft.buyerInn || !draft.sellerInn) {
    return { ok: false, mode: configured ? 'live' : 'demo', message: 'INN missing', signed: Boolean(pkcs7) }
  }
  return {
    ok: true,
    mode: configured ? 'live' : 'demo',
    providerDocId: fakeDocId(provider),
    status: 'sent',
    message: 'ok',
    signed: Boolean(pkcs7),
  }
}

async function simulateConnect(configured: boolean): Promise<ConnectionResult> {
  await delay(500)
  return { ok: true, mode: configured ? 'live' : 'demo', message: 'ok' }
}

// ── DIDOX ────────────────────────────────────────────────────────────────────
const didox: Provider = {
  meta: {
    id: 'didox',
    name: 'DIDOX',
    site: 'didox.uz',
    docsUrl: 'https://api.didox.uz/',
    baseUrl: 'https://api.didox.uz/v1',
    descKey: 'int.didox.desc',
    authFields: [{ key: 'token', labelKey: 'int.field.token', type: 'password', placeholder: 'DIDOX API key' }],
  },
  isConfigured: (cfg) => Boolean(cfg.token),
  testConnection: (cfg) => simulateConnect(Boolean(cfg.token)),
  sendInvoice: (draft, cfg, pkcs7) => simulateSend('DDX', draft, Boolean(cfg.token), pkcs7),
}

// ── Faktura.uz (E-Faktura) ───────────────────────────────────────────────────
const faktura: Provider = {
  meta: {
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
  isConfigured: (cfg) => Boolean(cfg.login && cfg.password),
  testConnection: (cfg) => simulateConnect(Boolean(cfg.login && cfg.password)),
  sendInvoice: (draft, cfg, pkcs7) => simulateSend('EFV', draft, Boolean(cfg.login && cfg.password), pkcs7),
}

// ── SOLIQ Servis ─────────────────────────────────────────────────────────────
const soliqservis: Provider = {
  meta: {
    id: 'soliqservis',
    name: 'SOLIQ Servis',
    site: 'soliqservis.uz',
    docsUrl: 'https://api.soliq-servis.uz/',
    baseUrl: 'https://api.soliq-servis.uz',
    descKey: 'int.soliqservis.desc',
    authFields: [{ key: 'token', labelKey: 'int.field.token', type: 'password', placeholder: 'API token' }],
  },
  isConfigured: (cfg) => Boolean(cfg.token),
  testConnection: (cfg) => simulateConnect(Boolean(cfg.token)),
  sendInvoice: (draft, cfg, pkcs7) => simulateSend('SLS', draft, Boolean(cfg.token), pkcs7),
}

export const PROVIDERS: Record<ProviderId, Provider> = { didox, faktura, soliqservis }
export const PROVIDER_LIST: Provider[] = [didox, faktura, soliqservis]
export const getProvider = (id: ProviderId): Provider => PROVIDERS[id]
