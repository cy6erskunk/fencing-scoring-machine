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
  - Toggles pause only while running.
  - Note: Despite the label, it does not set a 1‑minute countdown; it simply pauses/resumes.

- **SET**
  - Single click: sets time to 3:00 and stops the timer.
  - Double click (within 500ms): sets time to 1:00 and stops the timer.

- **SCORING (+ / -)**
  - Left `+` / Right `+`: increments the respective score by 1.
  - Left `-` / Right `-`: decrements the respective score, flooring at 0.
  - **MISE A ZERO**: resets both scores to 0.

- **CARDS**
  - **CARD ROUGE** (left/right): increments red card count for the respective side.
  - **CARD JAUNE** (left/right): increments yellow card count for the respective side.

- **MATCH COUNT**
  - Increments a simple counter displayed under the scoreboard.

### Non-functional controls (placeholders)

These buttons are present for UI completeness but have no effect in this simulator:

- `REARM`
- `P MAN`
- `BLOCK`
- `P CAS`
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


