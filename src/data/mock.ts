import type { Lang } from '../i18n/dict'

/** [latin, cyrillic, russian] — used for terminology that must be translated. */
export type L3 = readonly [string, string, string]

const IDX: Record<Lang, 0 | 1 | 2> = { uz: 0, cy: 1, ru: 2 }
export const pick = (v: L3, lang: Lang) => v[IDX[lang]]

// ─────────────────────────────────────────────────────────── companies ──
export type Company = {
  id: string
  name: string
  inn: string
  oked: string
  director: string
  accountant: string
  address: L3
  taxMode: 'general' | 'simple'
  bankAccount: string
  bankName: L3
  mfo: string
}

export const companies: Company[] = [
  {
    id: 'c1',
    name: '"NUR SAVDO" MChJ',
    inn: '305 481 726',
    oked: '46900',
    director: 'Karimov Bekzod Alisherovich',
    accountant: 'Yusupova Nilufar Rustamovna',
    address: [
      'Toshkent sh., Yunusobod t., Amir Temur ko‘chasi 108',
      'Тошкент ш., Юнусобод т., Амир Темур кўчаси 108',
      'г. Ташкент, Юнусабадский р-н, ул. Амира Темура 108',
    ],
    taxMode: 'general',
    bankAccount: '2020 8000 3054 8172 6001',
    bankName: ['Ipoteka Bank ATIB', 'Ипотека Банк АТИБ', 'Ипотека Банк АТИБ'],
    mfo: '00443',
  },
  {
    id: 'c2',
    name: '"BARAKA QURILISH" MChJ',
    inn: '302 117 945',
    oked: '41200',
    director: 'Tursunov Sardor Baxtiyorovich',
    accountant: 'Ergasheva Dilnoza Alimovna',
    address: [
      'Samarqand sh., Registon ko‘chasi 24',
      'Самарқанд ш., Регистон кўчаси 24',
      'г. Самарканд, ул. Регистан 24',
    ],
    taxMode: 'simple',
    bankAccount: '2020 8000 3021 1794 5002',
    bankName: ['Asaka Bank ATB', 'Асака Банк АТБ', 'Асака Банк АТБ'],
    mfo: '00874',
  },
  {
    id: 'c3',
    name: '"SMART LOGISTIKA" YaTT',
    inn: '541 903 288',
    oked: '49410',
    director: 'Abdullayev Jasur Farhodovich',
    accountant: 'Abdullayev Jasur Farhodovich',
    address: [
      'Buxoro sh., Mustaqillik ko‘chasi 7',
      'Бухоро ш., Мустақиллик кўчаси 7',
      'г. Бухара, ул. Мустакиллик 7',
    ],
    taxMode: 'simple',
    bankAccount: '2020 8000 5419 0328 8003',
    bankName: ['Kapitalbank ATB', 'Капиталбанк АТБ', 'Капиталбанк АТБ'],
    mfo: '01041',
  },
]

// ──────────────────────────────────────────────────── chart of accounts ──
export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export type Account = {
  code: string
  name: L3
  type: AccountType
  /** Opening balance, signed by natural side. */
  opening: number
  debitTurnover: number
  creditTurnover: number
}

export const accounts: Account[] = [
  { code: '0100', name: ['Asosiy vositalar', 'Асосий воситалар', 'Основные средства'], type: 'asset', opening: 480_000_000, debitTurnover: 96_000_000, creditTurnover: 0 },
  { code: '0200', name: ['Asosiy vositalar eskirishi', 'Асосий воситалар эскириши', 'Износ основных средств'], type: 'liability', opening: 118_400_000, debitTurnover: 0, creditTurnover: 24_600_000 },
  { code: '0400', name: ['Nomoddiy aktivlar', 'Номоддий активлар', 'Нематериальные активы'], type: 'asset', opening: 36_000_000, debitTurnover: 12_000_000, creditTurnover: 0 },
  { code: '1010', name: ['Xom ashyo va materiallar', 'Хом ашё ва материаллар', 'Сырьё и материалы'], type: 'asset', opening: 74_500_000, debitTurnover: 210_400_000, creditTurnover: 198_300_000 },
  { code: '2910', name: ['Omborlardagi tovarlar', 'Омборлардаги товарлар', 'Товары на складах'], type: 'asset', opening: 312_800_000, debitTurnover: 1_140_000_000, creditTurnover: 1_058_000_000 },
  { code: '4010', name: ['Xaridorlardan olinadigan schyotlar', 'Харидорлардан олинадиган счётлар', 'Счета к получению от покупателей'], type: 'asset', opening: 186_200_000, debitTurnover: 1_520_000_000, creditTurnover: 1_412_000_000 },
  { code: '4310', name: ['Beriladigan bo‘naklar', 'Бериладиган бўнаклар', 'Выданные авансы'], type: 'asset', opening: 24_000_000, debitTurnover: 88_000_000, creditTurnover: 71_000_000 },
  { code: '4410', name: ['Hisobdor shaxslar', 'Ҳисобдор шахслар', 'Подотчётные лица'], type: 'asset', opening: 3_400_000, debitTurnover: 27_800_000, creditTurnover: 26_100_000 },
  { code: '5010', name: ['Milliy valyutadagi kassa', 'Миллий валютадаги касса', 'Касса в национальной валюте'], type: 'asset', opening: 18_600_000, debitTurnover: 264_000_000, creditTurnover: 251_400_000 },
  { code: '5110', name: ['Hisob-kitob schyoti', 'Ҳисоб-китоб счёти', 'Расчётный счёт'], type: 'asset', opening: 342_700_000, debitTurnover: 1_486_000_000, creditTurnover: 1_398_500_000 },
  { code: '5210', name: ['Valyuta schyoti', 'Валюта счёти', 'Валютный счёт'], type: 'asset', opening: 96_400_000, debitTurnover: 120_000_000, creditTurnover: 84_000_000 },
  { code: '6010', name: ['Mol yetkazib beruvchilarga qarz', 'Мол етказиб берувчиларга қарз', 'Счета к оплате поставщикам'], type: 'liability', opening: 224_500_000, debitTurnover: 1_180_000_000, creditTurnover: 1_295_800_000 },
  { code: '6310', name: ['Olingan bo‘naklar', 'Олинган бўнаклар', 'Полученные авансы'], type: 'liability', opening: 48_000_000, debitTurnover: 96_000_000, creditTurnover: 118_000_000 },
  { code: '6410', name: ['Byudjetga to‘lovlar', 'Бюджетга тўловлар', 'Расчёты с бюджетом'], type: 'liability', opening: 62_300_000, debitTurnover: 386_000_000, creditTurnover: 412_500_000 },
  { code: '6520', name: ['Ijtimoiy sug‘urta to‘lovlari', 'Ижтимоий суғурта тўловлари', 'Платежи по соцстрахованию'], type: 'liability', opening: 14_800_000, debitTurnover: 84_000_000, creditTurnover: 89_200_000 },
  { code: '6710', name: ['Mehnatga haq to‘lash', 'Меҳнатга ҳақ тўлаш', 'Расчёты по оплате труда'], type: 'liability', opening: 71_200_000, debitTurnover: 604_000_000, creditTurnover: 628_000_000 },
  { code: '6810', name: ['Qisqa muddatli bank kreditlari', 'Қисқа муддатли банк кредитлари', 'Краткосрочные банковские кредиты'], type: 'liability', opening: 180_000_000, debitTurnover: 60_000_000, creditTurnover: 0 },
  { code: '8330', name: ['Ustav kapitali', 'Устав капитали', 'Уставный капитал'], type: 'equity', opening: 500_000_000, debitTurnover: 0, creditTurnover: 0 },
  { code: '8710', name: ['Taqsimlanmagan foyda', 'Тақсимланмаган фойда', 'Нераспределённая прибыль'], type: 'equity', opening: 355_400_000, debitTurnover: 0, creditTurnover: 0 },
  { code: '9020', name: ['Tovarlarni sotishdan tushum', 'Товарларни сотишдан тушум', 'Выручка от реализации товаров'], type: 'income', opening: 0, debitTurnover: 0, creditTurnover: 2_184_000_000 },
  { code: '9030', name: ['Xizmatlar ko‘rsatishdan tushum', 'Хизматлар кўрсатишдан тушум', 'Выручка от услуг'], type: 'income', opening: 0, debitTurnover: 0, creditTurnover: 268_000_000 },
  { code: '9390', name: ['Boshqa operatsion daromadlar', 'Бошқа операцион даромадлар', 'Прочие операционные доходы'], type: 'income', opening: 0, debitTurnover: 0, creditTurnover: 42_600_000 },
  { code: '9120', name: ['Sotilgan tovarlar tannarxi', 'Сотилган товарлар таннархи', 'Себестоимость реализованных товаров'], type: 'expense', opening: 0, debitTurnover: 1_548_000_000, creditTurnover: 0 },
  { code: '9410', name: ['Sotish xarajatlari', 'Сотиш харажатлари', 'Расходы по реализации'], type: 'expense', opening: 0, debitTurnover: 186_400_000, creditTurnover: 0 },
  { code: '9420', name: ['Ma’muriy xarajatlar', 'Маъмурий харажатлар', 'Административные расходы'], type: 'expense', opening: 0, debitTurnover: 264_800_000, creditTurnover: 0 },
  { code: '9430', name: ['Boshqa operatsion xarajatlar', 'Бошқа операцион харажатлар', 'Прочие операционные расходы'], type: 'expense', opening: 0, debitTurnover: 98_200_000, creditTurnover: 0 },
  { code: '9610', name: ['Moliyaviy xarajatlar', 'Молиявий харажатлар', 'Финансовые расходы'], type: 'expense', opening: 0, debitTurnover: 34_500_000, creditTurnover: 0 },
  { code: '9810', name: ['Foyda solig‘i', 'Фойда солиғи', 'Налог на прибыль'], type: 'expense', opening: 0, debitTurnover: 55_900_000, creditTurnover: 0 },
]

/** Closing balance on the account's natural side. */
export function closingBalance(a: Account): number {
  const debitNatural = a.type === 'asset' || a.type === 'expense'
  return debitNatural
    ? a.opening + a.debitTurnover - a.creditTurnover
    : a.opening + a.creditTurnover - a.debitTurnover
}

export const accountLabel = (code: string, lang: Lang) => {
  const a = accounts.find((x) => x.code === code)
  return a ? `${a.code} — ${pick(a.name, lang)}` : code
}

// ────────────────────────────────────────────────────── journal entries ──
export type Entry = {
  id: string
  no: string
  date: string
  debit: string
  credit: string
  amount: number
  memo: L3
  status: 'posted' | 'draft'
  doc: string
}

export const entries: Entry[] = [
  { id: 'e1', no: '00241', date: '2026-07-28', debit: '4010', credit: '9020', amount: 84_600_000, memo: ['"AGRO MAX" MChJ ga tovar sotildi', '"AGRO MAX" МЧЖ га товар сотилди', 'Реализация товара "AGRO MAX" ООО'], status: 'posted', doc: 'F-1042' },
  { id: 'e2', no: '00242', date: '2026-07-28', debit: '9120', credit: '2910', amount: 61_200_000, memo: ['Sotilgan tovar tannarxi hisobdan chiqarildi', 'Сотилган товар таннархи ҳисобдан чиқарилди', 'Списана себестоимость реализации'], status: 'posted', doc: 'F-1042' },
  { id: 'e3', no: '00243', date: '2026-07-27', debit: '5110', credit: '4010', amount: 120_000_000, memo: ['Xaridordan pul tushdi', 'Харидордан пул тушди', 'Поступление от покупателя'], status: 'posted', doc: 'PP-518' },
  { id: 'e4', no: '00244', date: '2026-07-27', debit: '2910', credit: '6010', amount: 96_400_000, memo: ['"UZ TEXNO" dan tovar qabul qilindi', '"UZ TEXNO" дан товар қабул қилинди', 'Поступление товара от "UZ TEXNO"'], status: 'posted', doc: 'F-2287' },
  { id: 'e5', no: '00245', date: '2026-07-26', debit: '6010', credit: '5110', amount: 88_000_000, memo: ['Yetkazib beruvchiga to‘lov', 'Етказиб берувчига тўлов', 'Оплата поставщику'], status: 'posted', doc: 'PP-519' },
  { id: 'e6', no: '00246', date: '2026-07-25', debit: '9420', credit: '6710', amount: 52_400_000, memo: ['Iyul oyi uchun ish haqi hisoblandi', 'Июл ойи учун иш ҳақи ҳисобланди', 'Начислена зарплата за июль'], status: 'posted', doc: 'VD-07' },
  { id: 'e7', no: '00247', date: '2026-07-25', debit: '6710', credit: '6410', amount: 6_288_000, memo: ['JShDS ushlab qolindi', 'ЖШДС ушлаб қолинди', 'Удержан НДФЛ'], status: 'posted', doc: 'VD-07' },
  { id: 'e8', no: '00248', date: '2026-07-24', debit: '5010', credit: '5110', amount: 15_000_000, memo: ['Bankdan kassaga naqd pul olindi', 'Банкдан кассага нақд пул олинди', 'Получены наличные с банка'], status: 'posted', doc: 'CHEK-77' },
  { id: 'e9', no: '00249', date: '2026-07-23', debit: '4410', credit: '5010', amount: 4_200_000, memo: ['Hisobdor shaxsga mablag‘ berildi', 'Ҳисобдор шахсга маблағ берилди', 'Выдано подотчётному лицу'], status: 'posted', doc: 'RKO-118' },
  { id: 'e10', no: '00250', date: '2026-07-22', debit: '9410', credit: '4410', amount: 3_850_000, memo: ['Reklama xarajatlari hisobga olindi', 'Реклама харажатлари ҳисобга олинди', 'Приняты расходы на рекламу'], status: 'posted', doc: 'AO-44' },
  { id: 'e11', no: '00251', date: '2026-07-21', debit: '0100', credit: '6010', amount: 96_000_000, memo: ['Yuk mashinasi sotib olindi', 'Юк машинаси сотиб олинди', 'Приобретён грузовой автомобиль'], status: 'posted', doc: 'F-2301' },
  { id: 'e12', no: '00252', date: '2026-07-20', debit: '9420', credit: '0200', amount: 4_100_000, memo: ['Oylik eskirish hisoblandi', 'Ойлик эскириш ҳисобланди', 'Начислена амортизация за месяц'], status: 'posted', doc: 'BS-07' },
  { id: 'e13', no: '00253', date: '2026-07-19', debit: '6410', credit: '5110', amount: 74_500_000, memo: ['QQS byudjetga to‘landi', 'ҚҚС бюджетга тўланди', 'Уплачен НДС в бюджет'], status: 'posted', doc: 'PP-520' },
  { id: 'e14', no: '00254', date: '2026-07-18', debit: '9610', credit: '6810', amount: 2_700_000, memo: ['Kredit foizlari hisoblandi', 'Кредит фоизлари ҳисобланди', 'Начислены проценты по кредиту'], status: 'posted', doc: 'BS-07' },
  { id: 'e15', no: '00255', date: '2026-07-17', debit: '1010', credit: '6010', amount: 18_600_000, memo: ['Qadoqlash materiallari olindi', 'Қадоқлаш материаллари олинди', 'Поступили упаковочные материалы'], status: 'posted', doc: 'F-2295' },
  { id: 'e16', no: '00256', date: '2026-07-16', debit: '4010', credit: '9030', amount: 26_800_000, memo: ['Yetkazib berish xizmati ko‘rsatildi', 'Етказиб бериш хизмати кўрсатилди', 'Оказаны услуги доставки'], status: 'posted', doc: 'F-1038' },
  { id: 'e17', no: '00257', date: '2026-07-15', debit: '5010', credit: '9020', amount: 12_400_000, memo: ['Chakana savdo tushumi', 'Чакана савдо тушуми', 'Выручка от розничной торговли'], status: 'posted', doc: 'PKO-206' },
  { id: 'e18', no: '00258', date: '2026-07-14', debit: '9430', credit: '5110', amount: 6_900_000, memo: ['Kommunal xizmatlar to‘landi', 'Коммунал хизматлар тўланди', 'Оплачены коммунальные услуги'], status: 'posted', doc: 'PP-517' },
  { id: 'e19', no: '00259', date: '2026-07-30', debit: '9420', credit: '6520', amount: 6_288_000, memo: ['Ijtimoiy soliq hisoblandi', 'Ижтимоий солиқ ҳисобланди', 'Начислен социальный налог'], status: 'draft', doc: 'VD-07' },
  { id: 'e20', no: '00260', date: '2026-07-30', debit: '9810', credit: '6410', amount: 11_200_000, memo: ['Foyda solig‘i hisoblandi', 'Фойда солиғи ҳисобланди', 'Начислен налог на прибыль'], status: 'draft', doc: 'BS-07' },
]

// ──────────────────────────────────────────────────────── cash & bank ──
export type Movement = {
  id: string
  no: string
  date: string
  kind: 'in' | 'out'
  counterparty: string
  amount: number
  memo: L3
  account: string
}

export const cashOps: Movement[] = [
  { id: 'k1', no: 'PKO-206', date: '2026-07-15', kind: 'in', counterparty: 'Chakana savdo', amount: 12_400_000, memo: ['Kunlik tushum', 'Кунлик тушум', 'Дневная выручка'], account: '9020' },
  { id: 'k2', no: 'PKO-207', date: '2026-07-24', kind: 'in', counterparty: 'Ipoteka Bank', amount: 15_000_000, memo: ['Bankdan naqd pul', 'Банкдан нақд пул', 'Наличные с банка'], account: '5110' },
  { id: 'k3', no: 'RKO-118', date: '2026-07-23', kind: 'out', counterparty: 'Rahimov A.', amount: 4_200_000, memo: ['Xo‘jalik ehtiyojlari uchun', 'Хўжалик эҳтиёжлари учун', 'На хозяйственные нужды'], account: '4410' },
  { id: 'k4', no: 'RKO-119', date: '2026-07-25', kind: 'out', counterparty: 'Xodimlar', amount: 18_600_000, memo: ['Avans to‘lovi', 'Аванс тўлови', 'Выплата аванса'], account: '6710' },
  { id: 'k5', no: 'PKO-208', date: '2026-07-26', kind: 'in', counterparty: '"AGRO MAX" MChJ', amount: 8_200_000, memo: ['Qarz qoplandi', 'Қарз қопланди', 'Погашение долга'], account: '4010' },
  { id: 'k6', no: 'RKO-120', date: '2026-07-27', kind: 'out', counterparty: 'Toshkent Transport', amount: 2_800_000, memo: ['Transport xizmati', 'Транспорт хизмати', 'Транспортные услуги'], account: '9410' },
  { id: 'k7', no: 'PKO-209', date: '2026-07-28', kind: 'in', counterparty: 'Chakana savdo', amount: 9_650_000, memo: ['Kunlik tushum', 'Кунлик тушум', 'Дневная выручка'], account: '9020' },
  { id: 'k8', no: 'RKO-121', date: '2026-07-29', kind: 'out', counterparty: 'Ipoteka Bank', amount: 11_000_000, memo: ['Bankka naqd pul topshirildi', 'Банкка нақд пул топширилди', 'Сдача наличных в банк'], account: '5110' },
]

export const bankOps: Movement[] = [
  { id: 'b1', no: 'PP-518', date: '2026-07-27', kind: 'in', counterparty: '"AGRO MAX" MChJ', amount: 120_000_000, memo: ['F-1042 fakturasi bo‘yicha', 'Ф-1042 фактураси бўйича', 'По счёту-фактуре Ф-1042'], account: '4010' },
  { id: 'b2', no: 'PP-519', date: '2026-07-26', kind: 'out', counterparty: '"UZ TEXNO" MChJ', amount: 88_000_000, memo: ['Tovar uchun to‘lov', 'Товар учун тўлов', 'Оплата за товар'], account: '6010' },
  { id: 'b3', no: 'PP-520', date: '2026-07-19', kind: 'out', counterparty: 'Davlat byudjeti', amount: 74_500_000, memo: ['QQS to‘lovi', 'ҚҚС тўлови', 'Оплата НДС'], account: '6410' },
  { id: 'b4', no: 'PP-521', date: '2026-07-18', kind: 'in', counterparty: '"BARAKA SAVDO" MChJ', amount: 64_800_000, memo: ['Bo‘nak to‘lovi', 'Бўнак тўлови', 'Авансовый платёж'], account: '6310' },
  { id: 'b5', no: 'PP-517', date: '2026-07-14', kind: 'out', counterparty: 'Hududgaz', amount: 6_900_000, memo: ['Kommunal xizmatlar', 'Коммунал хизматлар', 'Коммунальные услуги'], account: '9430' },
  { id: 'b6', no: 'PP-522', date: '2026-07-12', kind: 'out', counterparty: 'Ipoteka Bank', amount: 30_000_000, memo: ['Kredit asosiy qarzi', 'Кредит асосий қарзи', 'Погашение тела кредита'], account: '6810' },
  { id: 'b7', no: 'PP-523', date: '2026-07-10', kind: 'in', counterparty: '"SILK ROAD" MChJ', amount: 96_200_000, memo: ['Xizmatlar uchun to‘lov', 'Хизматлар учун тўлов', 'Оплата за услуги'], account: '4010' },
  { id: 'b8', no: 'PP-524', date: '2026-07-08', kind: 'out', counterparty: 'Xodimlar (kartaga)', amount: 46_100_000, memo: ['Iyun oyi ish haqi', 'Июн ойи иш ҳақи', 'Зарплата за июнь'], account: '6710' },
]

export const cashOpening = 18_600_000
export const bankOpening = 342_700_000

// ───────────────────────────────────────────────────────────── trade ──
export type Invoice = {
  id: string
  no: string
  date: string
  kind: 'sale' | 'purchase'
  counterparty: string
  inn: string
  net: number
  vat: number
  status: 'paid' | 'unpaid' | 'partial'
}

export const invoices: Invoice[] = [
  { id: 'i1', no: 'F-1042', date: '2026-07-28', kind: 'sale', counterparty: '"AGRO MAX" MChJ', inn: '306 774 210', net: 84_600_000, vat: 10_152_000, status: 'partial' },
  { id: 'i2', no: 'F-1038', date: '2026-07-16', kind: 'sale', counterparty: '"SILK ROAD" MChJ', inn: '301 556 908', net: 26_800_000, vat: 3_216_000, status: 'paid' },
  { id: 'i3', no: 'F-1036', date: '2026-07-09', kind: 'sale', counterparty: '"BARAKA SAVDO" MChJ', inn: '308 220 114', net: 148_000_000, vat: 17_760_000, status: 'paid' },
  { id: 'i4', no: 'F-1031', date: '2026-07-03', kind: 'sale', counterparty: '"OSIYO TRADE" MChJ', inn: '304 918 337', net: 62_400_000, vat: 7_488_000, status: 'unpaid' },
  { id: 'i5', no: 'F-2301', date: '2026-07-21', kind: 'purchase', counterparty: '"AVTO MARKAZ" MChJ', inn: '302 660 471', net: 96_000_000, vat: 11_520_000, status: 'unpaid' },
  { id: 'i6', no: 'F-2295', date: '2026-07-17', kind: 'purchase', counterparty: '"PAK PRO" MChJ', inn: '309 145 002', net: 18_600_000, vat: 2_232_000, status: 'paid' },
  { id: 'i7', no: 'F-2287', date: '2026-07-27', kind: 'purchase', counterparty: '"UZ TEXNO" MChJ', inn: '303 447 815', net: 96_400_000, vat: 11_568_000, status: 'partial' },
  { id: 'i8', no: 'F-2280', date: '2026-07-05', kind: 'purchase', counterparty: '"GLOBAL IMPORT" MChJ', inn: '307 002 649', net: 210_000_000, vat: 25_200_000, status: 'paid' },
]

// ───────────────────────────────────────────────────────── inventory ──
export type Item = {
  id: string
  sku: string
  name: string
  unit: L3
  qty: number
  min: number
  cost: number
}

export const items: Item[] = [
  { id: 'm1', sku: 'TV-4301', name: 'Televizor Artel 43" Smart', unit: ['dona', 'дона', 'шт'], qty: 128, min: 40, cost: 3_150_000 },
  { id: 'm2', sku: 'MZ-2201', name: 'Muzlatgich Shivaki 220L', unit: ['dona', 'дона', 'шт'], qty: 46, min: 20, cost: 4_820_000 },
  { id: 'm3', sku: 'KD-0900', name: 'Konditsioner Samsung 9000 BTU', unit: ['dona', 'дона', 'шт'], qty: 17, min: 25, cost: 5_640_000 },
  { id: 'm4', sku: 'KM-0060', name: 'Kir yuvish mashinasi LG 6kg', unit: ['dona', 'дона', 'шт'], qty: 62, min: 30, cost: 4_270_000 },
  { id: 'm5', sku: 'MP-1200', name: 'Mikroto‘lqinli pech Vestel', unit: ['dona', 'дона', 'шт'], qty: 94, min: 35, cost: 1_180_000 },
  { id: 'm6', sku: 'CH-0017', name: 'Changyutgich Bosch 1700W', unit: ['dona', 'дона', 'шт'], qty: 12, min: 20, cost: 1_960_000 },
  { id: 'm7', sku: 'UT-0210', name: 'Dazmol Philips 2100W', unit: ['dona', 'дона', 'шт'], qty: 210, min: 60, cost: 486_000 },
  { id: 'm8', sku: 'PK-0500', name: 'Qadoqlash plyonkasi 500mm', unit: ['rulon', 'рулон', 'рулон'], qty: 340, min: 100, cost: 84_000 },
  { id: 'm9', sku: 'KR-0080', name: 'Karton quti 80×60×40', unit: ['dona', 'дона', 'шт'], qty: 1_250, min: 400, cost: 12_500 },
]

// ─────────────────────────────────────────────────────── fixed assets ──
export type FixedAsset = {
  id: string
  code: string
  name: string
  inService: string
  initial: number
  depreciation: number
  lifeYears: number
}

export const fixedAssets: FixedAsset[] = [
  { id: 'a1', code: 'OS-001', name: 'Ombor binosi (Sergeli)', inService: '2019-04-12', initial: 240_000_000, depreciation: 62_400_000, lifeYears: 20 },
  { id: 'a2', code: 'OS-002', name: 'Yuk mashinasi Isuzu NQR', inService: '2026-07-21', initial: 96_000_000, depreciation: 0, lifeYears: 7 },
  { id: 'a3', code: 'OS-003', name: 'Yuk mashinasi Chevrolet Labo', inService: '2022-09-01', initial: 78_000_000, depreciation: 34_100_000, lifeYears: 7 },
  { id: 'a4', code: 'OS-004', name: 'Shtabeler Toyota 1.5t', inService: '2021-11-15', initial: 54_000_000, depreciation: 21_600_000, lifeYears: 10 },
  { id: 'a5', code: 'OS-005', name: 'Server va tarmoq uskunalari', inService: '2023-02-08', initial: 62_000_000, depreciation: 29_800_000, lifeYears: 5 },
  { id: 'a6', code: 'OS-006', name: 'Ofis mebeli to‘plami', inService: '2020-06-30', initial: 46_000_000, depreciation: 26_500_000, lifeYears: 8 },
]

// ─────────────────────────────────────────────────────────── payroll ──
export type Employee = {
  id: string
  name: string
  position: L3
  gross: number
}

export const employees: Employee[] = [
  { id: 'p1', name: 'Karimov Bekzod', position: ['Direktor', 'Директор', 'Директор'], gross: 12_000_000 },
  { id: 'p2', name: 'Yusupova Nilufar', position: ['Bosh buxgalter', 'Бош бухгалтер', 'Главный бухгалтер'], gross: 9_500_000 },
  { id: 'p3', name: 'Rahimov Aziz', position: ['Sotuv menejeri', 'Сотув менежери', 'Менеджер по продажам'], gross: 7_200_000 },
  { id: 'p4', name: 'Ismoilova Malika', position: ['Sotuv menejeri', 'Сотув менежери', 'Менеджер по продажам'], gross: 6_800_000 },
  { id: 'p5', name: 'Sobirov Ulugʻbek', position: ['Ombor mudiri', 'Омбор мудири', 'Заведующий складом'], gross: 6_400_000 },
  { id: 'p6', name: 'Nazarov Shohruh', position: ['Haydovchi', 'Ҳайдовчи', 'Водитель'], gross: 4_900_000 },
  { id: 'p7', name: 'Qodirova Zilola', position: ['Kassir', 'Кассир', 'Кассир'], gross: 4_600_000 },
  { id: 'p8', name: 'Toshpo‘latov Jamshid', position: ['Yuk ortuvchi', 'Юк ортувчи', 'Грузчик'], gross: 3_900_000 },
]

export const PAYROLL_RATES = { incomeTax: 0.12, pension: 0.001, social: 0.12 }

export function payrollRow(e: Employee) {
  const incomeTax = e.gross * PAYROLL_RATES.incomeTax
  const pension = e.gross * PAYROLL_RATES.pension
  return {
    ...e,
    incomeTax,
    pension,
    net: e.gross - incomeTax - pension,
    social: e.gross * PAYROLL_RATES.social,
  }
}

// ───────────────────────────────────────────────────────── dashboard ──
/** Monthly revenue vs expense, millions of soʻm. Jan–Jul 2026 actual. */
export const monthlyFlow = [
  { m: 0, revenue: 268, expense: 214 },
  { m: 1, revenue: 302, expense: 241 },
  { m: 2, revenue: 356, expense: 278 },
  { m: 3, revenue: 318, expense: 262 },
  { m: 4, revenue: 402, expense: 305 },
  { m: 5, revenue: 448, expense: 331 },
  { m: 6, revenue: 400, expense: 314 },
]

export const expenseBreakdown: { label: L3; value: number }[] = [
  { label: ['Tovar tannarxi', 'Товар таннархи', 'Себестоимость товара'], value: 198.4 },
  { label: ['Ish haqi va soliqlar', 'Иш ҳақи ва солиқлар', 'Зарплата и налоги'], value: 64.9 },
  { label: ['Transport va logistika', 'Транспорт ва логистика', 'Транспорт и логистика'], value: 21.6 },
  { label: ['Ijara va kommunal', 'Ижара ва коммунал', 'Аренда и коммунальные'], value: 14.2 },
  { label: ['Reklama va marketing', 'Реклама ва маркетинг', 'Реклама и маркетинг'], value: 9.3 },
  { label: ['Boshqa xarajatlar', 'Бошқа харажатлар', 'Прочие расходы'], value: 5.6 },
]

export type Task = { id: string; due: string; title: L3; level: 'critical' | 'warning' | 'good' }

export const upcomingTasks: Task[] = [
  { id: 't1', due: '2026-08-05', title: ['QQS hisoboti topshirilsin', 'ҚҚС ҳисоботи топширилсин', 'Сдать отчёт по НДС'], level: 'critical' },
  { id: 't2', due: '2026-08-10', title: ['JShDS va INPS to‘lovi', 'ЖШДС ва ИНПС тўлови', 'Уплата НДФЛ и ИНПС'], level: 'warning' },
  { id: 't3', due: '2026-08-15', title: ['Iyul oyi ish haqi to‘lovi', 'Июл ойи иш ҳақи тўлови', 'Выплата зарплаты за июль'], level: 'warning' },
  { id: 't4', due: '2026-08-25', title: ['Ombor inventarizatsiyasi', 'Омбор инвентаризацияси', 'Инвентаризация склада'], level: 'good' },
]
