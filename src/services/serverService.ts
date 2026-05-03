// Lógica de negocio de servers: USER crea, autor edita, MOD/ADMIN verifica y modera.
import { Prisma, Role } from '@prisma/client';
import {
  createServer,
  deleteServer,
  findServerById,
  listServers,
  updateServer,
} from '@/models/repositories/serverRepository';
import type {
  ServerCreateInput,
  ServerListQuery,
  ServerUpdateInput,
} from '@/lib/validations/server';
import { ForbiddenError, NotFoundError } from './postService';

interface ActingUser {
  id: string;
  role: Role;
}

const canModerate = (u: ActingUser) => u.role === Role.ADMIN || u.role === Role.MODERATOR;

export async function getPublicServers(q: ServerListQuery) {
  return listServers(q);
}

export async function getServerById(id: string) {
  const server = await findServerById(id);
  if (!server) throw new NotFoundError();
  return server;
}

export async function createServerAsUser(input: ServerCreateInput, user: ActingUser) {
  const data: Prisma.ServerUncheckedCreateInput = {
    name: input.name,
    description: input.description,
    game: input.game,
    ip: input.ip ?? null,
    discordInvite: input.discordInvite ?? null,
    bannerUrl: input.bannerUrl ?? null,
    tags: input.tags,
    ownerId: user.id,
    isVerified: false,
  };
  return createServer(data);
}

export async function updateServerAsUser(
  id: string,
  input: ServerUpdateInput,
  user: ActingUser,
) {
  const existing = await findServerById(id);
  if (!existing) throw new NotFoundError();
  const isOwner = existing.ownerId === user.id;
  if (!isOwner && !canModerate(user)) throw new ForbiddenError();

  const data: Prisma.ServerUncheckedUpdateInput = { ...input };
  // Solo moderación cambia `isVerified`.
  if (!canModerate(user)) {
    delete (data as Record<string, unknown>).isVerified;
  }
  return updateServer(id, data);
}

export async function deleteServerAsUser(id: string, user: ActingUser) {
  const existing = await findServerById(id);
  if (!existing) throw new NotFoundError();
  const isOwner = existing.ownerId === user.id;
  if (!isOwner && !canModerate(user)) throw new ForbiddenError();
  return deleteServer(id);
}

export async function setServerVerified(id: string, verified: boolean, user: ActingUser) {
  if (!canModerate(user)) throw new ForbiddenError();
  const existing = await findServerById(id);
  if (!existing) throw new NotFoundError();
  return updateServer(id, { isVerified: verified });
}
