import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { resourceUpdateSchema } from '@/lib/validations/resource';
import { deleteResourceAsUser, updateResourceAsUser } from '@/services/resourceService';
import { findResourceById } from '@/models/repositories/resourceRepository';

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const r = await findResourceById(params.id);
    if (!r) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(r);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = resourceUpdateSchema.parse(await req.json());
    const updated = await updateResourceAsUser(params.id, body, session.user);
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    await deleteResourceAsUser(params.id, session.user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
