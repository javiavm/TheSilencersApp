import { z } from 'zod';
import { Game } from '@prisma/client';

const gameEnum = z.nativeEnum(Game);

const ipRegex = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::\d{1,5})?$/i;

export const serverCreateSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres.').max(60),
  description: z.string().min(10, 'Mínimo 10 caracteres.').max(1000),
  game: gameEnum.default(Game.MINECRAFT),
  ip: z
    .string()
    .max(120)
    .regex(ipRegex, 'IP/host inválido (ej. play.miservidor.com:25565).')
    .nullable()
    .optional(),
  discordInvite: z
    .string()
    .url('Debe ser una URL válida de Discord.')
    .refine((u) => /discord\.(gg|com)/i.test(u), 'Debe ser un link de Discord.')
    .nullable()
    .optional(),
  bannerUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string().min(1).max(20)).max(8).default([]),
});

export const serverUpdateSchema = serverCreateSchema.partial().extend({
  isVerified: z.boolean().optional(),
});

export const serverListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  game: gameEnum.optional(),
  q: z.string().optional(),
  verified: z.enum(['true', 'false', 'all']).default('all'),
  ownerId: z.string().optional(),
});

export type ServerCreateInput = z.infer<typeof serverCreateSchema>;
export type ServerUpdateInput = z.infer<typeof serverUpdateSchema>;
export type ServerListQuery = z.infer<typeof serverListQuerySchema>;
