'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Select } from '@/components/ui/Input';

const TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'NEWS', label: 'Noticias' },
  { value: 'ANNOUNCEMENT', label: 'Anuncios' },
  { value: 'GIVEAWAY', label: 'Sorteos' },
  { value: 'RESULT', label: 'Resultados' },
];

export function PostFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value) sp.set(key, value);
      else sp.delete(key);
      sp.delete('page'); // resetear paginación al cambiar filtro
      startTransition(() => router.push(`${pathname}?${sp.toString()}`));
    },
    [params, pathname, router],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        defaultValue={params.get('type') ?? ''}
        onChange={(e) => setParam('type', e.target.value)}
        className="w-auto"
        aria-label="Filtrar por tipo"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
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
