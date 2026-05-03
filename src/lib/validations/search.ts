import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(80),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
