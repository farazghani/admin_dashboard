# 🛡️ Admin Dashboard — Next.js Full Stack Assignment

A production-grade admin dashboard built with Next.js 15 App Router, featuring server-side rendering, role-based access control, full CRUD operations, and secure image uploads.

---

## 🔗 Links

| | |
|---|---|
| **GitHub Repository** | `https://github.com/your-username/admin-dashboard` |
| **Live Demo (Vercel)** | `https://admin-dashboard-q9uardnmr-farazs-projects-5e7e4223.vercel.app/` |

> **Demo Credentials**
>
> | Role | Email | Password |
> |------|-------|----------|
> | Admin | admin@example.com | Admin123 |
> | Sales Executive | sales@example.com | Admin123 |

---

--

## 📋 Table of Contents

- [Setup Instructions](#-setup-instructions)
- [Architecture Explanation](#-architecture-explanation)
- [Authentication Approach](#-authentication-approach)
- [RBAC Implementation](#-rbac-implementation)
- [Prisma Schema](#-prisma-schema)
- [Image Upload System](#-image-upload-system)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Tradeoffs](#-tradeoffs)
- [Environment Variables](#-environment-variables)

---
## 🚀 Setup Instructions

### Prerequisites

Make sure you have these installed:

- Node.js 20+
- npm or yarn
- Git
- Docker (optional, for containerized development)

### 1. Clone the Repository

```bash
git clone https://github.com/farazghani/admin_dashboard.git
cd admin-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3 Prisma Dependency Installation

```bash
npx prisma db pull
npx prisma migrate dev
npx prisma generate

```

### 4 Configure Environment variable 
 Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and fill in all required values. See [Environment Variables](#-environment-variables) section below for details on where to find each value.

### 4. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to **Settings → Database** and copy the connection string → `DATABASE_URL`
4. Go to **Storage** and create a bucket named `product-images` with **Public** enabled

### 5. Set Up Supabase Storage Policies

Run this in **Supabase SQL Editor**:

```sql
CREATE POLICY "Public can read product-images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Service role can upload product-images"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role can update product-images"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Service role can delete product-images"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'product-images');
```


### 6. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma migrate dev --name init

# Seed the database with admin user and sample data
npx prisma db seed
```

### 7. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

Log in with:
- **Admin:** `admin@example.com` / `Admin123`
- **Sales Executive:** `sales@example.com` / `Admin123`

---

---

## 🏗️ Architecture Explanation

### Overview

The application follows a **server-first architecture** using Next.js 15 App Router. The majority of data fetching and mutations happen on the server, minimizing client-side JavaScript and improving security.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                        │
│                                                              │
│  ┌──────────────────┐    ┌─────────────────────────────┐    │
│  │  Server Components│    │      Server Actions          │    │
│  │  (Data Fetching) │    │  (Mutations / Auth)          │    │
│  └──────────────────┘    └─────────────────────────────┘    │
│                                      │                       │
│  ┌──────────────────┐                │                       │
│  │  Client Components│               │                       │
│  │  (Interactivity) │               │                       │
│  └──────────────────┘                │                       │
└─────────────────────────────────────┼─────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────┐
│                        PRISMA ORM                            │
└──────────────────────────────────────┬──────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────┐
│                  SUPABASE POSTGRESQL                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE STORAGE                            │
│              (Product Images CDN)                            │
└─────────────────────────────────────────────────────────────┘
```



# 🔐 Authentication Approach

### Custom JWT with HTTP-only Cookies

Authentication is implemented from scratch using JSON Web Tokens stored in HTTP-only cookies. No third-party auth library is used, giving full control over the session lifecycle.

**Why custom auth over NextAuth?**
- No adapter complexity or Prisma adapter conflicts
- Full control over token payload (custom fields like `role` and `name`)
- Simpler codebase — easier to understand and audit
- HTTP-only cookies prevent XSS token theft

### Auth Flow

```
1. User submits login form
        ↓
2. Server Action: validateCredentials()
   - Query user by email (Prisma)
   - Compare password with bcrypt
        ↓
3. createSession() — sign JWT with jose
   - Payload: { userId, email, name, role }
   - Expires: 7 days
        ↓
4. setSessionCookie() — HTTP-only cookie
   - httpOnly: true (JS cannot read)
   - secure: true (HTTPS only in prod)
   - sameSite: lax (CSRF protection)
        ↓
5. redirect() → /dashboard
```

### Session Validation

Every protected page and Server Action calls `getSession()`:

```typescript
// lib/auth/session.ts
export async function getSession(): Promise {
  const token = cookies().get("session")?.value;
  if (!token) return null;

  const { payload } = await jwtVerify(token, secret);
  return payload as SessionPayload;
}
```

### Password Security

- Passwords hashed with **bcrypt** at 12 salt rounds
- Plain-text passwords are never stored or logged
- Passwords are never included in API responses

---

## 👥 RBAC Implementation

### Two Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Full CRUD on products, categories, users. Image uploads. All pages. |
| `SALES_EXECUTIVE` | Read-only. Can view products and categories. Cannot access user management. |

### Three Layers of Protection

RBAC is enforced at **three independent layers** — any one of them blocks unauthorized access.

**Layer 1: Page Level (Server Component)**

Every restricted page checks the session before rendering anything:

```typescript
// app/dashboard/users/page.tsx
export default async function UsersPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== Role.ADMIN) redirect("/dashboard"); // ← blocks Sales Exec

  // Only reaches here if Admin
  const users = await prisma.user.findMany(...);
  return ;
}
```


**Layer 2: Server Action Level**

Every mutation Server Action independently validates the session and role:

```typescript
// lib/actions/users.ts
async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== Role.ADMIN) redirect("/dashboard");
  return session;
}

export async function createUser(data: CreateUserInput) {
  await requireAdmin(); // ← blocks even direct API calls
  // ...mutation logic
}
```

**Layer 3: UI Level (Navigation)**

The sidebar filters nav items based on role, so Sales Executives never see the Users link:

```typescript
// components/layouts/sidebar-nav.tsx
const visibleNavItems = navItems.filter(
  (item) => !item.adminOnly || isAdmin
);
```

> **Important:** UI-level hiding alone is NOT security. It's only a UX improvement. The real security is in layers 1 and 2


# 🖼️ Image Upload System

Images are uploaded directly to **Supabase Storage** from the browser. Only the resulting public URLs are stored in the database.

### Upload Flow

```
1. User selects file in ImageUpload component
        ↓
2. Client-side validation
   - File type (JPEG, PNG, WebP, GIF only)
   - File size (max 5MB)
        ↓
3. supabaseAdmin.storage.upload()
   - Uses service role key to bypass RLS
   - Path: products/thumbnails/{timestamp}_{random}.{ext}
        ↓
4. Get public URL from Supabase CDN
        ↓
5. Store URL string in form state
        ↓
6. Form submission → save URL to database via Prisma
```



## 🛠️ Tech Stack

| Category | Technology | Reason |
|----------|-----------|--------|
| Framework | Next.js 15 (App Router) | SSR, Server Actions, file-based routing |
| Language | TypeScript | Type safety, better DX |
| Database | Supabase PostgreSQL | Managed Postgres, free tier |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | Custom JWT + jose | Full control, no adapter conflicts |
| Storage | Supabase Storage | Integrated with database, CDN |
| UI | ShadCN UI + Tailwind | Accessible, customizable components |
| Forms | React Hook Form + Zod | Performance, type-safe validation |
| Toasts | Sonner | Modern, simple notifications |
| Containerization | Docker + Docker Compose | Reproducible environments |
| Deployment | Vercel | Zero-config Next.js deployment |

---

### 📁 Folder Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/
│   │   └── login/ 
│   │     └──page.tsx     # Public login page
│   ├── dashboard/
│   │   ├── categories            
│   │   ├──  products/           
│   │   ├       ├──create/
│   │   │       ├── [id]/
│   │   │       ├── edit /
│   │   │       │     └── page
│   │   │       └──page
│   │   │── users          
│   │        ├──page
│   │        ├──layout
│   │        └──loading       
│   │    
│   │           
│   │    
│   │                 
│   │      
│   │           
│   │          
│   │           
│   ├── layout.tsx                   
│   └── globals.css
├── components/
│   ├── ui/                        
│   ├── dashboard/
│   │   ├── EditCategoryDialog.tsx         
│   │   ├── Header.tsx 
│   │   ├── ProductCreateForm.tsx    
│   │   ├── ProductEditForm.tsx
        ├──ProductEditForm.tsx
        └── Sidebar.tsx
│   
├── lib/
│   ├── actions/                    
│   │   ├── auth.ts                  
│   │   ├── products.ts             
│   │   ├── categories.ts             
│   │   └── users.ts               
│   ├── auth/
│   │   └── session.ts               
│   ├── validations/                  
│   │   ├── product.schema
│   │   ├── category.schema
        ├── login.schema
│   │   └── user.schema
│   ├── prisma.ts                    
│   ├── supabase.ts                
│   ├── utils.ts                   
│   └── constants.ts              
├── types/
│   └── index.ts                     
├── prisma/
│   ├── schema.prisma                
│   ├── migrations/                 
│   └── seed.ts              
├── public/                          
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

--

## ⚖️ Tradeoffs

### 1. Custom Auth vs NextAuth

**Chose:** Custom JWT + HTTP-only cookies

**Tradeoff:** More code to write and maintain, but gives full control over the session payload, no Prisma adapter conflicts, and a simpler mental model. For a small internal admin panel, this is appropriate. For a public-facing app with OAuth providers (Google, GitHub), NextAuth would be the better choice.

### 2. Client-side Uploads vs Server-side Uploads

**Chose:** Client-side uploads using `supabaseAdmin` with service role key

**Tradeoff:** The service role key is used in the browser bundle, which is not ideal for production. The correct approach is to upload via a Server Action so the key stays server-side. This was chosen for speed of development. The fix is straightforward: move the upload logic to a Server Action that accepts a `FormData` argument — planned for a future iteration.

### 3. Explicit Join Table vs Implicit Many-to-Many

**Chose:** Explicit `ProductCategory` model

**Tradeoff:** More verbose schema and queries, but provides better control, allows metadata on the relationship, and makes the data model clearer. Prisma's implicit many-to-many (`@@relation`) is simpler to write but harder to extend.

### 4. `String[]` for Gallery Images vs Separate Table

**Chose:** PostgreSQL array (`String[]`) on Product

**Tradeoff:** Simpler queries and no join needed for the common case of loading a product with its images. The downside is that individual images cannot be queried, tagged, or reordered independently. A separate `ProductImage` table would be more flexible but adds complexity that isn't needed for this scope.

### 5. Optimistic UI vs Server-confirmed Updates

**Chose:** Optimistic UI for user management (update state before server confirms)

**Tradeoff:** Faster perceived performance — the UI updates instantly without waiting for the server. The risk is the UI showing stale state if the server action fails. This is mitigated by reverting on error and showing toast notifications. For critical operations (delete, financial data), server-confirmed updates would be safer.

### 6. ShadCN UI vs Building Custom Components

**Chose:** ShadCN UI

**Tradeoff:** Fast, accessible, and well-designed components out of the box. The tradeoff is that all component code lives in your repo (not a node_modules dependency), which means more files to manage. The benefit is full customization without fighting a library's design decisions.

---

## 📜 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npx prisma studio        # Open Prisma database GUI
npx prisma migrate dev   # Run pending migrations
npx prisma db seed       # Seed the database
npx prisma generate      # Regenerate Prisma client
```

## 🔒 Security Practices

- Passwords hashed with bcrypt (12 salt rounds)
- Sessions stored in HTTP-only cookies (XSS resistant)
- `sameSite: lax` on cookies (CSRF resistant)
- All Server Actions independently validate auth + role
- No secrets committed to the repository
- Service role key used server-side only (planned improvement)
- Input validation with Zod on both client and server
- Rich text content sanitized before storage

---
