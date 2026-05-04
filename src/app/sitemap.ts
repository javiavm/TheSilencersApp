import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';

// Generado en cada request — depende de DB, no se prerenderiza al build.
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const BASE = env.NEXTAUTH_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, resources, servers, users] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    }),
    prisma.resource.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    }),
    prisma.server.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    }),
    prisma.user.findMany({
      where: { username: { not: null } },
      select: { username: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/posts`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/recursos`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/servidores`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/buscar`, changeFrequency: 'monthly', priority: 0.3 },
  ];

  return [
    ...staticRoutes,
    ...posts.map((p) => ({
      url: `${BASE}/posts/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...resources.map((r) => ({
      url: `${BASE}/recursos/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...servers.map((s) => ({
      url: `${BASE}/servidores/${s.id}`,
      lastModified: s.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...users
      .filter((u): u is { username: string; updatedAt: Date } => !!u.username)
      .map((u) => ({
        url: `${BASE}/u/${u.username}`,
        lastModified: u.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
  ];
}
