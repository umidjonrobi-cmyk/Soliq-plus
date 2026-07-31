import type { Key } from '../../i18n/dict'

export type ProviderId = 'didox' | 'faktura' | 'soliqservis'

export type AuthField = {
  key: string
  labelKey: Key
  type?: 'text' | 'password'
  placeholder?: string
}

export type ProviderMeta = {
  id: ProviderId
  name: string
  site: string
  docsUrl: string
  /** Real API base — used once credentials are wired through the server proxy. */
  baseUrl: string
  authFields: AuthField[]
  /** Localized one-line description key. */
  descKey: Key
}

/** Per-provider saved credentials (prototype: localStorage; production: server env). */
export type ProviderConfig = Record<string, string>

export type InvoiceItem = {
  name: string
  qty: number
  price: number
  vatRate: number
}

export type InvoiceDraft = {
  number: string
  date: string
  sellerInn: string
  sellerName: string
  buyerInn: string
  buyerName: string
  items: InvoiceItem[]
}

export type ConnectionResult = {
  ok: boolean
  /** 'live' when a real token is configured, 'demo' when simulated. */
  mode: 'live' | 'demo'
  message: string
}

export type SendResult = {
  ok: boolean
  mode: 'live' | 'demo'
  providerDocId?: string
  status?: string
  message: string
  signed: boolean
}

export interface Provider {
  meta: ProviderMeta
  isConfigured(cfg: ProviderConfig): boolean
  testConnection(cfg: ProviderConfig): Promise<ConnectionResult>
  sendInvoice(draft: InvoiceDraft, cfg: ProviderConfig, pkcs7?: string): Promise<SendResult>
}
