# Guía de API y Conexiones - dev-admin

Este documento describe la arquitectura unificada de conexiones HTTP y configuración de API del proyecto, diseñada para ser reutilizable en otros proyectos.

## 📋 Tabla de Contenidos

- [Arquitectura General](#arquitectura-general)
- [Configuración Central](#configuración-central)
- [Composables HTTP](#composables-http)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Migración a Otros Proyectos](#migración-a-otros-proyectos)

---

## 🏗️ Arquitectura General

### Estructura de Archivos

```
src/
├── config/
│   ├── api.js              # Configuración central de API y autenticación
│   └── queries.js          # Catálogo de consultas/procedimientos predefinidos
│
├── composables/
│   ├── useApiCall.js       # Llamadas HTTP autenticadas simples
│   ├── useFetch.js         # Llamadas HTTP con sistema de caché
│   ├── useEndpoints.js     # Generador dinámico de endpoints
│   ├── useQueries.js       # Ejecutor de consultas predefinidas
│   └── useAppStore.js      # Store global de la aplicación
│
└── components/
    └── ApiConfig.vue       # UI para configurar URLs (local/producción)
```

### Flujo de Datos

```
┌─────────────────┐
│   api.js        │ ← Configuración central (URLs, tokens, headers)
└────────┬────────┘
         │
    ┌────┴────────────────────────┐
    │                             │
┌───▼────────────┐    ┌──────────▼─────────┐
│ useEndpoints   │    │  useApiCall        │
│ (genera URLs)  │    │  (HTTP básico)     │
└───┬────────────┘    └──────────┬─────────┘
    │                            │
    │         ┌──────────────────┴──────────┐
    │         │                             │
┌───▼─────────▼──┐              ┌──────────▼─────────┐
│  useQueries    │              │   useFetch         │
│  (consultas    │              │   (HTTP + caché)   │
│   predefinidas)│              │                    │
└────────────────┘              └────────────────────┘
```

---

## ⚙️ Configuración Central

### `src/config/api.js`

Archivo central que gestiona toda la configuración de conexión.

#### Constantes Principales

```javascript
// URLs por defecto
export const DEFAULT_BASE_URL = "https://api.produccion.com";
export const DEFAULT_LOCAL_URL = "http://localhost:3008";

// Token de autenticación
export const PROXY_TOKEN = "tu-token-aqui";
```

#### Funciones Clave

##### `getBaseUrl()`

Obtiene la URL base actual según la configuración del usuario.

```javascript
import { getBaseUrl } from '@/config/api';

const baseUrl = getBaseUrl(); 
// Retorna: URL configurada (local o producción)
```

##### `shouldUsePrefix()`

Determina si se debe usar el prefijo del backend en la URL.

```javascript
import { shouldUsePrefix } from '@/config/api';

const usePrefix = shouldUsePrefix();
// true = URLs remotas con prefijo (/desa, /prod)
// false = URLs locales sin prefijo
```

##### `getAuthHeaders(additionalHeaders?)`

Genera headers HTTP con autenticación automática.

```javascript
import { getAuthHeaders } from '@/config/api';

const headers = getAuthHeaders({ 'X-Custom': 'value' });
// Retorna: {
//   'Content-Type': 'application/json',
//   'Authorization': 'Bearer <token>',
//   'X-Custom': 'value'
// }
```

##### `getAuthFetchConfig(method, body, additionalHeaders?)`

Genera configuración completa para `fetch()`.

```javascript
import { getAuthFetchConfig } from '@/config/api';

const config = getAuthFetchConfig('POST', { data: 'value' });
// Retorna objeto listo para: fetch(url, config)
```

---

## 🔌 Composables HTTP

### `useApiCall` - HTTP Básico

Para llamadas HTTP simples con autenticación automática.

**Cuándo usar:**
- Operaciones simples (CREATE, UPDATE, DELETE)
- No necesitas caché
- Control manual del ciclo de vida

**API:**

```javascript
import { useApiCall } from '@/composables/useApiCall';

const { call, loading, error } = useApiCall();

// Llamada autenticada (automática)
const data = await call(url, {
  method: 'POST',
  body: { key: 'value' }
});

// Llamada sin autenticación
const publicData = await call(url, {
  method: 'GET',
  skipAuth: true
});
```

**Características:**
- ✅ Autenticación automática
- ✅ Estados reactivos (loading, error)
- ✅ Logging en consola
- ✅ Manejo de errores

---

### `useFetch` - HTTP con Caché

Para llamadas HTTP que se benefician de caché (lecturas frecuentes).

**Cuándo usar:**
- Listados de datos (backends, usuarios, etc.)
- Datos que no cambian frecuentemente
- Optimizar requests repetidos

**API:**

```javascript
import { useFetch } from '@/composables/useFetch';
import { getBaseUrl } from '@/config/api';

const baseUrl = getBaseUrl();

// Con caché automático (5 min)
const { data, loading, error, refetch, clearCache } = useFetch(
  `${baseUrl}/api/backends`,
  { cacheMode: 'auto' }
);

// Caché manual (nunca expira)
const { data } = useFetch(url, { cacheMode: 'manual' });

// Sin caché
const { data } = useFetch(url, { cacheMode: 'off' });
```

**Características:**
- ✅ Sistema de caché con 3 modos (auto, manual, off)
- ✅ AbortController (cancela requests previos)
- ✅ Auto-fetch en `onMounted`
- ✅ Watch en URL reactivas
- ✅ Autenticación automática

**Modos de Caché:**

| Modo     | Comportamiento                          | Uso Recomendado               |
|----------|-----------------------------------------|-------------------------------|
| `auto`   | Expira en X tiempo (default: 5 min)    | Datos que cambian poco        |
| `manual` | Nunca expira (hasta `refetch()`)        | Configuraciones estáticas     |
| `off`    | Sin caché (siempre hace request nuevo)  | Datos en tiempo real          |

---

### `useEndpoints` - Generador de URLs

Genera URLs dinámicas según el entorno (local/producción) y backend seleccionado.

**API:**

```javascript
import { useEndpoints } from '@/composables/useEndpoints';

const endpoints = useEndpoints();

// Acceder a endpoints
console.log(endpoints.value.query);      // URL para consultas SQL
console.log(endpoints.value.procedure);  // URL para procedimientos
console.log(endpoints.value.ping);       // URL para ping

// Con prefijo específico
const customEndpoints = useEndpoints('produccion');
```

**Endpoints Disponibles:**

```javascript
{
  ping: '${baseUrl}/ping',
  query: '${baseUrl}/query',
  procedure: '${baseUrl}/procedure',
  procedureAsync: '${baseUrl}/procedure/async',
  jobs: '${baseUrl}/jobs',
  jobStatus: (id) => '${baseUrl}/jobs/${id}',
  deleteJob: (id) => '${baseUrl}/jobs/${id}',
  deleteCompletedJobs: '${baseUrl}/jobs?status=completed',
  deleteOldJobs: '${baseUrl}/jobs?older_than=7',
  logs: '${baseUrl}/logs',
  exec: '${baseUrl}/exec',
}
```

**Comportamiento Dinámico:**

- **Producción + Backend "desa"**: `https://api.com/desa/query`
- **Local**: `http://localhost:3008/query` (sin prefijo)

---

### `useQueries` - Consultas Predefinidas

Ejecuta consultas SQL y procedimientos almacenados predefinidos.

**API:**

```javascript
import { useQueries } from '@/composables/useQueries';

const { 
  executeQuery, 
  executeProcedure, 
  results, 
  columns, 
  loading, 
  error 
} = useQueries();

// Ejecutar consulta SQL
await executeQuery('usuarios.getById', { id: 123 });
console.log(results.value); // [{id: 123, name: '...'}]
console.log(columns.value); // ['id', 'name', ...]

// Ejecutar procedimiento
await executeProcedure('usuarios.crear', {
  nombre: 'Juan',
  email: 'juan@example.com'
});

// Procedimiento asíncrono
const job = await executeProcedure(
  'reportes.generarActividad',
  { fecha_inicio: '2024-01-01', fecha_fin: '2024-12-31' },
  true // async = true
);
console.log(job.job_id);
```

**Definir Consultas:** Ver `src/config/queries.js`

---

## 🔄 Flujo de Trabajo

### 1. Configuración Inicial

El usuario puede cambiar entre modo local y producción usando el componente `ApiConfig`:

```vue
<!-- Ya integrado en Navigation.vue -->
<ApiConfig />
```

- **Dropdown "API"** → Ver URL actual
- **"Cambiar modo"** → Toggle rápido local/producción
- **"Configurar URLs"** → Modal para personalizar URLs

### 2. Endpoints Dinámicos

`useEndpoints` genera URLs automáticamente:

```javascript
// El composable detecta el modo actual
const endpoints = useEndpoints();

// Si estás en modo local:
endpoints.value.query → "http://localhost:3008/query"

// Si estás en producción con backend "desa":
endpoints.value.query → "https://api.com/desa/query"
```

### 3. Llamadas HTTP

Todos los composables incluyen autenticación automática:

```javascript
// ❌ ANTES (manual)
fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PROXY_TOKEN}`
  },
  body: JSON.stringify(data)
})

// ✅ AHORA (automático)
const { call } = useApiCall();
await call(url, { method: 'POST', body: data });
```

---

## 📚 Ejemplos de Uso

### Ejemplo 1: Consulta SQL Básica

```vue
<script setup>
import { ref } from 'vue';
import { useApiCall } from '@/composables/useApiCall';
import { useEndpoints } from '@/composables/useEndpoints';

const { call, loading } = useApiCall();
const endpoints = useEndpoints();
const query = ref('SELECT * FROM usuarios LIMIT 10');
const results = ref([]);

async function ejecutar() {
  const response = await call(endpoints.value.query, {
    method: 'POST',
    body: { query: query.value }
  });
  results.value = response.results;
}
</script>
```

### Ejemplo 2: Listado con Caché

```vue
<script setup>
import { useFetch } from '@/composables/useFetch';
import { getBaseUrl } from '@/config/api';

const baseUrl = getBaseUrl();

const { data, loading, refetch } = useFetch(
  `${baseUrl}/api/backends`,
  { cacheMode: 'auto', cacheTime: 10 * 60 * 1000 } // 10 minutos
);

// Refrescar después de una operación
async function eliminar(id) {
  await call(`${baseUrl}/api/backends/${id}`, { method: 'DELETE' });
  refetch(); // Recarga sin caché
}
</script>
```

### Ejemplo 3: Consulta Predefinida

```vue
<script setup>
import { useQueries } from '@/composables/useQueries';

const { executeQuery, results, loading } = useQueries();

async function buscarUsuario(id) {
  await executeQuery('usuarios.getById', { id });
  console.log(results.value);
}
</script>
```

---

## 🚀 Migración a Otros Proyectos

### Archivos Necesarios

**Mínimo para funcionalidad básica:**

```
src/
├── config/
│   └── api.js              # ⭐ REQUERIDO
├── composables/
│   ├── useApiCall.js       # ⭐ REQUERIDO
│   ├── useAppStore.js      # ⭐ REQUERIDO (para config dinámica)
│   └── useFetch.js         # Opcional (si necesitas caché)
```

**Para sistema completo:**

Copiar todos los archivos mencionados en "Estructura de Archivos".

### Pasos de Migración

1. **Copiar archivos core**

```bash
cp src/config/api.js nuevo-proyecto/src/config/
cp src/composables/useApiCall.js nuevo-proyecto/src/composables/
cp src/composables/useAppStore.js nuevo-proyecto/src/composables/
```

2. **Configurar `api.js`**

```javascript
// Actualizar en api.js
export const DEFAULT_BASE_URL = "https://tu-api.com";
export const DEFAULT_LOCAL_URL = "http://localhost:TU_PUERTO";
export const PROXY_TOKEN = "tu-token";
```

3. **Usar en componentes**

```javascript
import { useApiCall } from '@/composables/useApiCall';
import { getBaseUrl } from '@/config/api';

const { call } = useApiCall();
const baseUrl = getBaseUrl();

// Ya está listo para usar
await call(`${baseUrl}/endpoint`, { method: 'GET' });
```

### Personalización

#### Sin prefijos de backend

Si tu API no usa prefijos:

```javascript
// En api.js
export function shouldUsePrefix() {
  return false; // Siempre conecta directo
}
```

#### Múltiples tokens

```javascript
// En api.js
export function getAuthHeaders(token, additionalHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...additionalHeaders,
  };
}

// Uso
const headers = getAuthHeaders(customToken);
```

#### Headers personalizados

```javascript
// Cambiar esquema de autenticación
export function getAuthHeaders(additionalHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY, // Usar API Key en vez de Bearer
    ...additionalHeaders,
  };
}
```

---

## 📝 Mejores Prácticas

### ✅ DO

- **Usa `useApiCall`** para operaciones CRUD simples
- **Usa `useFetch`** para lecturas frecuentes que se benefician de caché
- **Usa `useEndpoints`** para generar URLs (no las hardcodees)
- **Importa funciones de `api.js`** para configuración (no dupliques constantes)

### ❌ DON'T

- ❌ No hardcodees tokens en componentes
- ❌ No construyas headers manualmente
- ❌ No uses URLs estáticas (usa `getBaseUrl()`)
- ❌ No dupliques lógica de autenticación

---

## 🔧 Troubleshooting

### Error: "Authorization header missing"

**Causa:** Componente está usando `skipAuth: true` o no está importando correctamente.

**Solución:**
```javascript
// Verificar que NO estés usando skipAuth
await call(url, { method: 'POST', body: data }); // ✅ Auth automática
```

### Error: "URL is undefined"

**Causa:** No estás usando `getBaseUrl()` o `useEndpoints`.

**Solución:**
```javascript
import { getBaseUrl } from '@/config/api';
const baseUrl = getBaseUrl(); // ✅ URL dinámica
```

### Caché no se actualiza

**Causa:** Usando `useFetch` con `cacheMode: 'manual'`.

**Solución:**
```javascript
const { refetch } = useFetch(url, { cacheMode: 'manual' });
// Después de modificar datos:
await refetch(); // Fuerza recarga sin caché
```

---

## 📞 Soporte

Para más información sobre cada composable, revisa los comentarios JSDoc en los archivos fuente.

**Archivos con documentación detallada:**
- `src/config/api.js` - Funciones de configuración
- `src/composables/useApiCall.js` - API de llamadas HTTP
- `src/composables/useFetch.js` - Sistema de caché
- `src/composables/useEndpoints.js` - Generación de URLs

---

## 🎯 Resumen Rápido

| Necesito...                          | Usar...              |
|--------------------------------------|----------------------|
| Hacer una llamada HTTP simple        | `useApiCall`         |
| Listar datos con caché               | `useFetch`           |
| Generar URLs dinámicas               | `useEndpoints`       |
| Ejecutar consultas predefinidas      | `useQueries`         |
| Headers con autenticación            | `getAuthHeaders()`   |
| URL base actual                      | `getBaseUrl()`       |
| Cambiar entre local/producción       | `<ApiConfig />`      |

---

**Última actualización:** Mayo 2026
**Versión:** 1.0.0
