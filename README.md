### Fencing Scoring Machine

A lightweight web app for fencing scoring built with React, TypeScript, Vite, and Tailwind CSS.

---

## Features

- **React + TypeScript**: Fast, type-safe UI development
- **Vite**: Instant dev server and optimized build
- **Tailwind CSS**: Utility-first styling
- **ESLint**: Consistent code quality

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


