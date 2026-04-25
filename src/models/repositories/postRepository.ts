// Acceso a datos de Post — solo Prisma, sin reglas de negocio.
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { PostListQuery } from '@/lib/validations/post';

const publicListInclude = {
  author: { select: { id: true, username: true, avatarUrl: true } },
} satisfies Prisma.PostInclude;

export type PostListItem = Prisma.PostGetPayload<{ include: typeof publicListInclude }>;

export interface PostListResult {
  items: PostListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listPosts(q: PostListQuery): Promise<PostListResult> {
  const where: Prisma.PostWhereInput = {};

  if (q.published === 'true') where.published = true;
  if (q.published === 'false') where.published = false;
  if (q.type) where.type = q.type;
  if (q.tag) where.tags = { has: q.tag };
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: 'insensitive' } },
      { excerpt: { contains: q.q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: publicListInclude,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    items,
    total,
    page: q.page,
    pageSize: q.pageSize,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  };
}

export function findPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, username: true, avatarUrl: true, bio: true } },
    },
  });
}

export function findPostById(id: string) {
  return prisma.post.findUnique({ where: { id } });
}

export function createPost(data: Prisma.PostUncheckedCreateInput) {
  return prisma.post.create({ data });
}

export function updatePost(id: string, data: Prisma.PostUncheckedUpdateInput) {
  return prisma.post.update({ where: { id }, data });
}

export function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}

export async function slugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
  if (!found) return false;
  return excludeId ? found.id !== excludeId : true;
}
