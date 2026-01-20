# Base Project - Login & User Management

Minimal Next.js project dengan fitur Login dan User Management menggunakan Supabase.

## Fitur

- ✅ Authentication (Login/Logout)
- ✅ User Management (CRUD) - Hanya untuk Admin
- ✅ Role-based access control
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Avatar upload (optional)

## Tech Stack

- **Framework**: Next.js 16
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database

Jalankan script SQL di Supabase SQL Editor:
- `scripts/001_create_users_table.sql`

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Project Structure

```
base-project/
├── app/
│   ├── auth/login/          # Login page
│   ├── dashboard/
│   │   ├── layout.tsx      # Dashboard layout
│   │   ├── page.tsx        # Dashboard home
│   │   └── users/          # User management
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home (redirect)
├── components/
│   ├── sidebar.tsx         # Sidebar navigation
│   ├── top-nav.tsx         # Top navigation
│   ├── users/              # User components
│   └── ui/                 # UI components
├── lib/
│   ├── supabase/          # Supabase setup
│   └── utils.ts            # Utilities
├── scripts/               # SQL scripts
└── public/                # Static assets
```

## User Roles

- **Admin**: Full access, dapat manage users
- **GM**: General Manager (read-only untuk user management)
- **Sales**: Sales user (read-only)
- **Presales**: Presales user (read-only)
- **Engineer**: Engineer user (read-only)

## Setup Instructions

Lihat `SETUP.md` untuk instruksi setup lengkap.

## Copy Files

Lihat `COPY_FILES.md` untuk daftar file yang perlu di-copy dari project utama.

## API Usage

Aplikasi ini menyediakan REST API endpoints yang dapat diakses di `/api/*`.

**Catatan:** API ini menggunakan autentikasi sesi (cookie based), jadi pastikan Anda login terlebih dahulu atau mengirimkan cookie sesi yang valid.

### 1. Membuat Task Baru via API

**Endpoint:** `POST /api/tasks`

**Request Body (JSON):**
```json
{
  "title": "Fix critical bug in login",
  "project_id": "uuid-project-anda",
  "priority": "High",
  "status": "Todo",
  "assigned_to": "uuid-user-assignee",
  "start_date": "2024-02-01",
  "due_date": "2024-02-05",
  "estimated_hours": 4,
  "webhook_url": "https://workflows.dhomanhuri.id/webhook/53c7e875-8870-45ed-bfcc-6ccdbc8f9faa"
}
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "title": "Task via API",
    "priority": "Medium",
    "webhook_url": "https://workflows.dhomanhuri.id/webhook/53c7e875-8870-45ed-bfcc-6ccdbc8f9faa"
  }'
```

### 2. AI Chatbot API

**Endpoint:** `POST /api/ai/chat`

**Contoh:**
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "Apa saja task saya hari ini?" }'
```

## License

MIT

