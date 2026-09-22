# CLAUDE.md — Tidemark Codebase Guide

This file provides AI assistants with essential context about the Tidemark codebase, conventions, and development workflows.

---

## Project Overview

**Tidemark** is a marine risk intelligence platform for capital allocators, underwriters, and decision-makers. It is a lightweight React SPA (Single-Page Application) that provides:

- **Live Intelligence** — real-time marine conditions via interactive Leaflet map
- **Risk Screener** — 5-dimension ocean risk assessment across sectors and regions
- **Project Scorer** — AI-powered due diligence memo (Anthropic API integration planned)
- **Pipeline Tracker** — compare and track multiple assessments

The application targets six distinct user personas: Insurer, DFI (Development Finance), Foundation, Port Operator, Corporate, and Government.

---

## Repository Structure

```
/home/user/Tidemark/
├── CLAUDE.md                   # This file
├── tidemark/                   # Main project root
│   ├── index.html              # HTML entry point (loads fonts, mounts #root)
│   ├── package.json            # Dependencies and npm scripts
│   ├── vite.config.js          # Vite build configuration (minimal)
│   ├── vercel.json             # Vercel SPA routing: all routes → "/"
│   ├── README.md               # User-facing documentation
│   └── src/
│       ├── main.jsx            # React entry point (renders <App />)
│       └── App.jsx             # Entire application — ~1100 lines, all components here
└── tidemark zip.zip            # Compressed archive (ignore)
```

**All application code lives in a single file: `tidemark/src/App.jsx`.**

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18.2.0 (functional components + hooks) |
| Build Tool | Vite 5.1.0 |
| Styling | Inline `style` props only (no CSS files, no CSS-in-JS library) |
| Mapping | Leaflet 1.9.4 (dynamically loaded from CDN at runtime) |
| Language | JavaScript (JSX) — no TypeScript |
| Deployment | Vercel (recommended) |
| Testing | None configured |

**External APIs (no auth keys required):**
- `https://geocoding-api.open-meteo.com/v1/search` — location autocomplete
- `https://marine-api.open-meteo.com/v1/marine` — live marine conditions
- `https://www.gebco.net/.../mapserv` — GEBCO bathymetry WMS tiles
- Esri/ArcGIS and OpenStreetMap tile servers

---

## Development Commands

All commands run from the `tidemark/` directory:

```bash
cd tidemark

npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173 (with HMR)
npm run build        # Build production output to dist/
npm run preview      # Preview production build locally
```

There is no database, no backend, no environment variables required, and no `.env` file needed.

---

## Architecture

### Component Structure

Everything lives in `src/App.jsx`. The internal organization (top to bottom) is:

1. **Imports** — React only
2. **`loadLeaflet()`** — Promise-based dynamic CDN loader for Leaflet
3. **Design tokens** — `C` (colors) and `F` (fonts) constants
4. **`PERSONAS`** — Array of 6 user persona objects
5. **`DIMENSION_INTEL`** — 5 ocean risk dimensions with scientific citations
6. **Static data** — `SECTORS`, `REGIONS`, `RISK_DATA` matrix, `ECOSYSTEMS`
7. **Helpers** — `riskMeta()`, `avg()`, animated number hook
8. **Primitive components** — `Card`, `SLabel`, `Gauge`, `Num`
9. **`Nav`** — Sticky top navigation bar
10. **Page components** — `PersonaSelector`, `DimensionCard`, `LiveIntelligence`, `RiskScreener`, `ProjectScorer`, `Pipeline`
11. **`App`** — Root component acting as page router via `useState`

### Routing

No routing library. The `App` component manages a `page` state variable:

```javascript
const [page, setPage] = useState('intel');
// Pages: 'intel' | 'screener' | 'scorer' | 'pipeline'
```

Navigation calls `setPage()`. There are no URLs or browser history changes.

### State Management

Pure React hooks — no Redux, Zustand, or other state library:
- `useState` for all UI and data state
- `useEffect` for side effects (API calls, Leaflet initialization)
- `useRef` for Leaflet map DOM references
- `useCallback` for memoized callbacks

**There is no data persistence.** All state resets on page reload.

---

## Conventions

### Naming

| Category | Convention | Examples |
|----------|-----------|---------|
| Components | PascalCase | `App`, `Nav`, `RiskScreener`, `DimensionCard` |
| Constants/data | UPPER_SNAKE_CASE | `PERSONAS`, `RISK_DATA`, `SECTORS` |
| Functions/helpers | camelCase | `riskMeta()`, `avg()`, `loadLeaflet()` |
| State variables | camelCase | `page`, `persona`, `loading`, `mapLayer` |
| Design token objects | Single capital letter | `C` for colors, `F` for fonts |

### Styling

All styles are inline React `style` objects. There are no `.css` files and no CSS modules. Design tokens at the top of `App.jsx` define the color palette and typography:

```javascript
const C = {
  bg:        '#060d12',   // darkest background
  surface:   '#0b1720',   // card/panel background
  surfaceHi: '#112030',   // elevated surface
  border:    '#1a3045',   // border color
  teal:      '#34b798',   // primary accent
  sand:      '#eeeae2',   // primary text
  // ... etc
};

const F = {
  body: "'DM Sans', sans-serif",
  mono: "'JetBrains Mono', monospace",
};
```

Always use `C.*` and `F.*` tokens rather than hardcoding hex values or font strings.

### Section Headers

Use decorative ASCII separators for major code sections:

```javascript
// ─── SECTION NAME ────────────────────────────────────────────
```

### Risk Dimensions

The 5 ocean risk dimensions use short keys throughout the code:

| Key | Full Name |
|-----|-----------|
| `cf` | Coastal Flood Risk |
| `bio` | Biodiversity Loss Risk |
| `reg` | Regulatory & Transition Risk |
| `sc` | Supply Chain & Dependency Risk |
| `pc` | Physical Climate Risk |

---

## Key Data Structures

### PERSONAS
```javascript
{ id, label, icon, tagline, focus: [strings], dimWeights: { cf, bio, reg, sc, pc } }
```
Each persona has dimension weights (0–1) that adjust risk scoring emphasis.

### DIMENSION_INTEL
```javascript
{
  cf: { label, icon, headline, why, frameworks: [...], signals: [...], actions: [...] },
  // ... same for bio, reg, sc, pc
}
```

### RISK_DATA
```javascript
{
  [sectorKey]: { [regionKey]: { cf, bio, reg, sc, pc } }
}
```
Values are 0–100 risk scores for each dimension combination.

---

## Leaflet Map Integration

Leaflet is **not installed as an npm package** — it is loaded dynamically from CDN:

```javascript
function loadLeaflet() {
  // injects <link> and <script> tags, returns Promise<L>
}
```

Map initialization happens inside a `useEffect` with a `useRef` for the container. When modifying map behavior, be aware that:
- The map must be destroyed (`mapRef.current.remove()`) before re-initializing
- Leaflet attaches CSS via injected `<link>` tag
- Map tiles: OSM (default), GEBCO bathymetry, Esri satellite

---

## What Does NOT Exist

- No TypeScript (no `.ts`/`.tsx` files, no `tsconfig.json`)
- No testing framework (no Jest, Vitest, Cypress, etc.)
- No linting config (no `.eslintrc`, no `.prettierrc`)
- No git hooks (no husky, no lint-staged)
- No CSS files (no `.css`, `.scss`, `.module.css`)
- No environment variables (no `.env` file needed)
- No backend or database
- No state management library
- No routing library
- No Docker or CI/CD pipelines

---

## Adding New Features

When adding features to this codebase:

1. **New pages:** Add a new page component at the bottom of `App.jsx` (before the `App` function), add a `page` value, update `Nav` to include it, and add a render branch in `App`.
2. **New risk data:** Extend `RISK_DATA`, `SECTORS`, or `REGIONS` constants at the top of `App.jsx`.
3. **New personas:** Add to the `PERSONAS` array with appropriate `dimWeights`.
4. **Styling:** Always use existing `C.*` and `F.*` tokens. For new colors, add to `C` first.
5. **External API calls:** Use `fetch` with `async/await` inside `useEffect`. Handle loading and error states with `useState`.
6. **Maps:** Use the existing `loadLeaflet()` pattern with `useRef` + `useEffect`.

**Avoid splitting into multiple files unless the single-file approach becomes truly unmanageable.** The current monolithic style is intentional for simplicity of deployment.

---

## Deployment

**Vercel (recommended):**
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Deploy — Vercel auto-detects Vite

The `vercel.json` rewrites all routes to `/` for SPA behavior.

**Manual:**
```bash
cd tidemark && npm run build
# Serve the dist/ directory with any static host
```

---

## Project Scorer / Anthropic API

The Project Scorer feature has a form UI but the AI scoring backend is **not yet implemented**. The README references an Anthropic API requirement. When implementing:
- Use `claude-sonnet-4-6` or later as the model
- The API key would need to be provided at runtime (no backend to store secrets)
- Consider a server-side proxy to avoid exposing the API key in the browser
