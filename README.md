# DonateHub

SaaS webhook donasi multi-user untuk game Roblox. Satu tempat menerima donasi
dari Saweria, BagiBagi, dan sumber lain — lalu disajikan ke Roblox lewat 1 link
feed per user. Dibangun untuk menggantikan Google Spreadsheet yang terbukti tidak
cocok (tanpa query, tanpa lock, poll selamanya, rapuh operasional).

## Cara kerja

```
Saweria / BagiBagi / dll
  → POST https://<domain>/api/in/<inboundToken>   (1 URL per sumber per user)
  → tersimpan (claimed=false)
Roblox poll tiap ±15 detik:
  → GET /api/roblox/feed?token=<userToken>&unclaimed=1
  → proses (save+notif+VFX) → GET ...&claimRow=<id>   (atomik, anti ganda)
```

## Fitur
- Multi-user (login Google / Discord via Auth.js), tiap user punya endpoint
  webhook sendiri per provider + 1 link feed Roblox (bisa regenerate).
- Dashboard: daftar donasi realtime + filter, statistik (total/hari ini/jumlah),
  top donatur, CRUD endpoint + tombol copy URL.
- Klaim atomik (`UPDATE ... WHERE claimed=false`) — aman multi-server Roblox.
- Dedup DB-level per endpoint+externalId. Tanpa billing, gratis semua.

## Mulai (lokal)

```bash
cp .env.example .env   # isi DATABASE_URL + AUTH_* (lihat bawah)
pnpm install
pnpm exec drizzle-kit migrate
pnpm dev               # http://localhost:3000
```

Env wajib: `DATABASE_URL` (PostgreSQL — Neon/Supabase/Railway),
`AUTH_SECRET` (`npx auth secret`), `AUTH_GOOGLE_ID/SECRET`,
`AUTH_DISCORD_ID/SECRET`, `NEXT_PUBLIC_APP_URL`.

## Sambungkan Roblox (SaweriaMain)
1. Daftar → dashboard → Endpoints → buat endpoint `saweria` → copy webhook URL →
   pasang di dashboard Saweria (ganti URL Apps Script lama).
2. Copy link feed (`/api/roblox/feed?token=...`) → `SaweriaConfig.WEBHOOK_URL`.
   Query `unclaimed`/`claimRow`/`unclaimRow` sudah ditangani loop yang ada —
   tidak perlu ubah parser.

## Struktur
`app/(auth, dashboard, api)` · `lib/db` (Drizzle schema) · `lib/providers`
(adapter per sumber) · `lib/auth.ts` · `drizzle/` (migrasi). Detail rencana
dan status: [PLAN.md](./PLAN.md).
