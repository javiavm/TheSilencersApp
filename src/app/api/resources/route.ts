import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { resourceCreateSchema, resourceListQuerySchema } from '@/lib/validations/resource';
import {
  createResourceAsUser,
  getPublicResources,
  getResourcesAsModerator,
} from '@/services/resourceService';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const query = resourceListQuerySchema.parse(Object.fromEntries(sp.entries()));

    if (query.published !== 'true') {
      const session = await getServerSession(authOptions);
      if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      return NextResponse.json(await getResourcesAsModerator(query, session.user));
    }
    return NextResponse.json(await getPublicResources(query));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = resourceCreateSchema.parse(await req.json());
    const created = await createResourceAsUser(body, session.user);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
