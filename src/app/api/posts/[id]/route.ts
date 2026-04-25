import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { postUpdateSchema } from '@/lib/validations/post';
import { deletePostAsUser, updatePostAsUser } from '@/services/postService';
import { findPostById } from '@/models/repositories/postRepository';

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const post = await findPostById(params.id);
    if (!post) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(post);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = postUpdateSchema.parse(await req.json());
    const updated = await updatePostAsUser(params.id, body, session.user);
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    await deletePostAsUser(params.id, session.user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
