# The Silencers

Plataforma gamer hispanohablante. MVP — Día 13 de 15.

**Stack**: Next.js 14 · TypeScript · Tailwind · Prisma · PostgreSQL (Supabase) · NextAuth (Discord) · Tiptap · skinview3d.

---

## Roadmap

| Día   | Entregable | Estado |
|-------|---|---|
| 1     | Setup Next.js 14 + TS + Tailwind + Prisma | ✅ Completado |
| 2     | Login Discord (NextAuth) + middleware + modelo User | ✅ Completado |
| 3     | Layout, navbar, footer, UI base, dark/light | ✅ Completado |
| 4     | Schema Prisma completo + seed + API base + Zod | ✅ Completado |
| 5–6   | **Módulo Contenido** end-to-end (CRUD admin + Tiptap) | ✅ Completado |
| 7–8   | **Módulo Recursos** end-to-end (upload, descargas atómicas, moderación) | ✅ Completado |
| 9–10  | **Perfiles + Servidores** (CRUD + verificación admin) | ✅ Completado |
| 11–12 | **Búsqueda global FTS + pulido UX** (loading/error/responsive) | ✅ Completado |
| 13    | **Seguridad y rendimiento** (rate limit, CORS, env, headers, robots/sitemap, viewer 3D) | ✅ Completado |
| 14    | Deploy a Vercel + dominio + variables de producción | ⏳ Pendiente |
| 15    | QA final + lanzamiento + métricas | ⏳ Pendiente |

---

## Setup

```bash
npm install
cp .env.example .env          # llenar con tus credenciales
npm run prisma:migrate
npm run prisma:seed
npm run dev                   # http://localhost:3000
```

### Variables de entorno

| Variable | De dónde |
|---|---|
| `DATABASE_URL` | Supabase → dashboard del proyecto |
| `NEXTAUTH_SECRET` | Generar con `openssl rand -base64 32` en Git Bash |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord Developer Portal. Redirect URI: `http://localhost:3000/api/auth/callback/discord` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `SUPABASE_STORAGE_BUCKET` | Crear un bucket público en Supabase → Storage |

> **Para ser ADMIN**: tras tu primer login, `npm run prisma:studio` → tabla `User` → cambia `role` a `ADMIN`. Cierra sesión y vuelve a entrar.

---

## Funcionalidades

### Público (sin login)
- `/` — landing con últimas noticias.
- `/posts`, `/posts/[slug]` — listado paginado, filtros, detalle con Tiptap.
- `/recursos`, `/recursos/[slug]` — grilla con filtros (categoría/juego/orden) + detalle con **toggle 2D/3D** (skin viewer para Minecraft).
- `/servidores`, `/servidores/[id]` — listado con verificados arriba, detalle con botón "Copiar IP" y enlace a Discord.
- `/u/[username]` — perfil público con posts, recursos y servidores del usuario.
- `/buscar?q=…` — búsqueda global con full-text search en español.

### Autenticado (Discord OAuth)
- `/me` — editar username, bio y avatar.
- `/recursos/nuevo`, `/recursos/[slug]/editar` — subir/editar recursos con barra de progreso.
- `/servidores/nuevo`, `/servidores/[id]/editar` — registrar/editar servidores.

### Moderador / Admin
- `/admin` — dashboard con métricas (posts, recursos, descargas, usuarios, servidores).
- `/admin/posts` — CRUD completo de posts con editor Tiptap.
- `/admin/recursos` — moderación: publicar/despublicar, editar, eliminar.
- `/admin/servidores` — verificar/desverificar y eliminar.

### API REST

| Endpoint | Métodos | Notas |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | Discord OAuth |
| `/api/posts` | GET/POST | Listado público + creación admin |
| `/api/posts/[id]` | GET/PATCH/DELETE | |
| `/api/resources` | GET/POST | Filtros: `category`, `game`, `q`, `sort`, `published` |
| `/api/resources/[id]` | GET/PATCH/DELETE | |
| `/api/resources/[id]/download` | GET (302) / POST (JSON) | Contador atómico |
| `/api/servers` | GET/POST | |
| `/api/servers/[id]` | GET/PATCH/DELETE | |
| `/api/servers/[id]/verify` | PATCH | Solo MOD/ADMIN |
| `/api/users/me` | PATCH | Edición de perfil propio |
| `/api/search?q=…` | GET | FTS Postgres en español |
| `/api/upload` | POST | Imágenes 5 MB (admin/mod) |
| `/api/upload/file` | POST | Binarios 50 MB (zip/jar/rar/7z/json/txt/pdf) |
| `/api/upload/avatar` | POST | Imágenes 2 MB (cualquier user) |

---

## Arquitectura (MVC)

```
src/
├── app/                        VIEW (pages) + CONTROLLER HTTP (api/)
├── components/                 VIEW — UI
├── services/                   CONTROLLER — lógica de negocio + permisos
├── models/repositories/        MODEL — acceso a datos (Prisma)
├── lib/                        auth, prisma, storage, env, rateLimit, validations, utils
└── middleware.ts               guard de /admin + CORS en /api
```

---

## Scripts

| Script | Uso |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Build y servir producción |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm run prisma:migrate` | Migrar DB |
| `npm run prisma:seed` | Seed inicial |
| `npm run prisma:studio` | Inspector de DB |

---

## Checklist de validación

- [ ] `/` carga, `/admin` sin login redirige a `/login`.
- [ ] Login Discord muestra avatar; click en el avatar va a `/me`.
- [ ] `/posts` filtra y pagina; detalle renderiza Tiptap.
- [ ] `/admin/posts` permite crear/editar/eliminar.
- [ ] `/recursos` filtra por categoría/juego y ordena por descargas.
- [ ] Subir `.zip` muestra barra de progreso; `.exe` da 415.
- [ ] Descargar incrementa contador en vivo.
- [ ] `/admin/recursos` permite publicar/despublicar.
- [ ] `/me` permite cambiar avatar (sube en vivo) + bio + username.
- [ ] `/u/<username>` muestra posts/recursos/servidores del usuario.
- [ ] `/servidores` lista con filtro por juego y badge de verificados.
- [ ] `/servidores/nuevo` permite registrar; `/servidores/[id]` muestra IP con botón "Copiar".
- [ ] `/admin/servidores` permite verificar/desverificar y eliminar.
- [ ] Búsqueda global: escribir en la barra del navbar (≥2 chars) → `/buscar?q=…` muestra hits agrupados.
- [ ] Loading skeletons aparecen al navegar entre `/posts`, `/recursos`, `/servidores`, `/buscar`.
- [ ] Error en una página muestra el botón "Reintentar" (no se rompe la app).
- [ ] DevTools 375px: tablas admin tienen scroll horizontal, no se rompen.
- [ ] Rate limit: spamear `POST /api/posts` 11 veces en 60s → 11ª devuelve 429.
- [ ] CORS: `OPTIONS /api/posts` desde otro origen → 204 con `Access-Control-Allow-*` headers.
- [ ] `/robots.txt` lista rutas públicas y disallow `/admin`, `/me`, `/api`.
- [ ] `/sitemap.xml` genera URLs de posts/recursos/servidores/perfiles.
- [ ] Headers de seguridad presentes en cualquier respuesta (`X-Frame-Options`, `Referrer-Policy`, etc.).
- [ ] **Vista 2D/3D**: en `/recursos/<slug>` con `game=MINECRAFT` + archivo `.png`, aparecen tabs 2D/3D y la pestaña 3D renderiza la skin con animación de caminar.

---

## Errores comunes

| Síntoma | Solución |
|---|---|
| `Can't reach database server` | Verifica `DATABASE_URL` y que Supabase no esté pausado |
| `redirect_uri_mismatch` | Discord app debe tener `http://localhost:3000/api/auth/callback/discord` |
| Upload 401 / 500 | Login primero / falta `SUPABASE_SERVICE_ROLE_KEY` o bucket |
| `/admin` redirige al home | Cambia `role` a `ADMIN` en Prisma Studio y reinicia sesión |
| Imágenes externas no cargan | Verifica que el bucket de Supabase sea público |
| `429 Too Many Requests` | Rate limit alcanzado; espera el `Retry-After` indicado |
