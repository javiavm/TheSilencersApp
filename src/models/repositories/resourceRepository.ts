// Acceso a datos de Resource. Incluye incremento atómico de descargas.
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ResourceListQuery } from '@/lib/validations/resource';

const publicListInclude = {
  author: { select: { id: true, username: true, avatarUrl: true } },
} satisfies Prisma.ResourceInclude;

export type ResourceListItem = Prisma.ResourceGetPayload<{
  include: typeof publicListInclude;
}>;

export interface ResourceListResult {
  items: ResourceListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listResources(q: ResourceListQuery): Promise<ResourceListResult> {
  const where: Prisma.ResourceWhereInput = {};

  if (q.published === 'true') where.published = true;
  if (q.published === 'false') where.published = false;
  if (q.category) where.category = q.category;
  if (q.game) where.game = q.game;
  if (q.authorId) where.authorId = q.authorId;
  if (q.q) {
    where.OR = [
      { title: { contains: q.q, mode: 'insensitive' } },
      { description: { contains: q.q, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.ResourceOrderByWithRelationInput =
    q.sort === 'downloads' ? { downloadCount: 'desc' } : { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      include: publicListInclude,
      orderBy,
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    items,
    total,
    page: q.page,
    pageSize: q.pageSize,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  };
}

export function findResourceBySlug(slug: string) {
  return prisma.resource.findUnique({
    where: { slug },
    include: { author: { select: { id: true, username: true, avatarUrl: true, bio: true } } },
  });
}

export function findResourceById(id: string) {
  return prisma.resource.findUnique({ where: { id } });
}

export function createResource(data: Prisma.ResourceUncheckedCreateInput) {
  return prisma.resource.create({ data });
}

export function updateResource(id: string, data: Prisma.ResourceUncheckedUpdateInput) {
  return prisma.resource.update({ where: { id }, data });
}

export function deleteResource(id: string) {
  return prisma.resource.delete({ where: { id } });
}

export function incrementDownloadCount(id: string) {
  return prisma.resource.update({
    where: { id },
    data: { downloadCount: { increment: 1 } },
    select: { id: true, fileUrl: true, downloadCount: true },
  });
}

export async function resourceSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await prisma.resource.findUnique({ where: { slug }, select: { id: true } });
  if (!found) return false;
  return excludeId ? found.id !== excludeId : true;
}
