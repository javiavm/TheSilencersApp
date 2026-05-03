import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { serverUpdateSchema } from '@/lib/validations/server';
import { deleteServerAsUser, getServerById, updateServerAsUser } from '@/services/serverService';

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const server = await getServerById(params.id);
    return NextResponse.json(server);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = serverUpdateSchema.parse(await req.json());
    const updated = await updateServerAsUser(params.id, body, session.user);
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    await deleteServerAsUser(params.id, session.user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
