import { z } from 'zod';
import { PostType } from '@prisma/client';

const postTypeEnum = z.nativeEnum(PostType);

const tiptapDoc = z.object({
  type: z.literal('doc'),
  content: z.array(z.any()).optional(),
});

export const postCreateSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.').max(200),
  excerpt: z.string().max(300).optional().nullable(),
  type: postTypeEnum.default(PostType.NEWS),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  featuredImageUrl: z.string().url().optional().nullable(),
  content: tiptapDoc,
  published: z.boolean().default(false),
});

export const postUpdateSchema = postCreateSchema.partial();

export const postListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  type: postTypeEnum.optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
  published: z.enum(['true', 'false', 'all']).default('true'),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
