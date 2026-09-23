# PLAN — DonateHub

Salinan rencana kerja dari sesi Claude (`snug-moseying-moler`). Status: tahap 1–5
selesai (scaffold, skema, adapters, API, dashboard, build hijau).

## Latar belakang
Game Roblox (BEBAS PARTY V2) menerima donasi Saweria lewat Google Spreadsheet
sebagai perantara: Roblox poll Apps Script tiap 15 detik. Spreadsheet terbukti
tidak cocok: tanpa query (baca seluruh sheet tiap poll), tanpa lock (save ganda
antar server — total sempat menggelembung 295000), tanpa push (poll selamanya),
rapuh operasional (deployment version, propagasi, rate limit misterius).

DonateHub menggantikan spreadsheet: SaaS multi-user, 1 link webhook per sumber
per user, 1 link feed Roblox per user. Kontrak feed kompatibel Apps Script
(`unclaimed`/`claimRow`/`unclaimRow`, respons `{id,donator,amount,message,row}`)
sehingga kode Roblox hampir tidak berubah (cuma ganti `WEBHOOK_URL`).

## Keputusan (final)
- Auth: Auth.js v5 (Google + Discord). Database: PostgreSQL + Drizzle ORM.
- Scope: full fitur, gratis, tanpa billing/langganan.

## Status pengerjaan
- [x] 1. Scaffold Next.js+TS+Drizzle+Auth.js, `.env.example`, README
- [x] 2. Skema + migrasi Drizzle (auth tables + `webhook_endpoints`, `donations`,
      `roblox_feed_tokens`)
- [x] 3. Provider adapters (saweria + generic jadi, bagibagi stub TODO mapping)
- [x] 4. Inbound route + dedup + klaim/unclaim atomik + feed route
- [x] 5. Dashboard UI (endpoints CRUD + copy URL, daftar + filter, stats+top, settings)
- [ ] 6. Alihkan 1 server Roblox ke feed baru + playtest
      (V7 terisi, papan SaweriaSystem, overhead Slot 2 Top Cash, notif, VFX)
- [ ] 7. Hapus jalur legacy Roblox bila stabil 1–2 hari (terpisah, opsional)

## Yang dibutuhkan sebelum tahap 6
1. `DATABASE_URL` (Neon/Supabase/Railway) → `.env` → `pnpm exec drizzle-kit migrate`
2. OAuth Google + Discord → `AUTH_*` env
3. `pnpm dev` → daftar → buat endpoint → pasang inbound URL di Saweria
   → feed link → `SaweriaConfig.WEBHOOK_URL` → playtest

## Aturan main repo ini
- Bahasa komentar/kode: Indonesia sebisa mungkin (ikuti repo Roblox).
- Amount = integer satuan terkecil. Klaim harus atomik
  (`WHERE claimed=false`). Feed Roblox jangan pernah diubah kontraknya
  tanpa update `SaweriaMain` dulu.
- Tanpa billing: jangan tambah tabel/plan kuota tanpa diskusi.
