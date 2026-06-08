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

## SESSION 4 – Deployment & CI/CD
**Datum:** 08.06.2026  
**Teilnehmer:** Steven, Claude

### Entscheidungen
- **Deployment-Plattform:** Vercel (war bereits gesetzt, jetzt sauber verbunden)
- **CI/CD:** GitHub Actions – automatisches Deploy bei jedem Push auf `main`
- **GitHub Pages:** deaktiviert (war für alte HTML-Version, nicht kompatibel mit Next.js)
- **Repository:** `StFr84/F1_TSG_Kaiserslautern` – alte HTML-Version durch neue Next.js-App ersetzt

### Ergebnisse
- GitHub Actions Workflow eingerichtet: `.github/workflows/deploy.yml`
- Jeder Push auf `main` → automatisches Vercel-Produktions-Deployment (~1 Minute)
- Supabase-Umgebungsvariablen sicher als GitHub Secrets hinterlegt
- GitHub Pages deaktiviert
- Deployment-URL: `https://frontend-sage-six-92.vercel.app`

### Wie das Deployment funktioniert
1. Code-Änderung lokal entwickeln und testen
2. `git push origin main` → GitHub Actions startet automatisch
3. Vercel baut die App und deployed sie
4. Änderung ist live

### Offene Punkte
- [ ] Eigene Domain einrichten (statt `frontend-sage-six-92.vercel.app`)
- [ ] Logo-Datei in App einbauen

---
