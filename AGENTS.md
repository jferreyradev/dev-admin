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
  router.js          # Vue Router configuration
  style.css          # Tailwind + DaisyUI entrypoint
  
  config/            # Configuración central
    api.js           # URLs, tokens, headers y autenticación
    queries.js       # Catálogo de consultas/procedimientos SQL
  
  composables/       # Vue composables reutilizables
    useApiCall.js    # HTTP básico con auth automática
    useFetch.js      # HTTP con sistema de caché
    useEndpoints.js  # Generador dinámico de endpoints
    useQueries.js    # Ejecutor de consultas predefinidas
    useAppStore.js   # Store global de la aplicación
  
  components/        # Componentes Vue
    ApiConfig.vue    # UI para configurar URLs (local/producción)
    ConnectionInfo.vue
    DashBackends.vue
    HomePage.vue
    Navigation.vue
    SelectedBackend.vue
  
  views/             # Vistas de la aplicación
    AboutView.vue
    HomeView.vue
    QueryView.vue
    ProcedureView.vue
  
  assets/            # Static images imported in SFCs

public/              # Static assets served as-is (favicon.svg, icons.svg)
API-GUIDE.md         # Documentación completa de arquitectura de API
```

## API y Configuración

El proyecto utiliza una arquitectura unificada de conexiones HTTP centralizada y reutilizable:

- **`config/api.js`**: Configuración central (URLs, tokens, headers). Ver [API-GUIDE.md](./API-GUIDE.md)
- **`useApiCall`**: Llamadas HTTP simples con autenticación automática
- **`useFetch`**: Llamadas HTTP con sistema de caché (auto/manual/off)
- **`useEndpoints`**: Genera URLs dinámicas según entorno (local/producción) y backend
- **`useQueries`**: Ejecuta consultas SQL y procedimientos predefinidos

**Configuración dinámica**: Toggle entre URL local (`http://localhost:3008`) y producción mediante `<ApiConfig />` en navbar.

**Para detalles completos**: Ver [API-GUIDE.md](./API-GUIDE.md)

## Conventions

- Image imports via relative path from SFCs (Vite handles bundling).
- Tailwind CSS customization goes in `src/style.css` using `@theme`, `@plugin`, etc. (v4 style).
- DaisyUI theme overrides via CSS (no JS options object).
- No testing, linting, or typechecking tooling is configured.
- Recommended VSCode extension: `Vue.volar` (see `.vscode/extensions.json`).
- Package manager: npm. Lockfile: `package-lock.json`.
