# Performance-Verbesserung: Loading States + Query-Optimierung

**Datum:** 2026-06-08

## Problem

Nutzer erleben ~2 Sekunden Wartezeit ohne visuelles Feedback bei Tab-Wechseln. Ursachen:
1. Alle Hauptseiten sind Server Components – jede Navigation wartet auf Supabase-Antwort
2. Dashboard macht 5 sequenzielle Supabase-Abfragen statt parallelisierte

## Lösung

Zwei gezielte Maßnahmen mit maximalem Nutzen-zu-Aufwand-Verhältnis:

### 1. Skeleton Loading States

`loading.tsx` neben jede Hauptseite. Next.js zeigt diese automatisch während die Seite lädt.

**Dashboard** (`app/dashboard/loading.tsx`):
- Roter Header-Skeleton (gleiche Höhe wie echter Header)
- Skeleton für „Nächster Termin"-Card
- 3 graue Aktions-Kacheln (Spieler / Neuer Termin / Einladen)
- 2 Zeilen für „Weitere Termine"

**Termine** (`app/termine/loading.tsx`):
- Seitenheader-Skeleton
- 3-4 Termin-Zeilen als Platzhalter

**Profil** (`app/profil/loading.tsx`):
- Avatar-Kreis + zwei Textzeilen

Skeletons nutzen `animate-pulse` (Tailwind) für den Lade-Effekt. Farben: `bg-gray-200` auf weißem Hintergrund, `bg-white/20` auf rotem Hintergrund.

### 2. Dashboard-Queries parallelisieren

Aktuell sequenziell: `getUser` → `getProfile` → `getEvents` → `getPlayers` → `getRSVPs`

Nach Optimierung mit `Promise.all`:
- **Stufe 1:** `getUser` (Voraussetzung für alles)
- **Stufe 2:** `getProfile` + `getEvents` parallel (beide brauchen nur user.id)
- **Stufe 3:** `getPlayers` + `getRSVPs` parallel (brauchen profile.role und events)

Keine Änderung an Datenstruktur oder UI – nur die Reihenfolge der Abfragen ändert sich.

## Was wir NICHT machen

- Caching (kompliziert, Risiko für veraltete Daten, lohnt sich erst bei vielen Nutzern)
- Query-Optimierung auf Termine/Profil (zu geringer Gewinn)

## Erwartetes Ergebnis

- „Nichts passiert"-Gefühl: komplett beseitigt durch Skeletons
- Echte Ladezeit Dashboard: ~500ms → ~300ms durch Parallelisierung
