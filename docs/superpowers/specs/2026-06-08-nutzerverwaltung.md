# Nutzerverwaltung – Design Spec

**Datum:** 2026-06-08

## Kontext

Trainer können aktuell nur Elternteile einladen. Es gibt keine Möglichkeit, Rollen beim Einladen zu wählen oder Nutzer nachträglich zu verwalten. Passwort-Probleme können nicht vom Trainer gelöst werden.

## Rollen im System

- **Elternteil** (`parent`): Sieht eigene Kinder, RSVPs, Termine
- **Trainer** (`trainer`): Sieht alle Spieler, kann Termine und Einladungen verwalten
- **Lead-Trainer** (`is_lead = true`): Trainer mit zusätzlichen Rechten – kann Trainer einladen und Rollen ändern. Aktuell nur Steven Fredrickson.

## Teil 1: Datenbankänderung

Neues Feld `is_lead` (boolean, default `false`) in der `profiles`-Tabelle.

```sql
ALTER TABLE profiles ADD COLUMN is_lead boolean NOT NULL DEFAULT false;
UPDATE profiles SET is_lead = true WHERE id = '<steven-user-id>';
```

Steven's User-ID wird einmalig aus dem Supabase Dashboard entnommen und in der Migration verwendet.

## Teil 2: Einladungsformular (`/einladen`)

Das bestehende Formular bekommt ein Rollen-Feld:

- **Normale Trainer:** Kein Dropdown – Rolle ist immer „Elternteil" (hidden field)
- **Lead-Trainer (Steven):** Dropdown mit „Elternteil" (Standard) und „Trainer"

**Technisch:**
- `EinladenPage` lädt `is_lead` des eingeloggten Trainers und gibt es als Prop an `EinladenForm`
- `EinladenForm` zeigt Dropdown nur wenn `isLead={true}`
- `inviteParent` Action akzeptiert `role` als zusätzlichen FormData-Parameter
- Server-seitige Validierung: nur Lead-Trainer darf `role='trainer'` setzen

## Teil 3: Profil-Seite (`/profil`)

### Eigenes Profil (oben, immer sichtbar)

Kompakte Visitenkarten-Darstellung: Avatar-Kreis, Name, E-Mail, Rollen-Badge. Sehen alle Nutzer.

### Nutzerverwaltung (darunter, nur Trainer)

Abschnitt „Nutzer" direkt unter dem eigenen Profil. Nur sichtbar wenn `role === 'trainer'`. (Tab-Wechsler wird ergänzt sobald ein zweiter Abschnitt dazu kommt.)

**Nutzerliste:**
- Alle registrierten Accounts (aus `profiles`-Tabelle)
- Pro Eintrag: Name, E-Mail, Rolle als Badge

**Aktionen (nur Lead-Trainer):**
- **Rolle ändern:** Dropdown direkt in der Zeile (Elternteil ↔ Trainer). Speichert sofort.
- **Passwort-Reset senden:** Button schickt dem Nutzer eine E-Mail mit Link zum Passwort neu setzen (via Supabase Admin API `generateLink`)

**Co-Trainer (is_lead = false):** Sehen die Liste, haben aber keine Aktions-Buttons.

## Berechtigungsmatrix

| Aktion | Elternteil | Trainer | Lead-Trainer |
|--------|-----------|---------|--------------|
| Elternteil einladen | ✗ | ✓ | ✓ |
| Trainer einladen | ✗ | ✗ | ✓ |
| Nutzerliste sehen | ✗ | ✓ | ✓ |
| Rolle ändern | ✗ | ✗ | ✓ |
| Passwort-Reset senden | ✗ | ✗ | ✓ |

## Dateien

| Aktion | Datei |
|--------|-------|
| Migration | `supabase/migrations/YYYYMMDD_add_is_lead.sql` |
| Modify | `app/profil/page.tsx` |
| Create | `app/profil/NutzerTab.tsx` |
| Modify | `app/einladen/page.tsx` |
| Modify | `app/einladen/EinladenForm.tsx` |
| Modify | `app/einladen/actions.ts` |
