import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { postCreateSchema, postListQuerySchema } from '@/lib/validations/post';
import { createPostAsUser, getAdminPosts, getPublicPosts } from '@/services/postService';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const query = postListQuerySchema.parse(Object.fromEntries(sp.entries()));

    // Si piden 'all' o 'false' publicados exigimos sesión + rol de moderación.
    if (query.published !== 'true') {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      return NextResponse.json(await getAdminPosts(query, session.user));
    }

    return NextResponse.json(await getPublicPosts(query));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const body = postCreateSchema.parse(await req.json());
    const post = await createPostAsUser(body, session.user);
    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
