import { z } from 'zod';

const usernameRegex = /^[a-z0-9](?:[a-z0-9-]{1,18}[a-z0-9])?$/;

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres.')
    .max(20, 'Máximo 20 caracteres.')
    .regex(usernameRegex, 'Solo minúsculas, números y guiones (sin guion al inicio o fin).')
    .optional(),
  bio: z.string().max(280, 'Máximo 280 caracteres.').nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
