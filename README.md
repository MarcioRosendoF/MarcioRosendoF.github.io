# Dev.Log – Portfolio of Márcio Rosendo

Dev.Log is the personal portfolio of **Márcio Rosendo**, a Gameplay Programmer focused on developing polished and robust games.
The site itself is built as a lightweight SPA meant to be a clean, polished first impression, emphasizing clarity and presentation
(Three.js background, GSAP animations, custom cursor, smooth scrolling, and full i18n).

## Stack

- HTML5 (single-page structure)
- Tailwind CSS (via CLI, utility-first)
- Vanilla JavaScript (no frameworks)
- Three.js (interactive particle background)
- GSAP (animations and transitions)
- Lenis (smooth scrolling)
- Lucide Icons
- Google Analytics 4 (event tracking)

## Running Locally (Dev)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Tailwind watcher (generates `css/output.css`):
   ```bash
   npm run dev
   ```
3. Serve the project as a static site and open it in the browser:
   - Open `index.html` with a simple static server (e.g. VS Code Live Server, `npx serve`, etc.).

> The browser only reads `css/output.css`. All Tailwind changes should be made in `css/input.css` or via classes in `index.html`, then compiled with the command above.

## Build for Production

Generate a minified CSS bundle:

```bash
npm run build
```

This compiles and minifies Tailwind into `css/output.css`, which is what is used in production.

## Deploy (GitHub Pages)

This repository is designed to be deployed directly from the repository root with **GitHub Pages**:

- Build CSS for production (`npm run build`).
- Push the latest changes to the repository.
- In GitHub: `Settings → Pages`, set:
  - **Source**: “Deploy from a branch”
  - **Branch**: `main` (or the default branch)
  - **Folder**: `/ (root)`

The published site is intended as Márcio’s personal portfolio, not as a starter template.

