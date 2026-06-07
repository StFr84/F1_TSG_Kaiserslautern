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
- [ ] Logo-Genehmigung TSG Kaiserslautern (Vorstand kontaktieren)
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
- **Logo:** Genehmigung beim TSG Vorstand ausstehend

### Ergebnisse
- Designsystem dokumentiert: `03_Design/designsystem.md`
- Spec aktualisiert: `docs/superpowers/specs/2026-06-07-tsg-connect-design.md`
- Wireframes erstellt: Login-Screen + Dashboard Startscreen

### Offene Punkte
- [ ] Logo-Genehmigung einholen (Vorstand TSG)
- [ ] Backlog priorisieren → MVP-Scope definieren
- [ ] Implementierung Session 3

---
