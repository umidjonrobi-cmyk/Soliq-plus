import type { InvoiceDraft } from './types'
import type { Invoice } from '../../data/mock'
import type { UiCompany } from '../db'
import type { Lang } from '../../i18n/dict'

const ITEM_LABEL: Record<Lang, string> = {
  uz: 'Tovar / xizmat',
  cy: 'Товар / хизмат',
  ru: 'Товар / услуга',
}

/** Turn a stored invoice + the active company into a provider-agnostic draft. */
export function buildDraftFromInvoice(inv: Invoice, seller: UiCompany | null, lang: Lang): InvoiceDraft {
  const vatRate = inv.net > 0 ? Math.round((inv.vat / inv.net) * 100) : 12
  return {
    number: inv.no,
    date: inv.date,
    sellerInn: (seller?.inn || '').replace(/\s/g, ''),
    sellerName: seller?.name || '',
    buyerInn: inv.inn.replace(/\s/g, ''),
    buyerName: inv.counterparty,
    items: [{ name: ITEM_LABEL[lang], qty: 1, price: inv.net, vatRate }],
  }
}
