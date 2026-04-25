import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { storage } from '@/lib/storage';

const MAX_SIZE_BYTES = 50 * 1024 * 1024;

// Allowlist — bloquea ejecutables sin necesidad de antivirus.
const ALLOWED_MIME = new Set<string>([
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'application/java-archive',
  'application/octet-stream',
  'application/json',
  'text/plain',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Archivo ausente' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `Archivo demasiado grande (máx ${MAX_SIZE_BYTES / 1024 / 1024}MB)` },
        { status: 413 },
      );
    }
    if (!ALLOWED_MIME.has(file.type) && file.type !== '') {
      return NextResponse.json(
        { error: `Formato no permitido: ${file.type || 'desconocido'}` },
        { status: 415 },
      );
    }

    const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().slice(0, 8);
    const safeName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-z0-9-_]+/gi, '-')
      .slice(0, 60) || 'file';
    const path = `resources/${session.user.id}/${Date.now()}-${crypto.randomUUID()}-${safeName}.${ext}`;

    const buffer = await file.arrayBuffer();
    const url = await storage.upload(path, buffer, file.type || 'application/octet-stream');

    return NextResponse.json({
      url,
      path,
      size: file.size,
      contentType: file.type || null,
      filename: file.name,
    });
  } catch (err) {
    console.error('[upload/file]', err);
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}
