// Acceso a datos de User — perfiles públicos y edición propia.
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bio: true,
      role: true,
      createdAt: true,
    },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function usernameExists(username: string, excludeId?: string): Promise<boolean> {
  const found = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!found) return false;
  return excludeId ? found.id !== excludeId : true;
}

export function updateUser(id: string, data: Prisma.UserUncheckedUpdateInput) {
  return prisma.user.update({ where: { id }, data });
}

export async function getUserActivity(userId: string) {
  const [posts, resources, servers] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: userId, published: true },
      select: { id: true, slug: true, title: true, type: true, publishedAt: true, featuredImageUrl: true },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    }),
    prisma.resource.findMany({
      where: { authorId: userId, published: true },
      select: { id: true, slug: true, title: true, category: true, game: true, downloadCount: true, createdAt: true, thumbnailUrl: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.server.findMany({
      where: { ownerId: userId },
      select: { id: true, name: true, game: true, isVerified: true, bannerUrl: true },
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ]);
  return { posts, resources, servers };
}
