// Búsqueda global con full-text search de PostgreSQL (diccionario español).
import { prisma } from '@/lib/prisma';

export interface SearchHit<T extends string> {
  kind: T;
  id: string;
  slug?: string;
  title: string;
  excerpt: string | null;
  thumbnailUrl?: string | null;
  rank: number;
}

export interface SearchResult {
  q: string;
  posts: SearchHit<'post'>[];
  resources: SearchHit<'resource'>[];
  servers: SearchHit<'server'>[];
  total: number;
}

export async function globalSearch(q: string, limit = 8): Promise<SearchResult> {
  const term = q.trim();
  if (term.length < 2) {
    return { q: term, posts: [], resources: [], servers: [], total: 0 };
  }

  // plainto_tsquery acepta lenguaje natural; ts_rank ordena por relevancia.
  const [posts, resources, servers] = await Promise.all([
    prisma.$queryRaw<SearchHit<'post'>[]>`
      SELECT
        'post'::text                                                AS kind,
        id,
        slug,
        title,
        excerpt,
        "featuredImageUrl"                                          AS "thumbnailUrl",
        ts_rank(
          to_tsvector('spanish', title || ' ' || coalesce(excerpt, '')),
          plainto_tsquery('spanish', ${term})
        )                                                           AS rank
      FROM "Post"
      WHERE published = true
        AND to_tsvector('spanish', title || ' ' || coalesce(excerpt, ''))
            @@ plainto_tsquery('spanish', ${term})
      ORDER BY rank DESC, "publishedAt" DESC NULLS LAST
      LIMIT ${limit}
    `,
    prisma.$queryRaw<SearchHit<'resource'>[]>`
      SELECT
        'resource'::text                                            AS kind,
        id,
        slug,
        title,
        substring(description from 1 for 160)                       AS excerpt,
        "thumbnailUrl",
        ts_rank(
          to_tsvector('spanish', title || ' ' || description),
          plainto_tsquery('spanish', ${term})
        )                                                           AS rank
      FROM "Resource"
      WHERE published = true
        AND to_tsvector('spanish', title || ' ' || description)
            @@ plainto_tsquery('spanish', ${term})
      ORDER BY rank DESC, "downloadCount" DESC
      LIMIT ${limit}
    `,
    prisma.$queryRaw<SearchHit<'server'>[]>`
      SELECT
        'server'::text                                              AS kind,
        id,
        NULL                                                        AS slug,
        name                                                        AS title,
        substring(description from 1 for 160)                       AS excerpt,
        "bannerUrl"                                                 AS "thumbnailUrl",
        ts_rank(
          to_tsvector('spanish', name || ' ' || description),
          plainto_tsquery('spanish', ${term})
        )                                                           AS rank
      FROM "Server"
      WHERE to_tsvector('spanish', name || ' ' || description)
            @@ plainto_tsquery('spanish', ${term})
      ORDER BY rank DESC, "isVerified" DESC, "createdAt" DESC
      LIMIT ${limit}
    `,
  ]);

  return {
    q: term,
    posts,
    resources,
    servers,
    total: posts.length + resources.length + servers.length,
  };
}
