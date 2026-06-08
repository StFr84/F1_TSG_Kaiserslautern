# TSG Connect – Logbuch

Alle Entscheidungen, Änderungen und Ergebnisse werden hier chronologisch festgehalten.

---

## SESSION 1 – Anforderungsanalyse
**Datum:** 06.06.2026  
**Teilnehmer:** Steven (Trainer F1, TSG Kaiserslautern), Claude

### Ergebnisse
- User Story Mapping abgeschlossen (7 Funktionsbereiche)
- Agent-Crew definiert (9 Agenten)
- Projektordner-Struktur festgelegt
- Spond als Referenz-App verankert
- DSGVO-Anforderungen identifiziert
- App-Name: TSG Connect (vorläufig)
- Plattform: Progressive Web App (PWA)
- Logo: Genehmigung bei TSG Kaiserslautern Vorstand einholen

### Offene Punkte
- [x] Logo-Genehmigung TSG Kaiserslautern (Vorstand kontaktieren) — **erteilt am 07.06.2026**
- [ ] Design-Token von https://tsg1861kl.de/abteilungen/fussball/ extrahieren (UI/UX Agent, Session 2)
- [ ] Tech-Stack Entscheidung (Architect Agent)
- [ ] Wireframes erstellen (UI/UX Agent)
- [ ] Backlog priorisieren (Product Owner Agent)
- [ ] Modellwahl jedes Agenten dokumentieren (Session 2)

### Nächste Schritte (Session 2)
- Architect Agent definiert Tech-Stack
- UI/UX Agent extrahiert Design-Token von TSG-Website
- UI/UX Agent erstellt erste Wireframes für Login + Startscreen

---

## SESSION 2 – Architektur & Design
**Datum:** 07.06.2026  
**Teilnehmer:** Steven, Claude

### Entscheidungen
- **Tech-Stack:** Next.js + Supabase (EU/Frankfurt) + Vercel
- **Authentication:** E-Mail + Passwort, nur per Trainer-Einladung
- **Startscreen:** Dashboard (nächster Termin + offene Aktionen + Ankündigung)
- **Navigation:** Bottom Nav (Home · Termine · Nachrichten · Profil)
- **Design-Token:** Primärfarbe `#9B1C2E`, System-UI Font, Border-Radius 8px
- **Logo:** Genehmigung erteilt (07.06.2026)

### Ergebnisse
- Designsystem dokumentiert: `03_Design/designsystem.md`
- Spec aktualisiert: `docs/superpowers/specs/2026-06-07-tsg-connect-design.md`
- Wireframes erstellt: Login-Screen + Dashboard Startscreen

### Offene Punkte
- [x] Logo-Genehmigung erteilt (07.06.2026)
- [x] MVP implementiert (Session 3)
- [ ] Logo-Datei in App einbauen

---

## SESSION 4 – UI-Verbesserungen & Deployment
**Datum:** 08.06.2026  
**Teilnehmer:** Steven, Claude

### UI-Änderungen (`app/dashboard/page.tsx`)
- **Zusage-Warnung verschoben:** War als separater gelber Balken zwischen „Nächster Termin" und Trainer-Bereich. Steht jetzt direkt unter dem jeweiligen Turnier in der „Weitere Termine"-Liste
- **Genaue Anzahl:** Statt generischem Text jetzt konkret: „1 Zusage ausstehend" bzw. „3 Zusagen ausstehend" (Einzahl/Mehrzahl korrekt)

### Deployment & CI/CD
- **Deployment-Plattform:** Vercel (war bereits gesetzt, jetzt sauber verbunden)
- **CI/CD:** GitHub Actions – automatisches Deploy bei jedem Push auf `main`
- **GitHub Pages:** deaktiviert (war für alte HTML-Version, nicht kompatibel mit Next.js)
- **Repository:** `StFr84/F1_TSG_Kaiserslautern` – alte HTML-Version durch neue Next.js-App ersetzt
- **Workflow:** `.github/workflows/deploy.yml`
- **Supabase-Zugangsdaten** sicher als GitHub Secrets hinterlegt
- **Deployment-URL:** `https://frontend-sage-six-92.vercel.app`

### Wie das Deployment funktioniert
1. Code-Änderung lokal entwickeln und testen
2. `git push origin main` → GitHub Actions startet automatisch
3. Vercel baut die App und deployed sie (~1 Minute)
4. Änderung ist live – Handy einfach neu laden

### Offene Punkte
- [ ] Eigene Domain einrichten (statt `frontend-sage-six-92.vercel.app`)
- [x] Logo-Datei in App einbauen

---

## SESSION 5 – Performance-Verbesserungen
**Datum:** 08.06.2026
**Teilnehmer:** Steven, Claude

### Änderungen

**Logo-Darstellung (Dashboard)**
- Weißer Rahmen um den Adler entfernt
- Logo direkt auf TSG-Rot (`#9B1C2E`) – Adler zentriert via `objectFit: cover` + `objectPosition: left center`

**Skeleton Loading States**
- `app/dashboard/loading.tsx`: Roter Header + Termin-Card + Aktions-Kacheln + Weitere Termine als Platzhalter
- `app/termine/loading.tsx`: 4 Termin-Karten als Platzhalter
- `app/profil/loading.tsx`: Avatar-Kreis + Textzeilen als Platzhalter
- Next.js zeigt diese automatisch beim Tab-Wechsel – „nichts passiert"-Gefühl beseitigt

**Query-Optimierung (Dashboard)**
- Profil- und Events-Abfragen werden jetzt gleichzeitig (`Promise.all`) statt nacheinander gestartet
- Geschätzte Einsparung: ~100–200ms pro Dashboard-Aufruf

**Vercel Region**
- Serverless Functions liefen in Washington D.C. (USA), Supabase in Frankfurt
- `vercel.json` mit `"regions": ["fra1"]` hinzugefügt → beide jetzt in Frankfurt
- Atlantiküberquerung (~100–150ms) pro Anfrage eliminiert

### Offene Punkte
- [ ] Eigene Domain einrichten (statt `frontend-sage-six-92.vercel.app`)

---

## SESSION 6 – Nutzerverwaltung
**Datum:** 08.06.2026
**Teilnehmer:** Steven, Claude

### Änderungen

**Datenbankänderung**
- Neues Feld `is_lead` (boolean) in `profiles`-Tabelle
- Steven Fredrickson hat `is_lead = true` – einziger Nutzer der Trainer einladen und Rollen ändern darf

**Einladungsformular (`/einladen`)**
- Rollen-Dropdown (Elternteil / Trainer) nur für Lead-Trainer sichtbar
- Server-seitige Validierung: nur `is_lead = true` darf Trainer-Rolle vergeben

**Profil-Seite (`/profil`)**
- Eigenes Profil kompakt oben als Visitenkarte (Avatar, Name, E-Mail, Rollen-Badge)
- Nutzerliste darunter (nur für Trainer sichtbar)
- Lead-Trainer kann Rollen ändern + Passwort-Reset-E-Mail senden

### Berechtigungen

| Aktion | Elternteil | Trainer | Lead-Trainer (Steven) |
|--------|-----------|---------|----------------------|
| Elternteil einladen | ✗ | ✓ | ✓ |
| Trainer einladen | ✗ | ✗ | ✓ |
| Nutzerliste sehen | ✗ | ✓ | ✓ |
| Rolle ändern | ✗ | ✗ | ✓ |
| Passwort-Reset senden | ✗ | ✗ | ✓ |

### Offene Punkte
- [ ] Eigene Domain einrichten (statt `frontend-sage-six-92.vercel.app`)

---

## SESSION 7 – Einladungsflow-Fix, Spielerkader & Bugfixes
**Datum:** 08.06.2026
**Teilnehmer:** Steven, Claude

### Änderungen

**Einladungsflow repariert**
- Problem: Nutzer landeten nach Klick auf Einladungslink auf der Login-Seite statt auf „Passwort festlegen"
- Ursache: Supabase nutzt den „Implicit Flow" – der Session-Token wird als URL-Hash (`#access_token=...`) übermittelt, den unser Server-Callback nicht lesen kann
- Fix: Einladungslinks zeigen jetzt direkt auf `/passwort-setzen` (statt Umweg über `/auth/callback`)
- Die Seite erkennt die Session automatisch via `onAuthStateChange` und zeigt sofort das Passwort-Formular
- Bei abgelaufenem Link erscheint eine klare Fehlermeldung statt der Login-Seite

**Dashboard-Spacing**
- „Weitere Termine"-Überschrift hat jetzt mehr Abstand nach oben (`mt-6`)

**Spielerkader angelegt (`players`-Tabelle)**
- `birth_year`-Feld auf optional gesetzt (war Pflichtfeld, wird nicht benötigt)
- 14 Spieler alphabetisch eingetragen (nur Vornamen):
  Daniel, David, David, Eymen, Hannes, Hannes, Jannis, Jonah Amini, Levi, Lyam, Mads Ole, Matti, Nino, Paul
- Nino = Spitzname von Nikolas Karl (Lui)

**Trainer-Account Passwort-Reset**
- Passwort für `steven.fredrickson@outlook.de` direkt per Admin-API zurückgesetzt
- Ursache: Passwort wurde durch einen Test-Reset überschrieben

### Offene Punkte
- [ ] Eigene Domain einrichten (statt `frontend-sage-six-92.vercel.app`)
- [ ] Spieler mit Eltern-Accounts verknüpfen (`parent_id` in `players`-Tabelle)
- [ ] Spielerkader in der App anzeigen (nächster Schritt Session 8)
- [ ] Profilfotos für Spieler (Supabase Storage, ~1,5 MB für 15 Fotos, zusammen mit Spieleransicht umsetzen)

---
