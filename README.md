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

## API Usage & Authentication

Aplikasi ini menyediakan REST API endpoints yang mendukung **Hybrid Authentication** (Cookie Session & API Key).

### 1. Authentication Methods

#### A. Frontend (Cookie Session)
Secara default, aplikasi frontend menggunakan cookie session (Supabase Auth) untuk berkomunikasi dengan API.

#### B. External Access (API Key)
Untuk mengakses API dari luar aplikasi (misalnya: cron jobs, external scripts, postman), gunakan Header `x-api-key`.

1.  Set Environment Variable di `.env`:
    ```env
    PM_TOOLS_API_KEY=your_secure_random_string_here
    ```
2.  Gunakan header `x-api-key` pada setiap request.

### 2. Endpoints Overview

| Endpoint | Methods | Auth Support | Description |
| :--- | :--- | :--- | :--- |
| `/api/projects` | GET, POST | Hybrid (Key/Cookie) | Manage projects |
| `/api/tasks` | GET, POST | Hybrid (Key/Cookie) | Manage tasks |
| `/api/ai/chat` | POST | Hybrid (Key/Cookie) | AI Assistant Chat |
| `/api/lookup` | GET | Hybrid (Key/Cookie) | Get projects & users list |
| `/api/users` | GET | **Cookie Only** | List users (Frontend only) |

### 3. Usage Examples (cURL)

#### Create Task (via API Key)
**Note:** Saat menggunakan API Key untuk operasi `POST` (Create), field `created_by` (UUID User) **WAJIB** disertakan dalam JSON body karena tidak ada session user.

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "Task Created via API",
    "description": "This task was created using API Key auth",
    "project_id": "uuid-project-id",
    "created_by": "uuid-user-id",
    "priority": "High"
  }'
```

#### Chat with AI (via API Key)
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "message": "List active projects"
  }'
```

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
  "reminder_hours_before": 2,
  "webhook_url": "https://custom-webhook-url.com"
}
```

*Catatan: Jika `webhook_url` tidak diisi, akan menggunakan default: `https://workflows.dhomanhuri.id/webhook/53c7e875-8870-45ed-bfcc-6ccdbc8f9faa`*

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "title": "Task via API",
    "priority": "Medium",
    "reminder_hours_before": 1
  }'
```

### 2. Lookup Data (Project ID & User ID)

Gunakan endpoint ini untuk mendapatkan daftar ID yang dibutuhkan saat membuat task.

**Endpoint:** `GET /api/lookup`

**Response:**
```json
{
  "projects": [
    { "id": "uuid-1", "name": "Website Redesign", "status": "Active" }
  ],
  "users": [
    { "id": "uuid-2", "nama_lengkap": "John Doe", "email": "john@example.com" }
  ]
}
```

### 3. AI Chatbot API

**Endpoint:** `POST /api/ai/chat`

**Contoh:**
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{ "message": "Apa saja task saya hari ini?" }'
```

## License

MIT

