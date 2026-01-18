# Bot Telegram Jual Beli Akun Premium

Monorepo sederhana untuk webhook bot Telegram (Node/TypeScript) + dashboard admin (React/Vite) + skema database Supabase.

## Struktur
- `apps/bot`: webhook bot Telegram
- `apps/admin`: dashboard admin web
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