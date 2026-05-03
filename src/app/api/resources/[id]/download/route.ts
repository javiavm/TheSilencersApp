import { NextResponse, type NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api';
import { enforceRateLimit } from '@/lib/rateLimit';
import { registerDownload } from '@/services/resourceService';

interface Params {
  params: { id: string };
}

// Anti-scraping del contador: anónimo, por IP. Permitido reintento razonable.
function rateLimitDownload(req: NextRequest, id: string) {
  return enforceRateLimit(req, {
    scope: `download:${id}`,
    limit: 10,
    windowMs: 60_000,
  });
}

export async function GET(req: NextRequest, { params }: Params) {
  const blocked = rateLimitDownload(req, params.id);
  if (blocked) return blocked;
  try {
    const { fileUrl } = await registerDownload(params.id);
    return NextResponse.redirect(fileUrl, 302);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const blocked = rateLimitDownload(req, params.id);
  if (blocked) return blocked;
  try {
    const data = await registerDownload(params.id);
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
