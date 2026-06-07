# TSG Connect – Design System

## Farben

| Token | Wert | Verwendung |
|-------|------|-----------|
| `--color-primary` | `#9B1C2E` | Buttons, Header, Akzente |
| `--color-primary-dark` | `#7a1524` | Hover-States |
| `--color-primary-light` | `#c4394f` | Icons, Highlights |
| `--color-background` | `#ffffff` | App-Hintergrund |
| `--color-surface` | `#f5f5f5` | Karten, Listen |
| `--color-text` | `#1a1a1a` | Fließtext |
| `--color-text-secondary` | `#6b7280` | Subtexte, Labels |
| `--color-success` | `#16a34a` | Zusagen, Bestätigung |
| `--color-warning` | `#d97706` | Ausstehend, Erinnerung |
| `--color-error` | `#dc2626` | Absagen, Fehler |

> Hinweis: Exakte Werte per Browser DevTools auf tsg1861kl.de verifizieren (F12 → Computed Styles)

## Schrift

| Token | Wert |
|-------|------|
| `--font-family` | System-UI, -apple-system, sans-serif (bis Vereinsschrift bekannt) |
| `--font-size-base` | 16px |
| `--font-size-sm` | 14px |
| `--font-size-lg` | 18px |
| `--font-size-xl` | 24px |

## Logo

- Lokal: `~/Desktop/tsg1861kaiserslautern.png`
- Remote: `https://tsg1861kl.de/wp-content/uploads/2025/06/tsg1861kaiserslautern.png`
- **Verwendung im App nur nach schriftlicher Genehmigung des TSG Vorstands**

## Komponenten

- Buttons: Rounded (border-radius: 8px), Primärfarbe
- Karten: Weiß, leichter Schatten (box-shadow: 0 1px 3px rgba(0,0,0,0.1))
- Navigation: Bottom Nav (Mobile-First), 4-5 Icons
- Icons: Lucide React oder HeroIcons
