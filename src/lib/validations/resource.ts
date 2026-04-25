import { z } from 'zod';
import { Game, ResourceCategory } from '@prisma/client';

const gameEnum = z.nativeEnum(Game);
const categoryEnum = z.nativeEnum(ResourceCategory);

export const resourceCreateSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres.').max(120),
  description: z.string().min(10, 'Mínimo 10 caracteres.').max(4000),
  category: categoryEnum,
  game: gameEnum.default(Game.GENERAL),
  fileUrl: z.string().url('La URL del archivo no es válida.').nullable().optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  version: z.string().max(20).nullable().optional(),
  size: z.number().int().nonnegative().nullable().optional(),
  published: z.boolean().default(true),
});

export const resourceUpdateSchema = resourceCreateSchema.partial();

export const resourceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  category: categoryEnum.optional(),
  game: gameEnum.optional(),
  q: z.string().optional(),
  sort: z.enum(['recent', 'downloads']).default('recent'),
  authorId: z.string().optional(),
  published: z.enum(['true', 'false', 'all']).default('true'),
});

export type ResourceCreateInput = z.infer<typeof resourceCreateSchema>;
export type ResourceUpdateInput = z.infer<typeof resourceUpdateSchema>;
export type ResourceListQuery = z.infer<typeof resourceListQuerySchema>;
