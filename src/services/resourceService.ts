// Lógica de negocio de recursos: permisos USER/autor/MOD, descargas atómicas vía repositorio.
import { Prisma, Role } from '@prisma/client';
import { toSlug } from '@/lib/utils';
import {
  createResource,
  deleteResource,
  findResourceById,
  findResourceBySlug,
  incrementDownloadCount,
  listResources,
  resourceSlugExists,
  updateResource,
} from '@/models/repositories/resourceRepository';
import type {
  ResourceCreateInput,
  ResourceListQuery,
  ResourceUpdateInput,
} from '@/lib/validations/resource';
import { ForbiddenError, NotFoundError } from './postService';

interface ActingUser {
  id: string;
  role: Role;
}

const canModerate = (u: ActingUser) => u.role === Role.ADMIN || u.role === Role.MODERATOR;

async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = toSlug(title) || 'recurso';
  let candidate = base;
  let i = 1;
  while (await resourceSlugExists(candidate, excludeId)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

export async function getPublicResources(q: ResourceListQuery) {
  return listResources({ ...q, published: 'true' });
}

export async function getResourcesAsModerator(q: ResourceListQuery, user: ActingUser) {
  if (!canModerate(user)) throw new ForbiddenError();
  return listResources(q);
}

export async function getResourceBySlug(slug: string) {
  const resource = await findResourceBySlug(slug);
  if (!resource || !resource.published) throw new NotFoundError();
  return resource;
}

export async function createResourceAsUser(input: ResourceCreateInput, user: ActingUser) {
  const slug = await uniqueSlug(input.title);
  const data: Prisma.ResourceUncheckedCreateInput = {
    title: input.title,
    slug,
    description: input.description,
    category: input.category,
    game: input.game,
    fileUrl: input.fileUrl ?? null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    version: input.version ?? null,
    size: input.size ?? null,
    published: canModerate(user) ? input.published : true,
    authorId: user.id,
  };
  return createResource(data);
}

export async function updateResourceAsUser(
  id: string,
  input: ResourceUpdateInput,
  user: ActingUser,
) {
  const existing = await findResourceById(id);
  if (!existing) throw new NotFoundError();
  const isOwner = existing.authorId === user.id;
  if (!isOwner && !canModerate(user)) throw new ForbiddenError();

  const data: Prisma.ResourceUncheckedUpdateInput = { ...input };
  if (!canModerate(user)) {
    delete (data as Record<string, unknown>).published;
  }

  if (input.title && input.title !== existing.title) {
    data.slug = await uniqueSlug(input.title, id);
  }

  return updateResource(id, data);
}

export async function deleteResourceAsUser(id: string, user: ActingUser) {
  const existing = await findResourceById(id);
  if (!existing) throw new NotFoundError();
  const isOwner = existing.authorId === user.id;
  if (!isOwner && !canModerate(user)) throw new ForbiddenError();
  return deleteResource(id);
}

export async function registerDownload(id: string) {
  const resource = await findResourceById(id);
  if (!resource || !resource.published) throw new NotFoundError();
  if (!resource.fileUrl) throw new NotFoundError('Este recurso no tiene archivo asociado.');
  const updated = await incrementDownloadCount(id);
  return { fileUrl: updated.fileUrl!, downloadCount: updated.downloadCount };
}
