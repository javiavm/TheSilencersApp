'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Select } from '@/components/ui/Input';

const GAMES = [
  { value: '', label: 'Todos los juegos' },
  { value: 'MINECRAFT', label: 'Minecraft' },
  { value: 'DISCORD_BOT', label: 'Bot de Discord' },
  { value: 'GENERAL', label: 'General' },
  { value: 'OTHER', label: 'Otro' },
];

const VERIFIED = [
  { value: 'all', label: 'Verificados y no verificados' },
  { value: 'true', label: 'Solo verificados' },
];

export function ServerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value && value !== 'all') sp.set(key, value);
      else sp.delete(key);
      sp.delete('page');
      startTransition(() => router.push(`${pathname}?${sp.toString()}`));
    },
    [params, pathname, router],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        defaultValue={params.get('game') ?? ''}
        onChange={(e) => setParam('game', e.target.value)}
        className="w-auto"
      >
        {GAMES.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </Select>
      <Select
        defaultValue={params.get('verified') ?? 'all'}
        onChange={(e) => setParam('verified', e.target.value)}
        className="w-auto"
      >
        {VERIFIED.map((v) => (
          <option key={v.value} value={v.value}>
            {v.label}
          </option>
        ))}
      </Select>
      <input
        type="search"
        placeholder="Buscar…"
        defaultValue={params.get('q') ?? ''}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value);
        }}
        className="h-10 rounded-md border border-surface-border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
      {isPending && <span className="text-xs text-muted-foreground">Cargando…</span>}
    </div>
  );
}
