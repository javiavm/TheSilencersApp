# The Silencers — Resumen del MVP (Día 8 de 15)

## Estado de avance

**La Fase 1** (cimientos + auth) y **Fase 2** (contenido + recursos) COMPLETADAS.

| Día  | Entregable | Estado |
|------|---|---|
| 1    | Setup Next.js 14 + TS + Tailwind + Prisma | Completado |
| 2    | Login Discord (NextAuth) + middleware + modelo User | Completado |
| 3    | Layout, navbar, footer, UI base, dark/light | Completado |
| 4    | Schema Prisma completo + seed + API base + Zod | Completado |
| 5–6  | **Módulo Contenido** end-to-end | En pruebas |
| 7–8  | **Módulo Recursos** end-to-end | En pruebas |
| 9–15 | Perfiles, servidores, búsqueda, hardening, deploy | PENDIENTE |

---

## Funcionalidades

**Público**: `/`, `/posts`, `/posts/[slug]`, `/recursos`, `/recursos/[slug]` (descarga con contador).

**Autenticado**: subir/editar recursos en `/recursos/nuevo` y `/recursos/[slug]/editar`.

**Admin**: `/admin` (métricas), `/admin/posts` (CRUD + Tiptap), `/admin/recursos` (moderar).

**API**: `/api/posts`, `/api/resources`, `/api/resources/[id]/download`, `/api/upload` (img 5 MB), `/api/upload/file` (binarios 50 MB).

---

## Pruebas locales

```bash
npm install
cp .env.example .env       # llenar credenciales
npm run prisma:migrate
npm run prisma:seed
npm run dev                # http://localhost:3000
```

**Para ser ADMIN**: Debemos hacer login y ejecutar en la terminal `npm run prisma:studio` ingresar a la tabla `User` → `role = ADMIN` despues cerrar y volver a entrar.

---

## Checklist

- [ ] `/` carga, `/admin` sin login redirige a `/login`.
- [ ] Login Discord muestra nuestro avatar.
- [ ] `/posts` filtra y pagina; detalle renderiza Tiptap.
- [ ] `/admin/posts` permite crear/editar/eliminar.
- [ ] `/recursos` filtra por categoría/juego y ordena por descargas.
- [ ] Subir `.zip` muestra barra de progreso; `.exe` da 415.
- [ ] Descargar incrementa contador en vivo.
- [ ] `/admin/recursos` permite publicar/despublicar.

---

## Errores comunes

| Síntoma | Solución |
|---|---|
| `Can't reach database server` | Verifica `DATABASE_URL` y que Supabase no esté pausado |
| `redirect_uri_mismatch` | Discord app debe tener `http://localhost:3000/api/auth/callback/discord` |
| Upload 401 / 500 | Login primero / falta `SUPABASE_SERVICE_ROLE_KEY` o bucket |
| `/admin` redirige al home | Cambia `role` a `ADMIN` en Prisma Studio y reinicia sesión |
