# tellmenext.games - Zufällige Spielempfehlungen

Eine moderne Non-Profit-Website, die basierend auf deinen Präferenzen zufällig passende Spiele vorschlägt.

## Features

- 🎮 Filterung nach Plattform, Store, Genre und Preis
- 🎲 Intelligente Zufallsauswahl mit verschiedenen Algorithmen
- 🔗 Teilbare Links mit reproduzierbaren Ergebnissen
- 📱 Vollständig responsive und barrierefrei
- 🌙 Dark Mode als Standard
- ⚡ Optimierte Performance mit Caching
- 🎨 Smooth Animationen mit Framer Motion

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **UI Components**: shadcn/ui
- **APIs**: RAWG API (primär), Steam Web API, Epic Games Store
- **State Management**: React Hooks + URL State
- **Deployment**: Vercel-optimiert

## Setup

1. **Repository klonen**
   \`\`\`bash
   git clone <repository-url>
   cd tellmegames
   \`\`\`

2. **Dependencies installieren**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Umgebungsvariablen konfigurieren**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
    Füge deine API-Keys hinzu:
    - `RAWG_KEY`: Kostenlos bei [RAWG.io](https://rawg.io/apidocs)
    - `STEAM_API_KEY`: Optional bei [Steam Web API](https://steamcommunity.com/dev/apikey)
    - `NEXT_PUBLIC_BASE_URL`: Basis-URL der Anwendung (Standard: `http://localhost:3000`)

4. **Development Server starten**
   \`\`\`bash
   pnpm dev
   \`\`\`

5. **Öffne** [http://localhost:3000](http://localhost:3000)

## API-Keys erhalten

### RAWG API (Empfohlen)
1. Gehe zu [RAWG.io](https://rawg.io/apidocs)
2. Erstelle einen kostenlosen Account
3. Generiere einen API-Key
4. Füge ihn als `RAWG_KEY` in `.env.local` hinzu

### Steam Web API (Optional)
1. Gehe zu [Steam Web API](https://steamcommunity.com/dev/apikey)
2. Melde dich mit deinem Steam-Account an
3. Generiere einen API-Key
4. Füge ihn als `STEAM_API_KEY` in `.env.local` hinzu

## Deployment

### Vercel (Empfohlen)
1. Pushe den Code zu GitHub
2. Verbinde das Repository mit Vercel
3. Füge die Umgebungsvariablen in den Vercel-Einstellungen hinzu
4. Deploy!

### Andere Plattformen
Das Projekt ist als statische Next.js-App konfiguriert und kann auf jeder Plattform deployed werden, die Node.js unterstützt.

## Projektstruktur

\`\`\`
/app
  /api/games/route.ts          # Game API aggregation
  /legal/                      # Impressum & Datenschutz
  page.tsx                     # Hauptseite
/components
  FilterBar.tsx                # Hauptfilter-Interface
  GameCard.tsx                 # Spielanzeige
  HistoryStrip.tsx            # Verlauf
  ShareDialog.tsx             # Teilen-Dialog
  /ui/                        # shadcn/ui Komponenten
/lib
  /api/                       # API-Integrationen
  mapping.ts                  # Genre/Platform Mappings
  random.ts                   # Randomization Logic
  sharing.ts                  # Share Functionality
\`\`\`

## Performance

- ⚡ Lighthouse Score: 90+ Performance
- ♿ WCAG AA Accessibility
- 📱 Mobile-First Design
- 🚀 Edge Runtime für API Routes
- 💾 Intelligentes Caching (5-15 Min)

## Rechtliches

Diese Website steht in keiner Verbindung zu Steam, Xbox, PlayStation, Epic Games, Nintendo oder anderen genannten Marken. Alle genannten Marken- und Produktnamen sind Eigentum ihrer jeweiligen Inhaber und werden ausschließlich zu beschreibenden Zwecken verwendet.

## Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.
