// Lógica de negocio de perfiles: cada usuario edita el suyo, username único.
import { Prisma } from '@prisma/client';
import {
  findUserById,
  findUserByUsername,
  getUserActivity,
  updateUser,
  usernameExists,
} from '@/models/repositories/userRepository';
import type { ProfileUpdateInput } from '@/lib/validations/user';
import { ConflictError, NotFoundError } from './postService';

export async function getProfile(username: string) {
  const user = await findUserByUsername(username);
  if (!user) throw new NotFoundError('Perfil no encontrado.');
  const activity = await getUserActivity(user.id);
  return { user, ...activity };
}

export async function updateOwnProfile(userId: string, input: ProfileUpdateInput) {
  const existing = await findUserById(userId);
  if (!existing) throw new NotFoundError();

  const data: Prisma.UserUncheckedUpdateInput = {};

  if (input.username && input.username !== existing.username) {
    if (await usernameExists(input.username, userId)) {
      throw new ConflictError('Ese username ya está en uso.');
    }
    data.username = input.username;
  }
  if (input.bio !== undefined) data.bio = input.bio;
  if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;

  return updateUser(userId, data);
}
