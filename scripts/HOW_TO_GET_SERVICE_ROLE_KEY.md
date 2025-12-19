# Cara Mendapatkan SERVICE_ROLE_KEY

## Masalah: Error "User not allowed"

Error ini terjadi karena Anda menggunakan **ANON KEY** atau **PUBLIC KEY**, bukan **SERVICE_ROLE_KEY**.

## Langkah-langkah Mendapatkan SERVICE_ROLE_KEY

### 1. Buka Supabase Dashboard
- Kunjungi: https://supabase.com/dashboard
- Login ke akun Anda

### 2. Pilih Project Anda
- Klik pada project yang ingin Anda gunakan

### 3. Buka Settings > API
- Di sidebar kiri, klik **Settings** (ikon gear)
- Pilih **API** dari menu

### 4. Cari Service Role Key
- Scroll ke bawah ke bagian **"Project API keys"**
- Anda akan melihat beberapa key:
  - `anon` / `public` - ❌ JANGAN gunakan ini
  - `service_role` - ✅ INI yang Anda butuhkan!

### 5. Copy Service Role Key
- Klik tombol **"Reveal"** di sebelah `service_role` key
- Copy seluruh key (panjang sekali, mulai dengan `eyJ...`)

## Cara Menggunakan

### Opsi 1: Environment Variable (Recommended)
```bash
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
npm run create-dummy-users
```

### Opsi 2: Update Script Langsung
Edit file `scripts/create-dummy-users.mjs` line 19:
```javascript
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Opsi 3: .env.local File
Buat file `.env.local` di root project:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Perbedaan Key

| Key Type | Role | Bisa Create User? | Akses Database |
|----------|------|-------------------|----------------|
| `anon` / `public` | anon | ❌ Tidak | Terbatas (RLS) |
| `service_role` | service_role | ✅ Ya | Penuh (bypass RLS) |

## ⚠️ PENTING: Keamanan

- **JANGAN** commit SERVICE_ROLE_KEY ke git
- **JANGAN** share SERVICE_ROLE_KEY dengan siapapun
- **JANGAN** gunakan di frontend/client-side code
- **HANYA** gunakan untuk:
  - Development/Testing scripts
  - Server-side operations
  - Admin operations

## Troubleshooting

### Masih error "User not allowed"?
1. Pastikan Anda menggunakan `service_role` key, bukan `anon`
2. Cek apakah key sudah benar dengan decode JWT:
   - Key harus mengandung `"role":"service_role"` di payload
3. Pastikan key tidak expired
4. Cek Supabase Auth settings untuk email restrictions

### Cara Cek Key yang Benar
Jalankan di terminal:
```bash
echo "YOUR_KEY_HERE" | cut -d. -f2 | base64 -d | jq .role
```

Harus output: `"service_role"`

Jika output `"anon"`, berarti Anda menggunakan key yang salah!

