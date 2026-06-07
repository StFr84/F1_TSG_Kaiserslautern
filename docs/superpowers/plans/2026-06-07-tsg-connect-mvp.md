# TSG Connect MVP – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** TSG Connect als Next.js PWA mit Supabase — Auth, Spielerprofile, Event-Management, RSVP und Dashboard.

**Architecture:** Next.js 14 App Router mit Server- und Client-Komponenten. Supabase übernimmt Auth, Datenbank und Row-Level-Security. Middleware schützt alle Routen. Trainer verwalten Inhalte, Eltern antworten auf Events.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (@supabase/ssr), Lucide React, Vitest

**Nicht in diesem Plan (Phase 2):** Kommunikation, Dokumentation, Kaderplanung, Fahrgemeinschaften

---

## Dateistruktur

```
04_Code/frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ← Redirect zu /dashboard
│   ├── login/page.tsx
│   ├── auth/callback/route.ts
│   ├── dashboard/page.tsx
│   ├── termine/
│   │   ├── page.tsx
│   │   ├── actions.ts
│   │   ├── neu/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       ├── actions.ts
│   │       └── RSVPButtons.tsx
│   ├── spieler/
│   │   ├── page.tsx
│   │   └── actions.ts
│   └── einladen/
│       ├── page.tsx
│       └── actions.ts
├── components/
│   └── BottomNav.tsx
├── lib/
│   ├── types.ts
│   ├── format.ts
│   ├── rsvp.ts
│   └── supabase/
│       ├── client.ts
│       ├── server.ts
│       └── admin.ts
├── middleware.ts
└── public/manifest.json
```

---

### Task 1: Projekt-Setup

**Files:**
- Create: `04_Code/frontend/` (Next.js app root)
- Create: `04_Code/frontend/public/manifest.json`
- Create: `04_Code/frontend/vitest.config.ts`
- Create: `04_Code/frontend/vitest.setup.ts`

- [ ] **Step 1: Next.js App erstellen**

```bash
cd ~/Documents/Projekte/TSG-App/04_Code
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd frontend
```

- [ ] **Step 2: Dependencies installieren**

```bash
npm install @supabase/supabase-js @supabase/ssr lucide-react
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Test-Scripts in package.json ergänzen**

`package.json` — in `"scripts"` hinzufügen:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: vitest.config.ts erstellen**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

- [ ] **Step 5: vitest.setup.ts erstellen**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: PWA Manifest erstellen**

`public/manifest.json`:
```json
{
  "name": "TSG Connect",
  "short_name": "TSG Connect",
  "description": "Vereinsapp TSG 1861 Kaiserslautern",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#9B1C2E",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 7: .env.local erstellen (niemals committen)**

```
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
```

Werte aus: Supabase Dashboard → Project Settings → API

- [ ] **Step 8: .env.local in .gitignore eintragen**

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "feat: initial Next.js setup with PWA manifest and test config"
```

---

### Task 2: Datenbank-Schema

**Files:**
- Create: `04_Code/datenbank/001_initial_schema.sql`
- Create: `04_Code/frontend/lib/types.ts`

- [ ] **Step 1: Schema-Migration schreiben**

`04_Code/datenbank/001_initial_schema.sql`:
```sql
create extension if not exists "pgcrypto";

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('trainer', 'parent')),
  created_at timestamptz default now() not null
);
alter table public.profiles enable row level security;
create policy "Own profile readable" on public.profiles for select using (auth.uid() = id);
create policy "Own profile updatable" on public.profiles for update using (auth.uid() = id);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now() not null
);
alter table public.teams enable row level security;
create policy "Teams readable by auth users" on public.teams for select using (auth.role() = 'authenticated');

-- Players
create table public.players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams on delete cascade not null,
  first_name text not null,
  birth_year int not null,
  parent_id uuid references public.profiles on delete set null,
  created_at timestamptz default now() not null
);
alter table public.players enable row level security;
create policy "Players readable by team members" on public.players
  for select using (auth.role() = 'authenticated');
create policy "Players manageable by trainers" on public.players
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'trainer')
  );

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams on delete cascade not null,
  type text not null check (type in ('training', 'game', 'other')),
  title text not null,
  starts_at timestamptz not null,
  location text,
  opponent text,
  meetup_at timestamptz,
  rsvp_deadline timestamptz,
  created_by uuid references public.profiles not null,
  created_at timestamptz default now() not null
);
alter table public.events enable row level security;
create policy "Events readable by auth users" on public.events for select using (auth.role() = 'authenticated');
create policy "Events manageable by trainers" on public.events
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'trainer')
  );

-- RSVPs
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events on delete cascade not null,
  player_id uuid references public.players on delete cascade not null,
  status text not null check (status in ('attending', 'absent')),
  reason text,
  updated_at timestamptz default now() not null,
  unique (event_id, player_id)
);
alter table public.rsvps enable row level security;
create policy "RSVPs readable by auth users" on public.rsvps for select using (auth.role() = 'authenticated');
create policy "RSVPs manageable by parent or trainer" on public.rsvps
  for all using (
    exists (
      select 1 from public.players pl
      where pl.id = rsvps.player_id
      and (
        pl.parent_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'trainer')
      )
    )
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Unbekannt'),
    coalesce(new.raw_user_meta_data->>'role', 'parent')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

- [ ] **Step 2: Migration in Supabase ausführen**

Supabase Dashboard → SQL Editor → Inhalt von `001_initial_schema.sql` einfügen → Run.

Prüfen: Table Editor → Tabellen `profiles`, `teams`, `players`, `events`, `rsvps` vorhanden.

- [ ] **Step 3: F1-Team als Seed-Daten einfügen**

Supabase SQL Editor:
```sql
insert into public.teams (id, name)
values ('00000000-0000-0000-0000-000000000001', 'F1');
```

- [ ] **Step 4: TypeScript-Typen erstellen**

`04_Code/frontend/lib/types.ts`:
```ts
export type Role = 'trainer' | 'parent'
export type EventType = 'training' | 'game' | 'other'
export type RSVPStatus = 'attending' | 'absent'

export interface Profile {
  id: string
  full_name: string
  role: Role
  created_at: string
}

export interface Team {
  id: string
  name: string
  created_at: string
}

export interface Player {
  id: string
  team_id: string
  first_name: string
  birth_year: number
  parent_id: string | null
  created_at: string
}

export interface Event {
  id: string
  team_id: string
  type: EventType
  title: string
  starts_at: string
  location: string | null
  opponent: string | null
  meetup_at: string | null
  rsvp_deadline: string | null
  created_by: string
  created_at: string
}

export interface RSVP {
  id: string
  event_id: string
  player_id: string
  status: RSVPStatus
  reason: string | null
  updated_at: string
}
```

- [ ] **Step 5: Commit**

```bash
git add 04_Code/datenbank/001_initial_schema.sql frontend/lib/types.ts
git commit -m "feat: database schema and TypeScript types"
```

---

### Task 3: Auth-Infrastruktur

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `middleware.ts`
- Create: `app/login/page.tsx`
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Browser-Client**

`lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Server-Client**

`lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 3: Admin-Client (für Einladungen)**

`lib/supabase/admin.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

- [ ] **Step 4: Middleware**

`middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const isPublic = path === '/login' || path.startsWith('/auth/')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && path === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-).*)'],
}
```

- [ ] **Step 5: Login-Test schreiben**

`app/login/__tests__/page.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../page'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword: vi.fn() } }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe('LoginPage', () => {
  it('zeigt E-Mail, Passwort und Einloggen-Button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /einloggen/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Test laufen lassen — erwartet FAIL**

```bash
npm run test:run app/login/__tests__/page.test.tsx
```
Erwartet: FAIL — LoginPage nicht gefunden

- [ ] **Step 7: Login-Page erstellen**

`app/login/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-Mail oder Passwort falsch.')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-[#9B1C2E]">
            <span className="text-white font-bold text-xl">TSG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TSG Connect</h1>
          <p className="text-sm text-gray-500 mt-1">F1-Jugend · TSG 1861 Kaiserslautern</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B1C2E]" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B1C2E]" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm bg-[#9B1C2E] disabled:opacity-50">
            {loading ? 'Wird eingeloggt...' : 'Einloggen'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-6">
          Noch kein Konto? Einladung beim Trainer anfordern.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Auth-Callback Route**

`app/auth/callback/route.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/`)
}
```

- [ ] **Step 9: Tests laufen lassen — erwartet PASS**

```bash
npm run test:run app/login/__tests__/page.test.tsx
```

- [ ] **Step 10: Commit**

```bash
git add lib/supabase/ middleware.ts app/login/ app/auth/
git commit -m "feat: auth infrastructure, login page, middleware"
```

---

### Task 4: Layout & Navigation

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Create: `components/BottomNav.tsx`

- [ ] **Step 1: BottomNav-Test schreiben**

`components/__tests__/BottomNav.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BottomNav from '../BottomNav'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

describe('BottomNav', () => {
  it('zeigt alle 4 Navigationspunkte', () => {
    render(<BottomNav />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Termine')).toBeInTheDocument()
    expect(screen.getByText('Nachrichten')).toBeInTheDocument()
    expect(screen.getByText('Profil')).toBeInTheDocument()
  })
  it('markiert aktive Route', () => {
    render(<BottomNav />)
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('aria-current', 'page')
  })
})
```

- [ ] **Step 2: Test laufen lassen — erwartet FAIL**

```bash
npm run test:run components/__tests__/BottomNav.test.tsx
```

- [ ] **Step 3: BottomNav erstellen**

`components/BottomNav.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, MessageCircle, User } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/termine', label: 'Termine', icon: Calendar },
  { href: '/nachrichten', label: 'Nachrichten', icon: MessageCircle },
  { href: '/profil', label: 'Profil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 max-w-md mx-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <Icon size={22} color={active ? '#9B1C2E' : '#9ca3af'} />
            <span className="text-xs" style={{ color: active ? '#9B1C2E' : '#9ca3af' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 4: app/layout.tsx aktualisieren**

`app/layout.tsx` vollständig ersetzen:
```tsx
import type { Metadata } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'TSG Connect',
  description: 'Vereinsapp TSG 1861 Kaiserslautern',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta name="theme-color" content="#9B1C2E" />
      </head>
      <body className="bg-white max-w-md mx-auto">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  )
}
```

- [ ] **Step 5: app/page.tsx — Redirect zu /dashboard**

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  redirect('/dashboard')
}
```

- [ ] **Step 6: Tests laufen lassen — erwartet PASS**

```bash
npm run test:run components/__tests__/BottomNav.test.tsx
```

- [ ] **Step 7: Commit**

```bash
git add app/layout.tsx app/page.tsx components/
git commit -m "feat: global layout and bottom navigation"
```

---

### Task 5: Hilfsfunktionen (Format + RSVP)

**Files:**
- Create: `lib/format.ts`
- Create: `lib/rsvp.ts`
- Create: `lib/__tests__/format.test.ts`
- Create: `lib/__tests__/rsvp.test.ts`

- [ ] **Step 1: Tests für Format-Hilfsfunktionen**

`lib/__tests__/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatEventDate, formatEventTime, isUpcoming } from '../format'

describe('formatEventDate', () => {
  it('gibt deutsches Datumsformat zurück', () => {
    expect(formatEventDate('2026-06-10T17:00:00+02:00')).toMatch(/Juni/)
  })
})

describe('formatEventTime', () => {
  it('gibt HH:MM zurück', () => {
    expect(formatEventTime('2026-06-10T17:00:00+02:00')).toMatch(/\d{2}:\d{2}/)
  })
})

describe('isUpcoming', () => {
  it('gibt true zurück für Datum in der Zukunft', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(isUpcoming(future)).toBe(true)
  })
  it('gibt false zurück für Datum in der Vergangenheit', () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    expect(isUpcoming(past)).toBe(false)
  })
})
```

- [ ] **Step 2: Tests für RSVP-Logik**

`lib/__tests__/rsvp.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getDefaultRSVP, isDeadlinePassed } from '../rsvp'

describe('getDefaultRSVP', () => {
  it('gibt attending zurück für Training (Opt-out)', () => {
    expect(getDefaultRSVP('training')).toBe('attending')
  })
  it('gibt null zurück für Spiel (explizite Bestätigung)', () => {
    expect(getDefaultRSVP('game')).toBeNull()
  })
})

describe('isDeadlinePassed', () => {
  it('gibt false zurück wenn keine Deadline', () => {
    expect(isDeadlinePassed(null)).toBe(false)
  })
  it('gibt true zurück wenn Deadline in der Vergangenheit', () => {
    expect(isDeadlinePassed(new Date(Date.now() - 1000).toISOString())).toBe(true)
  })
  it('gibt false zurück wenn Deadline in der Zukunft', () => {
    expect(isDeadlinePassed(new Date(Date.now() + 86400000).toISOString())).toBe(false)
  })
})
```

- [ ] **Step 3: Alle Tests laufen lassen — erwartet FAIL**

```bash
npm run test:run lib/__tests__/
```

- [ ] **Step 4: lib/format.ts erstellen**

```ts
export function formatEventDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  })
}

export function formatEventTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function isUpcoming(isoString: string): boolean {
  return new Date(isoString) > new Date()
}
```

- [ ] **Step 5: lib/rsvp.ts erstellen**

```ts
import type { EventType, RSVPStatus } from './types'

export function getDefaultRSVP(eventType: EventType): RSVPStatus | null {
  return eventType === 'training' ? 'attending' : null
}

export function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}
```

- [ ] **Step 6: Tests laufen lassen — erwartet PASS**

```bash
npm run test:run lib/__tests__/
```
Erwartet: 7 Tests PASS

- [ ] **Step 7: Commit**

```bash
git add lib/format.ts lib/rsvp.ts lib/__tests__/
git commit -m "feat: format and RSVP utility functions with tests"
```

---

### Task 6: Spielerverwaltung (Trainer)

**Files:**
- Create: `app/spieler/page.tsx`
- Create: `app/spieler/actions.ts`
- Create: `app/spieler/__tests__/actions.test.ts`

- [ ] **Step 1: Validierungs-Test schreiben**

`app/spieler/__tests__/actions.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { validatePlayer } from '../actions'

describe('validatePlayer', () => {
  it('akzeptiert gültige Daten', () => {
    expect(validatePlayer({ first_name: 'Luca', birth_year: 2017 })).toBe(true)
  })
  it('lehnt leeren Namen ab', () => {
    expect(validatePlayer({ first_name: '', birth_year: 2017 })).toBe(false)
  })
  it('lehnt zukünftiges Geburtsjahr ab', () => {
    expect(validatePlayer({ first_name: 'Luca', birth_year: 2099 })).toBe(false)
  })
  it('lehnt Geburtsjahr vor 1990 ab', () => {
    expect(validatePlayer({ first_name: 'Luca', birth_year: 1989 })).toBe(false)
  })
})
```

- [ ] **Step 2: Test laufen lassen — erwartet FAIL**

```bash
npm run test:run app/spieler/__tests__/actions.test.ts
```

- [ ] **Step 3: Server Actions erstellen**

`app/spieler/actions.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export function validatePlayer(data: { first_name: string; birth_year: number }): boolean {
  const currentYear = new Date().getFullYear()
  return (
    data.first_name.trim().length > 0 &&
    data.birth_year >= 1990 &&
    data.birth_year <= currentYear
  )
}

export async function addPlayer(formData: FormData) {
  const first_name = formData.get('first_name') as string
  const birth_year = parseInt(formData.get('birth_year') as string)
  if (!validatePlayer({ first_name, birth_year })) throw new Error('Ungültige Daten')
  const supabase = createClient()
  const { error } = await supabase.from('players').insert({
    team_id: TEAM_ID,
    first_name: first_name.trim(),
    birth_year,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}

export async function deletePlayer(playerId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw new Error(error.message)
  revalidatePath('/spieler')
}
```

- [ ] **Step 4: Tests laufen lassen — erwartet PASS**

```bash
npm run test:run app/spieler/__tests__/actions.test.ts
```

- [ ] **Step 5: Spieler-Page erstellen**

`app/spieler/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { addPlayer, deletePlayer } from './actions'
import { Trash2 } from 'lucide-react'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export default async function SpielerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  const { data: players } = await supabase
    .from('players').select('*').eq('team_id', TEAM_ID).order('first_name')

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Spieler</h1>
      <form action={addPlayer} className="flex gap-2 mb-6">
        <input name="first_name" placeholder="Vorname" required
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input name="birth_year" type="number" placeholder="Jg." min={1990} max={new Date().getFullYear()} required
          className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm font-medium bg-[#9B1C2E]">+</button>
      </form>
      <ul className="space-y-2">
        {players?.map(player => (
          <li key={player.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">{player.first_name}</p>
              <p className="text-xs text-gray-500">Jahrgang {player.birth_year}</p>
            </div>
            <form action={deletePlayer.bind(null, player.id)}>
              <button type="submit" className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </form>
          </li>
        ))}
      </ul>
      {!players?.length && (
        <p className="text-sm text-gray-500 text-center py-8">Noch keine Spieler eingetragen.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/spieler/
git commit -m "feat: player management for trainers"
```

---

### Task 7: Event-Verwaltung (Trainer)

**Files:**
- Create: `app/termine/page.tsx`
- Create: `app/termine/actions.ts`
- Create: `app/termine/neu/page.tsx`

- [ ] **Step 1: Server Actions**

`app/termine/actions.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'

export async function createEvent(formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { error } = await supabase.from('events').insert({
    team_id: TEAM_ID,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    starts_at: formData.get('starts_at') as string,
    location: (formData.get('location') as string) || null,
    opponent: (formData.get('opponent') as string) || null,
    meetup_at: (formData.get('meetup_at') as string) || null,
    rsvp_deadline: (formData.get('rsvp_deadline') as string) || null,
    created_by: user.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/termine')
  redirect('/termine')
}
```

- [ ] **Step 2: Terminliste**

`app/termine/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trophy, Dumbbell, Calendar } from 'lucide-react'
import { formatEventDate, formatEventTime } from '@/lib/format'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'
const typeIcon = { training: Dumbbell, game: Trophy, other: Calendar }

export default async function TerminePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: events } = await supabase
    .from('events').select('*').eq('team_id', TEAM_ID)
    .gte('starts_at', new Date().toISOString()).order('starts_at')

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Termine</h1>
        {profile?.role === 'trainer' && (
          <Link href="/termine/neu" className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg text-white bg-[#9B1C2E]">
            <Plus size={16} /> Neu
          </Link>
        )}
      </div>
      <ul className="space-y-3">
        {events?.map(event => {
          const Icon = typeIcon[event.type as keyof typeof typeIcon] || Calendar
          return (
            <li key={event.id}>
              <Link href={`/termine/${event.id}`} className="block bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg p-2 bg-gray-50 flex-shrink-0">
                    <Icon size={20} color="#9B1C2E" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">{formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}</p>
                    {event.location && <p className="text-xs text-gray-400 mt-0.5">{event.location}</p>}
                    {event.type === 'game' && event.opponent && <p className="text-xs text-gray-400">vs. {event.opponent}</p>}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      {!events?.length && <p className="text-sm text-gray-500 text-center py-12">Keine bevorstehenden Termine.</p>}
    </div>
  )
}
```

- [ ] **Step 3: Termin-Erstellungsformular**

`app/termine/neu/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { createEvent } from '../actions'

export default function NeuerTerminPage() {
  const [type, setType] = useState('training')

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Neuer Termin</h1>
      <form action={createEvent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
          <select name="type" value={type} onChange={e => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="training">Training</option>
            <option value="game">Spiel</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
          <input name="title" required defaultValue={type === 'training' ? 'Training' : ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum & Uhrzeit</label>
          <input name="starts_at" type="datetime-local" required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
          <input name="location" placeholder="z.B. Sportplatz Betzenberg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        {type === 'game' && <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gegner</label>
            <input name="opponent" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treffpunkt (Uhrzeit)</label>
            <input name="meetup_at" type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Deadline</label>
            <input name="rsvp_deadline" type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </>}
        <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium bg-[#9B1C2E]">
          Termin speichern
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/termine/
git commit -m "feat: event creation and listing"
```

---

### Task 8: RSVP-System

**Files:**
- Create: `app/termine/[id]/page.tsx`
- Create: `app/termine/[id]/actions.ts`
- Create: `app/termine/[id]/RSVPButtons.tsx`

- [ ] **Step 1: RSVP Server Action**

`app/termine/[id]/actions.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RSVPStatus } from '@/lib/types'

export async function upsertRSVP(eventId: string, playerId: string, status: RSVPStatus, reason?: string) {
  const supabase = createClient()
  const { error } = await supabase.from('rsvps').upsert(
    { event_id: eventId, player_id: playerId, status, reason: reason || null, updated_at: new Date().toISOString() },
    { onConflict: 'event_id,player_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath(`/termine/${eventId}`)
}
```

- [ ] **Step 2: RSVP-Buttons-Komponente (Client)**

`app/termine/[id]/RSVPButtons.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { upsertRSVP } from './actions'
import type { EventType, RSVPStatus } from '@/lib/types'

interface Props {
  eventId: string
  playerId: string
  eventType: EventType
  currentStatus: RSVPStatus | null
  disabled: boolean
}

export default function RSVPButtons({ eventId, playerId, eventType, currentStatus, disabled }: Props) {
  const [status, setStatus] = useState<RSVPStatus | null>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handle(newStatus: RSVPStatus) {
    if (disabled || loading) return
    setLoading(true)
    try {
      await upsertRSVP(eventId, playerId, newStatus)
      setStatus(newStatus)
    } finally {
      setLoading(false)
    }
  }

  if (eventType === 'training') {
    return (
      <button onClick={() => handle(status === 'absent' ? 'attending' : 'absent')}
        disabled={disabled || loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
        {status === 'absent' ? 'Abgemeldet' : 'Anwesend'}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => handle('attending')} disabled={disabled || loading} aria-label="Zusagen"
        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${status === 'attending' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        <Check size={16} />
      </button>
      <button onClick={() => handle('absent')} disabled={disabled || loading} aria-label="Absagen"
        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        <X size={16} />
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Event-Detailseite mit RSVP**

`app/termine/[id]/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { formatEventDate, formatEventTime } from '@/lib/format'
import { getDefaultRSVP, isDeadlinePassed } from '@/lib/rsvp'
import RSVPButtons from './RSVPButtons'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase.from('events').select('*').eq('id', params.id).single()
  if (!event) notFound()

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  const playerQuery = supabase.from('players').select('*')
  if (profile?.role === 'parent') {
    playerQuery.eq('parent_id', user.id)
  } else {
    playerQuery.eq('team_id', event.team_id)
  }
  const { data: players } = await playerQuery.order('first_name')

  const { data: rsvps } = await supabase.from('rsvps').select('*')
    .eq('event_id', event.id)
    .in('player_id', players?.map(p => p.id) || [])

  const rsvpMap = Object.fromEntries((rsvps || []).map(r => [r.player_id, r]))
  const deadlinePassed = isDeadlinePassed(event.rsvp_deadline)

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h1>
      <p className="text-sm text-gray-500 mb-1">{formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}</p>
      {event.location && <p className="text-sm text-gray-500 mb-2">{event.location}</p>}
      {event.type === 'game' && event.opponent && (
        <p className="text-sm font-medium text-gray-700 mb-2">vs. {event.opponent}</p>
      )}
      {event.rsvp_deadline && (
        <p className={`text-xs mb-4 ${deadlinePassed ? 'text-red-500' : 'text-amber-600'}`}>
          {deadlinePassed ? 'Deadline abgelaufen' : `Deadline: ${formatEventDate(event.rsvp_deadline)}`}
        </p>
      )}

      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {event.type === 'training' ? 'Abmeldungen' : 'Zusagen / Absagen'}
      </h2>

      <ul className="space-y-2">
        {players?.map(player => {
          const existing = rsvpMap[player.id]
          const currentStatus = existing?.status || getDefaultRSVP(event.type)
          return (
            <li key={player.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <div>
                <p className="font-medium text-sm text-gray-900">{player.first_name}</p>
                <p className="text-xs text-gray-400">Jg. {player.birth_year}</p>
              </div>
              <RSVPButtons eventId={event.id} playerId={player.id} eventType={event.type}
                currentStatus={currentStatus} disabled={deadlinePassed && profile?.role !== 'trainer'} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/termine/[id]/
git commit -m "feat: RSVP system with opt-out for training and explicit for games"
```

---

### Task 9: Dashboard

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Dashboard erstellen**

`app/dashboard/page.tsx`:
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Dumbbell, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import { formatEventDate, formatEventTime } from '@/lib/format'
import { getDefaultRSVP } from '@/lib/rsvp'

const TEAM_ID = '00000000-0000-0000-0000-000000000001'
const typeIcon = { training: Dumbbell, game: Trophy, other: Calendar }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: nextEvents } = await supabase
    .from('events').select('*').eq('team_id', TEAM_ID)
    .gte('starts_at', new Date().toISOString()).order('starts_at').limit(3)

  const playerQuery = supabase.from('players').select('*')
  if (profile?.role === 'parent') playerQuery.eq('parent_id', user.id)
  else playerQuery.eq('team_id', TEAM_ID)
  const { data: players } = await playerQuery

  // Offene Spielzusagen ermitteln
  const gameEvents = nextEvents?.filter(e => e.type === 'game') || []
  let pendingGames: typeof gameEvents = []
  if (gameEvents.length > 0 && players?.length) {
    const { data: existingRsvps } = await supabase
      .from('rsvps').select('event_id, player_id')
      .in('event_id', gameEvents.map(e => e.id))
      .in('player_id', players.map(p => p.id))
    const rsvpSet = new Set((existingRsvps || []).map(r => `${r.event_id}:${r.player_id}`))
    pendingGames = gameEvents.filter(event =>
      players.some(player => !rsvpSet.has(`${event.id}:${player.id}`))
    )
  }

  const nextEvent = nextEvents?.[0]

  return (
    <div>
      <div className="px-4 pt-10 pb-5 bg-[#9B1C2E]">
        <p className="text-white/70 text-sm">Willkommen</p>
        <h1 className="text-white text-xl font-bold">{profile?.full_name}</h1>
        <p className="text-white/60 text-xs mt-0.5">F1 · TSG 1861 Kaiserslautern</p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {nextEvent ? (
          <Link href={`/termine/${nextEvent.id}`}>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              {(() => { const Icon = typeIcon[nextEvent.type as keyof typeof typeIcon] || Calendar; return (
                <div className="rounded-lg p-2 bg-gray-50 flex-shrink-0"><Icon size={20} color="#9B1C2E" /></div>
              )})()}
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Nächster Termin</p>
                <p className="font-semibold text-gray-900">{nextEvent.title}</p>
                <p className="text-sm text-gray-500">{formatEventDate(nextEvent.starts_at)} · {formatEventTime(nextEvent.starts_at)}</p>
              </div>
              <ChevronRight size={18} className="text-gray-400 mt-1 flex-shrink-0" />
            </div>
          </Link>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Keine bevorstehenden Termine</p>
          </div>
        )}

        {pendingGames.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-amber-600" />
              <p className="text-sm font-medium text-amber-800">Zusage ausstehend</p>
            </div>
            {pendingGames.map(event => (
              <Link key={event.id} href={`/termine/${event.id}`}>
                <p className="text-sm text-amber-700 underline">Spiel am {formatEventDate(event.starts_at)} →</p>
              </Link>
            ))}
          </div>
        )}

        {nextEvents && nextEvents.length > 1 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Weitere Termine</p>
            <ul className="space-y-1">
              {nextEvents.slice(1).map(event => {
                const Icon = typeIcon[event.type as keyof typeof typeIcon] || Calendar
                return (
                  <li key={event.id}>
                    <Link href={`/termine/${event.id}`} className="flex items-center gap-3 py-2">
                      <Icon size={16} color="#9ca3af" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{formatEventDate(event.starts_at)}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-400" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/
git commit -m "feat: dashboard with next event and pending RSVP alerts"
```

---

### Task 10: Einladungssystem & Deployment

**Files:**
- Create: `app/einladen/page.tsx`
- Create: `app/einladen/actions.ts`

- [ ] **Step 1: Invite Actions**

`app/einladen/actions.ts`:
```ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function inviteParent(formData: FormData) {
  const email = formData.get('email') as string
  const full_name = formData.get('full_name') as string
  if (!email || !full_name) throw new Error('E-Mail und Name erforderlich')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') throw new Error('Keine Berechtigung')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role: 'parent' },
  })
  if (error) throw new Error(error.message)
}
```

- [ ] **Step 2: Invite Page**

`app/einladen/page.tsx`:
```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { inviteParent } from './actions'

export default async function EinladenPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Elternteil einladen</h1>
      <p className="text-sm text-gray-500 mb-6">Das Elternteil erhält eine E-Mail mit einem Einladungslink.</p>
      <form action={inviteParent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input name="full_name" required placeholder="Vorname Nachname"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
          <input name="email" type="email" required placeholder="elternteil@beispiel.de"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium bg-[#9B1C2E]">
          Einladung senden
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Alle Tests laufen lassen**

```bash
npm run test:run
```
Erwartet: Alle Tests PASS

- [ ] **Step 4: Lokal testen**

```bash
npm run build && npm run start
```
Öffne http://localhost:3000 — Login, Dashboard und Termine prüfen.

- [ ] **Step 5: Auf Vercel deployen**

```bash
npx vercel --prod
```
Im Vercel Dashboard diese Environment-Variablen setzen:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

- [ ] **Step 6: Finaler Commit**

```bash
git add app/einladen/
git commit -m "feat: trainer invite system for parents"
```

---

## Phase 2 (separate Pläne)

- Kommunikation (Ankündigungen + Direktnachrichten)
- Trainings-Dokumentation (Vorbereitung + Nachbereitung)
- Kaderplanung
- Fahrgemeinschaften
