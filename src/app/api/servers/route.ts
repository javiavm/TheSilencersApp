import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { enforceRateLimit } from '@/lib/rateLimit';
import { serverCreateSchema, serverListQuerySchema } from '@/lib/validations/server';
import { createServerAsUser, getPublicServers } from '@/services/serverService';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const query = serverListQuerySchema.parse(Object.fromEntries(sp.entries()));
    return NextResponse.json(await getPublicServers(query));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const blocked = enforceRateLimit(req, {
      userId: session.user.id,
      scope: 'server:create',
      limit: 5,
      windowMs: 60_000,
    });
    if (blocked) return blocked;

    const body = serverCreateSchema.parse(await req.json());
    const created = await createServerAsUser(body, session.user);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
