// Acceso a datos de Server.
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ServerListQuery } from '@/lib/validations/server';

const publicListInclude = {
  owner: { select: { id: true, username: true, avatarUrl: true } },
} satisfies Prisma.ServerInclude;

export type ServerListItem = Prisma.ServerGetPayload<{ include: typeof publicListInclude }>;

export interface ServerListResult {
  items: ServerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listServers(q: ServerListQuery): Promise<ServerListResult> {
  const where: Prisma.ServerWhereInput = {};
  if (q.game) where.game = q.game;
  if (q.ownerId) where.ownerId = q.ownerId;
  if (q.verified === 'true') where.isVerified = true;
  if (q.verified === 'false') where.isVerified = false;
  if (q.q) {
    where.OR = [
      { name: { contains: q.q, mode: 'insensitive' } },
      { description: { contains: q.q, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.server.findMany({
      where,
      include: publicListInclude,
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
    prisma.server.count({ where }),
  ]);

  return {
    items,
    total,
    page: q.page,
    pageSize: q.pageSize,
    totalPages: Math.max(1, Math.ceil(total / q.pageSize)),
  };
}

export function findServerById(id: string) {
  return prisma.server.findUnique({
    where: { id },
    include: { owner: { select: { id: true, username: true, avatarUrl: true, bio: true } } },
  });
}

export function createServer(data: Prisma.ServerUncheckedCreateInput) {
  return prisma.server.create({ data });
}

export function updateServer(id: string, data: Prisma.ServerUncheckedUpdateInput) {
  return prisma.server.update({ where: { id }, data });
}

export function deleteServer(id: string) {
  return prisma.server.delete({ where: { id } });
}
