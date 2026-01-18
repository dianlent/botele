# Bot Telegram Jual Beli Akun Premium

Monorepo sederhana untuk webhook bot Telegram (Node/TypeScript) + dashboard admin (React/Vite) + skema database Supabase.

## Struktur
- `apps/bot`: webhook bot Telegram
- `apps/admin`: dashboard admin web (Next.js)
- `supabase/schema.sql`: struktur database

## Setup cepat
1) Install dependencies
```
npm install
```

2) Salin env
```
Copy-Item .env.example .env
```

3) Jalankan bot
```
npm run dev:bot
```

4) Jalankan dashboard
```
npm run dev:admin
```

## Webhook Telegram
Set webhook ke endpoint publik Anda:
```
https://api.telegram.org/bot<token>/setWebhook?url=<APP_URL>/webhook&secret_token=<BOT_WEBHOOK_SECRET>
```

## Skema Supabase
Jalankan SQL di `supabase/schema.sql` pada Supabase SQL editor atau via migration.

## Catatan
- Bot mendukung perintah `/start`, `/katalog`, `/order <product_id>`.
- Untuk pembayaran otomatis, tambahkan integrasi gateway di backend.
- Dashboard admin memakai Supabase Auth dan memverifikasi email di tabel `admin_users`.
- Buat user di Supabase Auth lalu insert email-nya ke `admin_users` agar bisa login.
- Pastikan env admin memakai `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
