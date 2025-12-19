# Script Membuat User Dummy

Script JavaScript untuk membuat user dummy secara otomatis menggunakan Supabase Admin API.

## Prerequisites

1. **Service Role Key dari Supabase**
   - Buka Supabase Dashboard
   - Pergi ke **Settings** > **API**
   - Copy **service_role** key (JANGAN gunakan anon key!)
   - ⚠️ **PENTING**: Service Role Key memiliki akses penuh ke database, jangan commit ke git!

2. **Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` atau `SUPABASE_URL` - URL Supabase project Anda
   - `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key dari Supabase

## Cara Menggunakan

### Opsi 1: Menggunakan npm script (Recommended)

1. Set environment variables di terminal:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Jalankan script:
   ```bash
   npm run create-dummy-users
   ```

### Opsi 2: Langsung dengan node

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/create-dummy-users.mjs
```

### Opsi 3: Menggunakan .env.local

1. Tambahkan ke file `.env.local` (jangan commit file ini!):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Jalankan:
   ```bash
   npm run create-dummy-users
   ```

## User Dummy yang Dibuat

Script akan membuat 10 user dummy:

1. **admin@example.com** - Admin (Management)
2. **gm@example.com** - General Manager (Management)
3. **pm@example.com** - Project Manager (Management)
4. **sales1@example.com** - Sales Person 1 (Sales)
5. **sales2@example.com** - Sales Person 2 (Sales)
6. **presales@example.com** - Presales Engineer (Technical)
7. **engineer@example.com** - Software Engineer (Technical)
8. **dev1@example.com** - Developer 1 (Development)
9. **dev2@example.com** - Developer 2 (Development)
10. **qa@example.com** - QA Tester (Quality Assurance)

**Password untuk semua user**: `password123`

## Fitur Script

- ✅ Membuat user di Supabase Auth
- ✅ Membuat profile di `public.users`
- ✅ Auto-set `gm_id` untuk Sales users
- ✅ Skip user yang sudah ada (idempotent)
- ✅ Error handling yang baik
- ✅ Output yang informatif

## Troubleshooting

### Error: Missing environment variables
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` sudah di-set
- Cek dengan: `echo $NEXT_PUBLIC_SUPABASE_URL`

### Error: Invalid API key
- Pastikan menggunakan **Service Role Key**, bukan Anon Key
- Service Role Key bisa ditemukan di Supabase Dashboard > Settings > API

### Error: User already exists
- Script akan skip user yang sudah ada, ini normal
- Jika ingin membuat ulang, hapus user dari Supabase Dashboard terlebih dahulu

### Error: Foreign key constraint
- Pastikan tabel `users` sudah dibuat (jalankan `001_create_users_table.sql`)
- Pastikan struktur tabel sesuai dengan yang diharapkan

## Keamanan

⚠️ **PENTING**: 
- Jangan commit `SUPABASE_SERVICE_ROLE_KEY` ke git
- Jangan share Service Role Key dengan siapapun
- Service Role Key memiliki akses penuh ke database
- Hanya gunakan untuk development/testing, bukan production

## Setelah User Dibuat

Setelah script berhasil dijalankan, Anda bisa:

1. Login ke aplikasi dengan email dan password dummy
2. Test fitur-fitur aplikasi dengan user yang berbeda
3. Buat data dummy lainnya (projects, tasks, dll) menggunakan user yang sudah dibuat

