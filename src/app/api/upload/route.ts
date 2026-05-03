import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { storage } from '@/lib/storage';
import { Role } from '@prisma/client';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== Role.ADMIN && session.user.role !== Role.MODERATOR) {
    return NextResponse.json({ error: 'Permiso insuficiente' }, { status: 403 });
  }

  const blocked = enforceRateLimit(req, {
    userId: session.user.id,
    scope: 'upload:image',
    limit: 20,
    windowMs: 60_000,
  });
  if (blocked) return blocked;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo ausente' }, { status: 400 });
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido' }, { status: 415 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 5MB)' }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const path = `posts/${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const buffer = await file.arrayBuffer();
    const url = await storage.upload(path, buffer, file.type);

    return NextResponse.json({ url, path });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}
