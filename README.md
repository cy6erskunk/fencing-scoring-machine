### Fencing Scoring Machine

A lightweight web app that simulates the behaviour of a remote control for fencing scoring machines. This simulator is built with React, TypeScript, Vite, and Tailwind CSS, and is created for educational purposes only. It is not affiliated with or endorsed by any scoring machine manufacturers. Some buttons are intentionally non-functional, and others are simplified.

---

## Features

- **React + TypeScript**: Fast, type-safe UI development
- **Vite**: Instant dev server and optimized build
- **Tailwind CSS**: Utility-first styling
- **ESLint**: Consistent code quality

## About the Simulator

- **Purpose**: Educational demonstration of a fencing scoring remote UI and basic interactions.
- **Scope**: Not a full scoring system, and not a substitute for official equipment.
- **Disclaimer**: Behaviour is intentionally simplified; timing, penalties, and rules are not exhaustive.

## Simulator behaviour

The following reflects the current implementation in `src/components/FencingRemote.tsx`:

- **Timer**
  - Counts down once per second when running and not paused.
  - Automatically stops at 0 and clears running/paused state.
  - Display format is `M:SS`.

- **START / STOP**
  - Toggles running state; also clears pause when starting.

- **PAUSE 1MIN**
  - Starts a fixed 60-second pause (regardless of whether the match timer is running or stopped).
  - During pause, the main clock shows the 60-second countdown and the status displays `PAUSE`.
  - After 60 seconds: **Match Count** increments by 1, the match timer resets to 3:00, and remains stopped until `START` is pressed.
  - Any scheduled pause is cancelled if time hits 0 or `SET` is pressed.

- **SET**
  - Single click: sets time to 3:00 and stops the timer.
  - Double click (within 500ms): sets time to 1:00 and stops the timer.

- **SCORING (+ / -)**
  - Left `+` / Right `+`: increments the respective score by 1.
  - Left `-` / Right `-`: decrements the respective score, flooring at 0.
  - **MISE A ZERO**: resets both scores to 0.

- **CARDS**
  - **CARD ROUGE** (left/right): toggles red card on/off for the respective side.
  - **CARD JAUNE** (left/right): toggles yellow card on/off for the respective side.
  - The scoreboard shows an indicator light (colored when on, gray when off)

- **PRIORITY (P)**
  - Display: a letter `P` appears next to the side that has priority.
  - **P MAN**: manual cycle — none → left → right → none.
  - **P CAS**: random assignment — if none, randomly assigns left or right; if already assigned, clears to none.

- **MATCH COUNT**
  - Manual press cycles: `0 → 1 → 2 → 3 → 0`.
  - Starts disabled at `0`. While `0`, it does not auto-advance on pause completion.
  - Once set manually to `1`, `2`, or `3`, pause completion auto-advances it in a cycle: `1 → 2 → 3 → 1`.

### Non-functional controls (placeholders)

These buttons are present for UI completeness but have no effect in this simulator:

- `REARM`
- `BLOCK`
- `TELEC ACQUIS`

## Getting Started

### Prerequisites

- Node.js 18+ (recommend 18 LTS or 20)
- npm 9+

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

The dev server will print a local URL (typically `http://localhost:5173`).

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## End-to-End Tests (Playwright)

### Run tests

```bash
# All tests across Chromium, Firefox, WebKit
npx playwright test

# Single spec
npx playwright test e2e/start-stop.spec.ts
```

The test runner starts the Vite dev server automatically (see `playwright.config.ts`).

### Selector strategy (accessible-first)

Tests use accessible locators to mirror real user interactions and improve reliability:
- Buttons via role/name: `getByRole('button', { name: 'left yellow card' })`.
- Status via stable label: the status element has `aria-label="status"`; assert its text with `getByLabel('status')` and `toHaveText(...)`.
- Buttons may expose `aria-pressed` for state.

This reduces brittleness compared to text or class-based selectors and makes tests self-documenting.

### Time control with fake timers

To make timing deterministic and fast, tests use Playwright's fake timers:

```ts
await page.clock.install();
// ... actions ...
// Advance virtual time so setInterval/setTimeout callbacks run
await page.clock.runFor?.(60_000) ?? await page.clock.fastForward(60_000);
```

- The fake clock is scoped to the current test's page and resets between tests.
- Use `await page.clock.uninstall()` within a test if you need to return to real time.

### Cross-browser

All specs run on Chromium, Firefox, and WebKit in CI-equivalent conditions. Prefer accessible selectors and fake timers to avoid flakiness across engines.

## Tech Stack

- **React 18** (`react`, `react-dom`)
- **Vite 5** (`vite`, `@vitejs/plugin-react`)
- **TypeScript 5**
- **Tailwind CSS 3** (`tailwindcss`, `postcss`, `autoprefixer`)
- **ESLint 9** (with `@eslint/js`, `typescript-eslint`)
- **Icons**: `lucide-react`

## Project Structure

```text
.
├── index.html
├── public/
│   └── image.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   └── components/
│       └── FencingRemote.tsx
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## Tailwind

- Global styles live in `src/index.css`.
- Configure design tokens in `tailwind.config.js`.

## Deployment

Any static host works. After `npm run build`, deploy the contents of `dist/` to your host (e.g., Netlify, Vercel, GitHub Pages, S3).

## License

MIT


