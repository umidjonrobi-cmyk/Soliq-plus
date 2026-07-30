import { accounts, closingBalance } from '../data/mock'
import type { Account } from '../data/mock'

/** A single row of the trial balance (aylanma-saldo vedomosti). */
export type TrialRow = {
  code: string
  account: Account
  openingDr: number
  openingCr: number
  turnoverDr: number
  turnoverCr: number
  closingDr: number
  closingCr: number
}

export type TrialTotals = {
  openingDr: number
  openingCr: number
  turnoverDr: number
  turnoverCr: number
  closingDr: number
  closingCr: number
}

const isDebitNatural = (a: Account) => a.type === 'asset' || a.type === 'expense'

export function trialBalance(): { rows: TrialRow[]; totals: TrialTotals } {
  const rows: TrialRow[] = accounts.map((a) => {
    const debitNatural = isDebitNatural(a)
    const closing = closingBalance(a)
    return {
      code: a.code,
      account: a,
      openingDr: debitNatural ? a.opening : 0,
      openingCr: debitNatural ? 0 : a.opening,
      turnoverDr: a.debitTurnover,
      turnoverCr: a.creditTurnover,
      closingDr: debitNatural ? closing : 0,
      closingCr: debitNatural ? 0 : closing,
    }
  })

  const totals = rows.reduce<TrialTotals>(
    (acc, r) => ({
      openingDr: acc.openingDr + r.openingDr,
      openingCr: acc.openingCr + r.openingCr,
      turnoverDr: acc.turnoverDr + r.turnoverDr,
      turnoverCr: acc.turnoverCr + r.turnoverCr,
      closingDr: acc.closingDr + r.closingDr,
      closingCr: acc.closingCr + r.closingCr,
    }),
    { openingDr: 0, openingCr: 0, turnoverDr: 0, turnoverCr: 0, closingDr: 0, closingCr: 0 },
  )

  return { rows, totals }
}

const closingByType = (type: Account['type']) =>
  accounts.filter((a) => a.type === type).reduce((s, a) => s + closingBalance(a), 0)

const closingOf = (code: string) => {
  const a = accounts.find((x) => x.code === code)
  return a ? closingBalance(a) : 0
}

/** Profit & loss (foyda va zarar hisoboti). */
export function profitAndLoss() {
  const revenueSales = closingOf('9020') + closingOf('9030')
  const otherIncome = closingOf('9390')
  const cogs = closingOf('9120')
  const grossProfit = revenueSales - cogs
  const sellingExp = closingOf('9410')
  const adminExp = closingOf('9420')
  const otherOpEx = closingOf('9430')
  const operProfit = grossProfit + otherIncome - sellingExp - adminExp - otherOpEx
  const financeExp = closingOf('9610')
  const preTax = operProfit - financeExp
  const taxExpense = closingOf('9810')
  const netProfit = preTax - taxExpense

  return {
    revenueSales,
    otherIncome,
    cogs,
    grossProfit,
    sellingExp,
    adminExp,
    otherOpEx,
    operProfit,
    financeExp,
    preTax,
    taxExpense,
    netProfit,
  }
}

/** Balance sheet (buxgalteriya balansi), grouped to the local form. */
export function balanceSheet() {
  // Long-term assets: fixed assets & intangibles net of depreciation
  const fixedGross = closingOf('0100')
  const depreciation = closingOf('0200')
  const intangibles = closingOf('0400')
  const longTermAssets = fixedGross - depreciation + intangibles

  // Current assets
  const inventory = closingOf('1010') + closingOf('2910')
  const receivables = closingOf('4010') + closingOf('4310') + closingOf('4410')
  const cash = closingOf('5010') + closingOf('5110') + closingOf('5210')
  const currentAssets = inventory + receivables + cash

  const assetsTotal = longTermAssets + currentAssets

  // Equity — retained earnings folds in the period's net profit
  const share = closingOf('8330')
  const retained = closingOf('8710') + profitAndLoss().netProfit
  const equity = share + retained

  // Liabilities
  const payables = closingOf('6010') + closingOf('6310')
  const taxesDue = closingOf('6410') + closingOf('6520')
  const payroll = closingOf('6710')
  const loans = closingOf('6810')
  const liabilities = payables + taxesDue + payroll + loans

  const liabTotal = equity + liabilities

  return {
    longTermAssets,
    fixedGross,
    depreciation,
    intangibles,
    inventory,
    receivables,
    cash,
    currentAssets,
    assetsTotal,
    share,
    retained,
    equity,
    payables,
    taxesDue,
    payroll,
    loans,
    liabilities,
    liabTotal,
    balanced: Math.abs(assetsTotal - liabTotal) < 1,
  }
}

export { closingByType }
