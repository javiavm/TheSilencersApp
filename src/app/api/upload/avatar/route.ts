import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';
import { storage } from '@/lib/storage';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const blocked = enforceRateLimit(req, {
    userId: session.user.id,
    scope: 'upload:avatar',
    limit: 5,
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
      return NextResponse.json({ error: 'Formato no permitido (JPG/PNG/WebP)' }, { status: 415 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Archivo demasiado grande (máx 2MB)' }, { status: 413 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const path = `avatars/${session.user.id}/${Date.now()}.${ext}`;
    const buffer = await file.arrayBuffer();
    const url = await storage.upload(path, buffer, file.type);
    return NextResponse.json({ url, path });
  } catch (err) {
    console.error('[upload/avatar]', err);
    return NextResponse.json({ error: 'Error al subir avatar' }, { status: 500 });
  }
}
