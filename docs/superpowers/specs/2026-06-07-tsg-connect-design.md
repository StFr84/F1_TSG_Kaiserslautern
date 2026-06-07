# TSG Connect – Design Spec (Session 1 + 2)

**Datum:** 2026-06-07  
**Status:** Genehmigt durch Steven  
**Nächste Session:** Implementierung (MVP)

---

## Projektziel

Mobile Vereinsapp als PWA für die TSG Kaiserslautern – Start F1-Jugend, Skalierung auf gesamten Verein. Spond als Benchmark, gezielt übertroffen in Trainingsplanung und Dokumentation.

---

## Plattform

**Progressive Web App (PWA)**
- Next.js (React) als Frontend-Framework
- Installierbar auf iOS/Android, läuft im Browser
- Push-Benachrichtigungen via Service Worker + Supabase Edge Functions
- Kein App Store erforderlich

---

## Tech-Stack

| Bereich | Technologie | Begründung |
|---------|------------|-----------|
| Frontend | Next.js (React) | Bestes PWA-Support, SSR, große Community |
| Backend/DB | Supabase | EU-Hosting (Frankfurt), Auth, Echtzeit, RLS für DSGVO |
| Hosting | Vercel | Nahtlose Next.js-Integration, kostenlos für kleine Projekte |
| Icons | Lucide React | Konsistent, leichtgewichtig |
| Push | Supabase Edge Functions + Web Push API | Serverless, keine extra Infrastruktur |

---

## Nutzergruppen

| Rolle | Beschreibung |
|-------|-------------|
| Trainer/Admin | Verwaltet Mannschaft, plant Training und Spiele |
| Elternteil | Verwaltet Zu-/Absagen für ihr Kind |

Eine Person kann in verschiedenen Mannschaften unterschiedliche Rollen haben.

---

## Authentication

**E-Mail + Passwort** (via Supabase Auth)
- Eltern registrieren sich nur auf Einladung des Trainers
- Trainer-Einladungsflow: Trainer gibt E-Mail ein → Supabase sendet Einladungsmail

---

## Screens & Navigation

### Startscreen (Home) – Dashboard
- Nächster Termin mit RSVP-Status
- Offene Aktionen (ausstehende Spielzusagen)
- Letzte Ankündigung des Trainers
- Bottom Navigation: Home · Termine · Nachrichten · Profil

### Login Screen
- TSG-Logo + App-Name
- E-Mail + Passwort Eingabe
- "Einladung anfordern" Link (kein Self-Signup)

---

## Funktionsbereiche

1. **Kommunikation** – Ankündigungen (Trainer→Alle) + Direktnachrichten
2. **Termine** – Training (wiederkehrend), Spiele, sonstige Termine
3. **Anwesenheit** – Training: Opt-out | Spiel: explizite Bestätigung + Deadline
4. **Dokumentation** – Trainingsplanung (Vorbereitung + Nachbereitung), nur Trainer
5. **Spielerprofile** – Vorname, Geburtsjahr, Mannschaftszuordnung
6. **Kaderplanung** – Nominierung + Verfügbarkeitsübersicht
7. **Fahrgemeinschaften** – Plätze anbieten/anfragen für Auswärtsspiele

---

## Design System

| Token | Wert |
|-------|------|
| Primärfarbe | `#9B1C2E` |
| Primär Dunkel | `#7a1524` |
| Hintergrund | `#ffffff` |
| Surface | `#f5f5f5` |
| Text | `#1a1a1a` |
| Erfolg | `#16a34a` |
| Warnung | `#d97706` |
| Schrift | System-UI, sans-serif |
| Border-Radius | 8px |

Logo: Nur mit schriftlicher Genehmigung des TSG Vorstands verwenden.

---

## DSGVO

- Datenspeicherung in Deutschland (Supabase EU-Region Frankfurt)
- Einwilligung Erziehungsberechtigte für alle Minderjährigen (F-Jugend)
- Recht auf Löschung technisch umgesetzt (Supabase RLS + Delete-Flow)
- DSGVO + LDG Rheinland-Pfalz
- Datenschutzerklärung vor Registrierung akzeptieren

---

## Agent-Crew

9 Agenten: Product Owner · Architect · UI/UX Designer · Developer · QA · DSGVO/Security · Data · DevOps · Dokumentation

---

## Offen / Nächste Schritte

- [ ] Logo-Genehmigung TSG Kaiserslautern (Vorstand kontaktieren)
- [ ] Design-Token exakt verifizieren (Browser DevTools auf tsg1861kl.de)
- [ ] Backlog priorisieren → MVP-Scope festlegen
- [ ] Implementierung starten (Session 3)
