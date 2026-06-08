# Nutzerverwaltung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trainer können beim Einladen eine Rolle wählen (Elternteil/Trainer), und die Profil-Seite zeigt eine Nutzerverwaltung mit Rollen-Änderung und Passwort-Reset.

**Architecture:** Neues `is_lead`-Feld in der DB identifiziert den Lead-Trainer (Steven). Die Profil-Seite wird um eine kompakte eigene Profilkarte und einen Nutzer-Abschnitt erweitert. Server Actions in `profil/actions.ts` handhaben Rollen-Änderung und Passwort-Reset. Profil/page.tsx bleibt Server Component, NutzerTab ist Client Component für interaktive Aktionen.

**Tech Stack:** Next.js App Router, Supabase (Admin Client + Server Client), TypeScript, Tailwind CSS

---

## Dateien

| Aktion | Datei | Zweck |
|--------|-------|-------|
| DB Migration | via Supabase MCP | `is_lead` Spalte hinzufügen |
| Modify | `04_Code/frontend/app/einladen/page.tsx` | `is_lead` laden, an Form übergeben |
| Modify | `04_Code/frontend/app/einladen/EinladenForm.tsx` | Rollen-Dropdown für Lead-Trainer |
| Modify | `04_Code/frontend/app/einladen/actions.ts` | `role` Parameter akzeptieren + validieren |
| Modify | `04_Code/frontend/app/profil/page.tsx` | Kompaktes Profil + Nutzerliste laden |
| Create | `04_Code/frontend/app/profil/NutzerTab.tsx` | Client Component für Nutzerliste + Aktionen |
| Create | `04_Code/frontend/app/profil/actions.ts` | Server Actions: changeRole, sendPasswordReset |

---

### Task 1: DB Migration – is_lead Spalte

**Files:**
- DB Migration via Supabase MCP (kein lokales Datei-System nötig)

- [ ] **Step 1: Migration via Supabase MCP anwenden**

Supabase Projekt-ID: `ovgoffpsjvrppmrrfonq`
Steven's User-ID: `d5f2ee42-c400-43cc-8f48-bcd93e79d4f4`

Wende folgende Migration an (MCP Tool: `mcp__plugin_supabase_supabase__apply_migration`):

```sql
ALTER TABLE public.profiles ADD COLUMN is_lead boolean NOT NULL DEFAULT false;
UPDATE public.profiles SET is_lead = true WHERE id = 'd5f2ee42-c400-43cc-8f48-bcd93e79d4f4';
```

Migration name: `add_is_lead_to_profiles`

- [ ] **Step 2: Prüfen**

```sql
SELECT id, full_name, role, is_lead FROM public.profiles;
```

Erwartetes Ergebnis: Steven Fredrickson hat `is_lead = true`, alle anderen `false`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add is_lead flag to profiles (DB migration applied)"
```

---

### Task 2: Einladungsformular – Rollen-Dropdown

**Files:**
- Modify: `04_Code/frontend/app/einladen/page.tsx`
- Modify: `04_Code/frontend/app/einladen/EinladenForm.tsx`
- Modify: `04_Code/frontend/app/einladen/actions.ts`

- [ ] **Step 1: `einladen/page.tsx` – is_lead laden und an Form übergeben**

Ersetze die bestehende Datei `04_Code/frontend/app/einladen/page.tsx` komplett:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import EinladenForm from './EinladenForm'
import { deleteInvite } from './actions'
import { Trash2 } from 'lucide-react'

export default async function EinladenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, is_lead').eq('id', user.id).single()
  if (profile?.role !== 'trainer') redirect('/')

  const admin = createAdminClient()
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 200 })
  const pending = users.filter(u => u.invited_at && !u.confirmed_at)

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-2">Nutzer einladen</h1>
      <p className="text-sm text-gray-500 mb-6">Der Nutzer erhält eine E-Mail mit einem Einladungslink.</p>
      <EinladenForm isLead={profile?.is_lead ?? false} />

      {pending.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Ausstehende Einladungen ({pending.length})
          </p>
          <ul className="space-y-2">
            {pending.map(u => (
              <li key={u.id} className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {u.user_metadata?.full_name ?? '–'}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <form action={deleteInvite.bind(null, u.id)}>
                  <button type="submit" className="p-2 rounded-lg text-red-400 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: `einladen/EinladenForm.tsx` – Rollen-Dropdown hinzufügen**

Ersetze die bestehende Datei komplett:

```tsx
'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { inviteParent } from './actions'

const initialState = { error: '', success: false }

export default function EinladenForm({ isLead }: { isLead: boolean }) {
  const [state, formAction, pending] = useActionState(inviteParent, initialState)
  const [role, setRole] = useState('parent')

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-800 font-medium text-sm">Einladung gesendet!</p>
        <p className="text-green-700 text-xs mt-1">Der Nutzer erhält in Kürze eine E-Mail.</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 text-sm text-[#9B1C2E] underline">
          Weitere Einladung senden
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input name="full_name" required placeholder="Vorname Nachname"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
        <input name="email" type="email" required placeholder="nutzer@beispiel.de"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      {isLead ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
          <select name="role" value={role} onChange={e => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="parent">Elternteil</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="role" value="parent" />
      )}
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <button type="submit" disabled={pending}
        className="w-full py-2.5 rounded-lg text-white font-medium bg-[#9B1C2E] disabled:opacity-50">
        {pending ? 'Wird gesendet…' : 'Einladung senden'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: `einladen/actions.ts` – role Parameter akzeptieren + validieren**

Ersetze die bestehende Datei komplett:

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

type State = { error: string; success: boolean }

export async function inviteParent(prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string
  const full_name = formData.get('full_name') as string
  const role = (formData.get('role') as string) || 'parent'

  if (!email || !full_name) return { error: 'E-Mail und Name erforderlich', success: false }
  if (!['parent', 'trainer'].includes(role)) return { error: 'Ungültige Rolle', success: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt', success: false }

  const { data: profile } = await supabase
    .from('profiles').select('role, is_lead').eq('id', user.id).single()
  if (profile?.role !== 'trainer') return { error: 'Keine Berechtigung', success: false }
  if (role === 'trainer' && !profile?.is_lead) return { error: 'Keine Berechtigung', success: false }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${process.env.VERCEL_URL}`
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role },
    redirectTo: `${siteUrl}/auth/callback`,
  })
  if (error) return { error: error.message, success: false }

  return { error: '', success: true }
}

export async function deleteInvite(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Nicht eingeloggt')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'trainer') throw new Error('Keine Berechtigung')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  revalidatePath('/einladen')
}
```

- [ ] **Step 4: Im Browser prüfen**

Dev-Server läuft auf http://localhost:3000. Als Trainer einloggen → /einladen aufrufen → Rollen-Dropdown erscheint (da Steven `is_lead = true`).

- [ ] **Step 5: Commit**

```bash
git add 04_Code/frontend/app/einladen/page.tsx \
        04_Code/frontend/app/einladen/EinladenForm.tsx \
        04_Code/frontend/app/einladen/actions.ts
git commit -m "feat: add role selection to invitation form (lead-trainer only)"
```

---

### Task 3: Server Actions für Nutzerverwaltung

**Files:**
- Create: `04_Code/frontend/app/profil/actions.ts`

- [ ] **Step 1: `profil/actions.ts` erstellen**

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function changeRole(userId: string, role: string): Promise<void> {
  if (!['trainer', 'parent'].includes(role)) return

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles').select('is_lead').eq('id', user.id).single()
  if (!profile?.is_lead) return

  await supabase.from('profiles').update({ role }).eq('id', userId)
  revalidatePath('/profil')
}

export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht eingeloggt' }

  const { data: profile } = await supabase
    .from('profiles').select('is_lead').eq('id', user.id).single()
  if (!profile?.is_lead) return { error: 'Keine Berechtigung' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${process.env.VERCEL_URL}`
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/passwort-setzen`,
  })
  return { error: error?.message ?? null }
}
```

- [ ] **Step 2: Commit**

```bash
git add 04_Code/frontend/app/profil/actions.ts
git commit -m "feat: add changeRole and sendPasswordReset server actions"
```

---

### Task 4: NutzerTab Client Component

**Files:**
- Create: `04_Code/frontend/app/profil/NutzerTab.tsx`

- [ ] **Step 1: `profil/NutzerTab.tsx` erstellen**

```tsx
'use client'

import { useTransition, useState } from 'react'
import { changeRole, sendPasswordReset } from './actions'

type NutzerUser = {
  id: string
  email: string
  full_name: string
  role: string
}

export default function NutzerTab({ users, isLead }: { users: NutzerUser[]; isLead: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ id: string; message: string; isError: boolean } | null>(null)

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      await changeRole(userId, newRole)
    })
  }

  function handlePasswordReset(email: string, userId: string) {
    setFeedback(null)
    startTransition(async () => {
      const result = await sendPasswordReset(email)
      setFeedback({
        id: userId,
        message: result.error ?? 'Passwort-Reset-E-Mail gesendet',
        isError: !!result.error,
      })
    })
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Nutzer ({users.length})
      </p>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{u.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#9B1C2E]/10 text-[#9B1C2E]">
                  {u.role === 'trainer' ? 'Trainer' : 'Elternteil'}
                </span>
              </div>
              {isLead && (
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    disabled={isPending}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white disabled:opacity-50"
                  >
                    <option value="parent">Elternteil</option>
                    <option value="trainer">Trainer</option>
                  </select>
                  <button
                    onClick={() => handlePasswordReset(u.email, u.id)}
                    disabled={isPending}
                    className="text-xs text-[#9B1C2E] underline disabled:opacity-50"
                  >
                    Passwort-Reset senden
                  </button>
                  {feedback?.id === u.id && (
                    <p className={`text-xs ${feedback.isError ? 'text-red-600' : 'text-green-600'}`}>
                      {feedback.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add 04_Code/frontend/app/profil/NutzerTab.tsx
git commit -m "feat: add NutzerTab client component with role change and password reset"
```

---

### Task 5: Profil-Seite umbauen

**Files:**
- Modify: `04_Code/frontend/app/profil/page.tsx`

- [ ] **Step 1: `profil/page.tsx` komplett ersetzen**

```tsx
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import NutzerTab from './NutzerTab'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, role, is_lead').eq('id', user.id).single()

  let nutzerUsers: { id: string; email: string; full_name: string; role: string }[] = []

  if (profile?.role === 'trainer') {
    const admin = createAdminClient()
    const [{ data: { users: authUsers } }, { data: profiles }] = await Promise.all([
      admin.auth.admin.listUsers({ perPage: 200 }),
      admin.from('profiles').select('id, full_name, role'),
    ])
    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))
    nutzerUsers = (authUsers ?? [])
      .filter(u => u.confirmed_at)
      .map(u => ({
        id: u.id,
        email: u.email ?? '',
        full_name: profileMap.get(u.id)?.full_name ?? (u.user_metadata?.full_name as string) ?? '',
        role: profileMap.get(u.id)?.role ?? 'parent',
      }))
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#9B1C2E] flex items-center justify-center flex-shrink-0">
          <User size={22} color="white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{profile?.full_name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
          <span className="inline-block mt-0.5 text-xs font-medium px-2 py-0.5 rounded-full bg-[#9B1C2E]/10 text-[#9B1C2E]">
            {profile?.role === 'trainer' ? 'Trainer' : 'Elternteil'}
          </span>
        </div>
      </div>

      {profile?.role === 'trainer' ? (
        <NutzerTab users={nutzerUsers} isLead={profile?.is_lead ?? false} />
      ) : (
        <p className="text-sm text-gray-400 text-center">Weitere Profil-Einstellungen folgen in einer späteren Version.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Im Browser prüfen**

Zum Profil-Tab navigieren:
- Eigene Profilkarte erscheint oben (kompakter als vorher)
- Darunter: Nutzerliste mit Steven Fredrickson
- Rollen-Dropdown und Passwort-Reset-Button sichtbar (da is_lead = true)

- [ ] **Step 3: Commit**

```bash
git add 04_Code/frontend/app/profil/page.tsx
git commit -m "feat: rebuild profile page with compact profile card and user management"
```

---

### Task 6: Logbuch + Push

**Files:**
- Modify: `00_Logbuch/logbuch.md`

- [ ] **Step 1: Logbuch aktualisieren**

In `00_Logbuch/logbuch.md` einen neuen Eintrag unter Session 5 hinzufügen:

```markdown
---

## SESSION 6 – Nutzerverwaltung
**Datum:** 08.06.2026
**Teilnehmer:** Steven, Claude

### Änderungen

**Datenbankänderung**
- Neues Feld `is_lead` (boolean) in `profiles`-Tabelle
- Steven Fredrickson (`d5f2ee42-...`) hat `is_lead = true` – einziger Nutzer der Trainer einladen und Rollen ändern darf

**Einladungsformular (`/einladen`)**
- Rollen-Dropdown (Elternteil / Trainer) nur für Lead-Trainer sichtbar
- Server-seitige Validierung: nur is_lead darf Trainer-Rolle vergeben

**Profil-Seite (`/profil`)**
- Eigenes Profil kompakt oben als Visitenkarte
- Nutzerliste darunter (nur für Trainer sichtbar)
- Lead-Trainer kann Rollen ändern + Passwort-Reset-E-Mail senden

### Berechtigungen
| Aktion | Elternteil | Trainer | Lead-Trainer (Steven) |
|--------|-----------|---------|----------------------|
| Trainer einladen | ✗ | ✗ | ✓ |
| Elternteil einladen | ✗ | ✓ | ✓ |
| Nutzerliste sehen | ✗ | ✓ | ✓ |
| Rolle ändern | ✗ | ✗ | ✓ |
| Passwort-Reset senden | ✗ | ✗ | ✓ |

### Offene Punkte
- [ ] Eigene Domain einrichten
```

- [ ] **Step 2: Committen und pushen**

```bash
git add 00_Logbuch/logbuch.md
git commit -m "docs: update logbuch Session 6 – Nutzerverwaltung"
git push origin main
```
