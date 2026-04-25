import { NextResponse, type NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api';
import { registerDownload } from '@/services/resourceService';

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { fileUrl } = await registerDownload(params.id);
    return NextResponse.redirect(fileUrl, 302);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const data = await registerDownload(params.id);
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
