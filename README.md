# UZBalance

O'zbekiston korxonalari uchun onlayn buxgalteriya platformasi (prototip / demo).

Milliy hisobvaraqlar rejasi asosida: o'tkazmalar, kassa, bank, xarid-sotuv,
ombor, asosiy vositalar, ish haqi va avtomatik hisobotlar (balans, foyda-zarar,
aylanma-saldo, bosh kitob) — barchasi brauzerda.

## Imkoniyatlar

- **3 tilli interfeys** — o'zbekcha (lotin), ўзбекча (кирилл), русский
- **Yorug'/qorong'u** tema
- **Boshqaruv paneli** — KPI, tushum/xarajat grafigi, xarajat tarkibi
- **Ko'p korxona** bir hisobda
- **Hisobvaraqlar rejasi** (milliy standart) — filtr va qidiruv
- **O'tkazmalar** — ikki yoqlama yozuv (Dt/Kt), yangi o'tkazma qo'shish
- **Kassa / Bank** — kirim/chiqim, qoldiq dinamikasi
- **Xarid va sotuv** — fakturalar, QQS
- **Ombor, Asosiy vositalar, Ish haqi**
- **Hisobotlar** — balans, foyda-zarar, aylanma-saldo, bosh kitob;
  PDF (chop etish) va Excel (CSV) eksport
- **Balans avtomatik teng** bo'ladi (Aktiv = Passiv)

> Bu prototip. Ma'lumotlar demo va faqat brauzerda (localStorage) saqlanadi —
> backend hozircha ulanmagan (2-bosqich).

## Texnologiya

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Grafikalar — o'zimizniki (SVG), tashqi kutubxonasiz

## Ishga tushirish (lokal)

```bash
npm install
npm run dev
```

Demo kirish: istalgan e-mail va parol (kamida 6 belgi).

## Production build

```bash
npm run build   # dist/ hosil bo'ladi
npm start       # server.js orqali dist/ ni tarqatadi (PORT env)
```

## Railway'ga deploy

Repozitoriy Railway'ga ulanganda avtomatik:

1. `npm ci` → `npm run build` (Nixpacks, `nixpacks.toml`)
2. `npm start` — `server.js` `dist/` ni `$PORT` da tarqatadi
3. SPA yo'nalishlari `index.html` ga fallback qilinadi

`railway.json` va `nixpacks.toml` sozlamalari repoda mavjud.
