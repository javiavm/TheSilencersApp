# The Silencers

Plataforma gamer hispanohablante. MVP — Día 8 de 15.

**Stack**: Next.js 14 · TypeScript · Tailwind · Prisma · PostgreSQL (Supabase) · NextAuth (Discord) · Tiptap.

## Setup

```bash
npm install
cp .env.example .env          # el archivo generado se deberá llenar con tus credenciales para pruebas locales
npm run prisma:migrate
npm run prisma:seed
npm run dev                   # http://localhost:3000
```

## Variables de entorno

| Variable
|---|---|
| `DATABASE_URL` | Pertenece a supabase en la dashboard
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ejecutar en gitbash
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord Developer Portal. Redirect URI: `http://localhost:3000/api/auth/callback/discord` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | en settings abrir API alli se encontraran las keys |
| `SUPABASE_STORAGE_BUCKET` | Crea un bucket público en Supabase e ingresar el Storage |

> Para ser ADMIN: tras tu primer login, `npm run prisma:studio` despues ingresar al puerto y buscar la tabla `User` cambia `role` a `ADMIN`. Cierra sesión y vuelve a entrar.

## Arquitectura (MVC)

```
src/
├── app/                        VIEW (pages) + CONTROLLER HTTP (api/)
├── components/                 VIEW — UI
├── services/                   CONTROLLER — lógica de negocio
├── models/repositories/        MODEL — acceso a datos (Prisma)
├── lib/                        auth, prisma, storage, validations, utils
└── middleware.ts               guard de /admin
```

## Scripts

| Script | Uso |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Build y servir producción |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm run prisma:migrate` | Migrar DB |
| `npm run prisma:seed` | Seed inicial |
| `npm run prisma:studio` | Inspector de DB |

## Estado del MVP

- **D1-4** — Setup, auth Discord, layout, schema completo.
- **D5-6** — Módulo Contenido: posts CRUD admin + público con Tiptap.
- **D7-8** — Módulo Recursos: subir/descargar archivos, contador atómico, moderación.
- **D9-15** — Perfiles, servidores, búsqueda global, hardening, deploy.

Detalle de pruebas y demo en [RESUMEN.md](RESUMEN.md).
