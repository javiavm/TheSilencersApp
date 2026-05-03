import { NextResponse, type NextRequest } from 'next/server';
import { handleApiError } from '@/lib/api';
import { searchQuerySchema } from '@/lib/validations/search';
import { globalSearch } from '@/services/searchService';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { q, limit } = searchQuerySchema.parse(Object.fromEntries(sp.entries()));
    return NextResponse.json(await globalSearch(q, limit));
  } catch (err) {
    return handleApiError(err);
  }
}
