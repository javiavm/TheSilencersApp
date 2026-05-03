import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { profileUpdateSchema } from '@/lib/validations/user';
import { updateOwnProfile } from '@/services/userService';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = profileUpdateSchema.parse(await req.json());
    const updated = await updateOwnProfile(session.user.id, body);
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
