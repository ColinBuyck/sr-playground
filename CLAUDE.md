# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Screen Reader Playground** — an interactive tool to support first-time screen reader users through common web experiences.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check + production build
npm run lint      # ESLint validation
npm run preview   # Preview production build
```

There are no tests configured yet.

## Architecture

- **React 19 + Vite + TypeScript** single-page app
- Entry: `index.html` → `src/main.tsx` (React root) → `src/App.tsx`
- Two tsconfig files: `tsconfig.app.json` (browser/DOM code) and `tsconfig.node.json` (Vite config)
- ESLint uses flat config (`eslint.config.js`) with react-hooks and react-refresh plugins
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters` enforced

## Accessibility

This project is specifically about screen reader accessibility. All UI work must follow WCAG 2.2 standards — semantic HTML, correct ARIA attributes, keyboard navigation, and sufficient colour contrast are non-negotiable.
