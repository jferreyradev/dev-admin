# dev-admin

Vue 3 + Vite scaffold (no router, no store, no tests).

## Commands

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # Vite production build -> dist/
npm run preview  # Preview production build
```

## Stack

- **Vue 3** — `<script setup>` SFCs (the only style used).
- **Tailwind CSS v4** — config-free, all customization via CSS (`@theme` directives in `src/style.css`). No `tailwind.config.js`. Uses `@tailwindcss/vite` plugin.
- **DaisyUI v5** — registered via `@plugin "daisyui"` in `src/style.css`. Theme or component overrides via CSS.
- **Vite** — plugin order matters: `tailwindcss()` before `vue()`.

## Structure

```
index.html           # Entrypoint (Vite root)
src/
  main.js            # createApp(App).mount('#app')
  App.vue            # Root SFC
  components/        # Single component: HelloWorld.vue
  assets/            # Static images imported in SFCs
  style.css          # Tailwind + DaisyUI entrypoint
public/              # Static assets served as-is (favicon.svg, icons.svg)
```

## Conventions

- Image imports via relative path from SFCs (Vite handles bundling).
- Tailwind CSS customization goes in `src/style.css` using `@theme`, `@plugin`, etc. (v4 style).
- DaisyUI theme overrides via CSS (no JS options object).
- No testing, linting, or typechecking tooling is configured.
- Recommended VSCode extension: `Vue.volar` (see `.vscode/extensions.json`).
- Package manager: npm. Lockfile: `package-lock.json`.
