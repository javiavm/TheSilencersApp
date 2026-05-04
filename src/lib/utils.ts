import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slugify from 'slugify';
import type { PostType, ResourceCategory, Game } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSlug(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true });
}

export function truncate(text: string, maxChars = 180): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).replace(/\s+\S*$/, '') + '…';
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatBytes(bytes?: number | null): string {
  if (bytes == null || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}


export const POST_TYPE_LABELS: Record<PostType, string> = {
  NEWS: 'Noticia',
  ANNOUNCEMENT: 'Anuncio',
  GIVEAWAY: 'Sorteo',
  RESULT: 'Resultado',
};

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  GUIDE: 'Guía',
  MOD: 'Mod',
  PLUGIN: 'Plugin',
  BUILD: 'Build',
  OTHER: 'Otro',
};

export const GAME_LABELS: Record<Game, string> = {
  MINECRAFT: 'Minecraft',
  DISCORD_BOT: 'Bot de Discord',
  GENERAL: 'General',
  OTHER: 'Otro',
};
