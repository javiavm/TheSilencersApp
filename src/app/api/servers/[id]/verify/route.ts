import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';
import { setServerVerified } from '@/services/serverService';

const bodySchema = z.object({ verified: z.boolean() });

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { verified } = bodySchema.parse(await req.json());
    const updated = await setServerVerified(params.id, verified, session.user);
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
