// Mapea errores de dominio (NotFound/Forbidden/Conflict/Zod) a códigos HTTP.
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ConflictError, ForbiddenError, NotFoundError } from '@/services/postService';

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validación fallida', issues: err.flatten() },
      { status: 400 },
    );
  }
  if (err instanceof NotFoundError) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
  if (err instanceof ConflictError) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
  console.error('[API unhandled]', err);
  return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
}
