# 🔖 Smart Bookmark App

A **real-time, full-stack bookmark manager** built with Next.js 14 App Router, Supabase Auth + Postgres + Realtime, and deployed on Vercel.

---

## 📸 Screenshots

> _Add screenshots here after deployment_

| Login Page | Dashboard | Real-time Demo |
|---|---|---|
| _(screenshot)_ | _(screenshot)_ | _(gif)_ |

---

## 🧩 Project Overview

Smart Bookmark App lets users save and manage URLs privately, with instant real-time sync across all open tabs — no page refresh needed. Authentication is Google OAuth only, and all data is protected per-user using Supabase Row Level Security (RLS).

**Key Highlights:**
- 🔐 Google OAuth — no passwords, zero friction login
- ⚡ Supabase Realtime — changes in one tab appear instantly in all others
- 🔒 Row Level Security — users can only ever see their own data
- 🚀 Deployed on Vercel with zero-config deployment

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase Postgres |
| Realtime | Supabase Realtime (postgres_changes) |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| Language | TypeScript |

---

## 📂 Folder Structure

```
smart-bookmark-app/
│
├── app/                          # Next.js App Router
│   ├── globals.css               # Global Tailwind styles
│   ├── layout.tsx                # Root layout with fonts + metadata
│   ├── page.tsx                  # Root redirect (→ /dashboard or /login)
│   ├── login/
│   │   └── page.tsx              # Google OAuth login page (Client Component)
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard (Server Component)
│   └── api/
│       └── auth/
│           └── callback/
│               └── route.ts      # OAuth callback handler (exchanges code for session)
│
├── components/                   # Reusable UI components (all Client Components)
│   ├── Navbar.tsx                # Top nav with user info + sign out
│   ├── BookmarkForm.tsx          # Add bookmark form (title + URL)
│   └── BookmarkList.tsx          # Real-time bookmark list with delete
│
├── lib/                          # Supabase client utilities
│   ├── supabaseClient.ts         # Browser client (for Client Components)
│   └── supabaseServer.ts         # Server client (for Server Components)
│
├── types/
│   └── bookmark.ts               # TypeScript type for Bookmark
│
├── middleware.ts                  # Route protection + session refresh
├── tailwind.config.ts             # Tailwind configuration with custom design tokens
├── next.config.mjs                # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── supabase-setup.sql             # SQL for database + RLS setup
├── .env.local.example             # Environment variable template
├── README.md                      # This file
└── package.json
```

### Key Architecture Decisions

- **Server vs Client Components**: Dashboard page is a Server Component (fast initial data fetch). Navbar, BookmarkForm, BookmarkList are Client Components (need browser APIs, event handlers, real-time).
- **Two Supabase Clients**: `supabaseClient.ts` uses `createBrowserClient` (for Client Components), `supabaseServer.ts` uses `createServerClient` with cookies (for Server Components).
- **`getUser()` not `getSession()`**: Using `auth.getUser()` on the server for secure session validation that hits the Supabase auth server.

---

## 🗄 Database Schema

```sql
CREATE TABLE public.bookmarks (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  url        TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Indexes:**
- `idx_bookmarks_user_id` — fast user-based lookups
- `idx_bookmarks_created_at` — efficient date ordering

---

## 🔒 RLS Policies

Row Level Security ensures **users can only ever access their own bookmarks**.

```sql
-- SELECT: Only see your own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Only insert as yourself
CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Only delete your own
CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

Even if someone bypasses the UI and calls the API directly, RLS blocks access at the database level.

---

## ⚡ Realtime Implementation

Located in `components/BookmarkList.tsx`:

```typescript
const channel = supabase
  .channel(`bookmarks:user:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'bookmarks',
      filter: `user_id=eq.${userId}`,  // Only this user's changes
    },
    (payload) => {
      const newBookmark = payload.new as Bookmark;
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  )
  .on(
    'postgres_changes',
    {
      event: 'DELETE',
      schema: 'public',
      table: 'bookmarks',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      setBookmarks(prev => prev.filter(b => b.id !== payload.old.id));
    }
  )
  .subscribe();
```

**How it works:**
1. The dashboard loads initial bookmarks server-side (fast first paint)
2. `BookmarkList` opens a WebSocket channel to Supabase on mount
3. The filter `user_id=eq.${userId}` ensures only this user's events arrive
4. On INSERT → new bookmark is prepended to the list state
5. On DELETE → removed bookmark is filtered from state
6. **Open two tabs** — add a bookmark in one → it instantly appears in the other

---

## 🚀 Deployment Guide

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization, give the project a name, set a database password
4. Select a region close to your users
5. Wait for project to provision (~2 minutes)

### Step 2: Set Up the Database

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Paste the entire contents of `supabase-setup.sql`
4. Click **Run**
5. Verify the output shows the table, RLS enabled, and 3 policies created

### Step 3: Enable Google OAuth

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Google Provider** ON
4. Go to [Google Cloud Console](https://console.cloud.google.com/)
5. Create a new project (or use existing)
6. Go to **APIs & Services** → **Credentials**
7. Click **Create Credentials** → **OAuth 2.0 Client IDs**
8. Application type: **Web application**
9. Add Authorized Redirect URIs:
   - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
   - (Replace `YOUR_SUPABASE_PROJECT_REF` with your actual project ref from Supabase URL)
10. Copy the **Client ID** and **Client Secret**
11. Paste them into the Supabase Google provider fields
12. Save

### Step 4: Get Your Environment Variables

From your Supabase Dashboard → **Settings** → **API**:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" field |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API keys" → `anon` `public` |

### Step 5: Local Development

```bash
# Clone and install
git clone <your-repo>
cd smart-bookmark-app
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> ⚠️ Add `http://localhost:3000/api/auth/callback` to your Google OAuth authorized redirect URIs for local development.

### Step 6: Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
# Follow prompts — Vercel auto-detects Next.js
```

**Option B: GitHub Integration (Recommended)**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js, no build config needed

### Step 7: Set Environment Variables in Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` |

After adding variables, click **Redeploy**.

### Step 8: Update OAuth Redirect URI for Production

1. Go back to Google Cloud Console → OAuth Credentials
2. Add your Vercel URL: `https://your-app.vercel.app/api/auth/callback`
3. Also update Supabase → Authentication → URL Configuration:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

---

## ⚠️ Problems Faced & Solutions

### Problem 1: `cookies()` is async in Next.js 14
**Issue**: Next.js 14 made `cookies()` from `next/headers` return a Promise.  
**Solution**: Always `await cookies()` before calling `.getAll()` or `.set()`.

```typescript
// ✅ Correct
const cookieStore = await cookies();
```

### Problem 2: Realtime filter requires RLS-compatible filter syntax
**Issue**: The filter `user_id=eq.${userId}` must match the column name exactly.  
**Solution**: Ensure the column is named `user_id` (not `userId`) and the filter uses `eq.` prefix.

### Problem 3: OAuth redirect URI mismatch
**Issue**: Google rejects the OAuth flow if the redirect URI isn't in the allowlist.  
**Solution**: Add both `localhost:3000/api/auth/callback` (dev) and `your-app.vercel.app/api/auth/callback` (prod) to Google Cloud Console.

### Problem 4: Session not persisting after OAuth
**Issue**: Using `createClient` from `@supabase/supabase-js` directly doesn't sync cookies with Next.js.  
**Solution**: Use `@supabase/ssr` package exclusively — `createBrowserClient` for client, `createServerClient` for server.

### Problem 5: Duplicate bookmark on Realtime + optimistic UI
**Issue**: If both optimistic update and realtime INSERT fire, bookmark appears twice.  
**Solution**: In the Realtime INSERT handler, deduplicate by checking `prev.some(b => b.id === newBookmark.id)` before prepending.

### Problem 6: Realtime not updating in second tab
**Issue**: Supabase Realtime requires the table to be added to the `supabase_realtime` publication.  
**Solution**: Run `ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;` in SQL Editor. Also enable Realtime in Table Editor → bookmarks → Realtime toggle.

---

## 🔑 Required Environment Variables Summary

```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
# Vercel (production)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

---

## 📄 License

MIT — feel free to use this as a template for your own projects.
