import type { InvoiceDraft } from './types'
import type { Invoice, Company } from '../../data/mock'
import type { Lang } from '../../i18n/dict'
import { pick } from '../../data/mock'

/** Turn a stored invoice + the active company into a provider-agnostic draft. */
export function buildDraftFromInvoice(inv: Invoice, seller: Company, lang: Lang): InvoiceDraft {
  const vatRate = inv.net > 0 ? Math.round((inv.vat / inv.net) * 100) : 12
  return {
    number: inv.no,
    date: inv.date,
    sellerInn: seller.inn.replace(/\s/g, ''),
    sellerName: seller.name,
    buyerInn: inv.inn.replace(/\s/g, ''),
    buyerName: inv.counterparty,
    items: [
      {
        name: pick(
          ['Tovar / xizmat', 'Товар / хизмат', 'Товар / услуга'] as const,
          lang,
        ),
        qty: 1,
        price: inv.net,
        vatRate,
      },
    ],
  }
}
