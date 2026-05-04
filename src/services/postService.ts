// Lógica de negocio de posts: permisos por rol, slugs únicos, control de publishedAt.
import { Prisma, Role } from '@prisma/client';
import { toSlug } from '@/lib/utils';
import {
  createPost,
  deletePost,
  findPostById,
  findPostBySlug,
  listPosts,
  slugExists,
  updatePost,
} from '@/models/repositories/postRepository';
import type { PostCreateInput, PostListQuery, PostUpdateInput } from '@/lib/validations/post';

export class NotFoundError extends Error {
  constructor(msg = 'Recurso no encontrado') {
    super(msg);
  }
}
export class ForbiddenError extends Error {
  constructor(msg = 'No tienes permiso para esta acción') {
    super(msg);
  }
}
export class ConflictError extends Error {
  constructor(msg = 'Conflicto de datos') {
    super(msg);
  }
}

interface ActingUser {
  id: string;
  role: Role;
}

function canModerate(user: ActingUser): boolean {
  return user.role === Role.ADMIN || user.role === Role.MODERATOR;
}

async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = toSlug(title) || 'post';
  let candidate = base;
  let i = 1;
  while (await slugExists(candidate, excludeId)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}

export async function getPublicPosts(query: PostListQuery) {
  return listPosts({ ...query, published: 'true' });
}

export async function getAdminPosts(query: PostListQuery, user: ActingUser) {
  if (!canModerate(user)) throw new ForbiddenError();
  return listPosts(query);
}

export async function getPostBySlug(slug: string) {
  const post = await findPostBySlug(slug);
  if (!post || !post.published) throw new NotFoundError();
  return post;
}

export async function createPostAsUser(input: PostCreateInput, user: ActingUser) {
  if (!canModerate(user)) throw new ForbiddenError('Solo moderadores pueden publicar posts.');

  const slug = await uniqueSlug(input.title);
  const data: Prisma.PostUncheckedCreateInput = {
    title: input.title,
    slug,
    excerpt: input.excerpt ?? null,
    content: input.content as Prisma.InputJsonValue,
    type: input.type,
    tags: input.tags,
    featuredImageUrl: input.featuredImageUrl ?? null,
    published: input.published,
    publishedAt: input.published ? new Date() : null,
    authorId: user.id,
  };
  return createPost(data);
}

export async function updatePostAsUser(
  id: string,
  input: PostUpdateInput,
  user: ActingUser,
) {
  const existing = await findPostById(id);
  if (!existing) throw new NotFoundError();
  if (!canModerate(user) && existing.authorId !== user.id) {
    throw new ForbiddenError();
  }

  // Extraemos content del spread porque su tipo Zod estricto no encaja
  // directamente con Prisma.InputJsonValue
  const { content, ...rest } = input;
  const data: Prisma.PostUncheckedUpdateInput = { ...rest };
  if (content !== undefined) {
    data.content = content as Prisma.InputJsonValue;
  }

  if (input.title && input.title !== existing.title) {
    data.slug = await uniqueSlug(input.title, id);
  }

  if (input.published === true && !existing.publishedAt) {
    data.publishedAt = new Date();
  }
  if (input.published === false) {
    data.publishedAt = null;
  }

  return updatePost(id, data);
}

export async function deletePostAsUser(id: string, user: ActingUser) {
  const existing = await findPostById(id);
  if (!existing) throw new NotFoundError();
  if (!canModerate(user) && existing.authorId !== user.id) {
    throw new ForbiddenError();
  }
  return deletePost(id);
}
