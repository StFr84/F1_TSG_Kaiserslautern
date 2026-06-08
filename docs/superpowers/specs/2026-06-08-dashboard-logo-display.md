# Dashboard Logo Display – Design Spec

**Datum:** 2026-06-08

## Problem

Das TSG-Logo im Dashboard-Header erscheint in einer weißen gerundeten Box auf dem roten Header. Der weiße Rahmen stört das visuelle Bild – der Adler soll direkt auf TSG-Rot sichtbar sein.

## Lösung

Den weißen Wrapper-Div entfernen. Da `logo.png` echte Transparenz hat (75% der Pixel sind transparent), zeigt der rote Header-Hintergrund durch die transparenten Bereiche.

Statt das Bild zu skalieren (was den Adler verkleinert), wird der Adler-Teil des Banners in nativer Auflösung angezeigt und per `overflow: hidden` auf den sichtbaren Bereich begrenzt.

## Änderung

**Datei:** `app/dashboard/page.tsx`

Vorher:
```jsx
<div className="bg-white rounded-lg p-1.5">
  <Image src="/logo.png" alt="TSG 1861 Kaiserslautern" width={72} height={36} />
</div>
```

Nachher:
```jsx
<div className="overflow-hidden" style={{ width: 56, height: 48 }}>
  <Image src="/logo.png" alt="TSG 1861 Kaiserslautern" width={283} height={75} style={{ maxWidth: 'none' }} />
</div>
```

## Ergebnis

- Kein weißer Rahmen
- Adler direkt auf TSG-Rot (#9B1C2E)
- Adler größer und klarer sichtbar als vorher
