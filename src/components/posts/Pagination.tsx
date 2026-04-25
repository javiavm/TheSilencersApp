import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  basePath: string;
  page: number;
  totalPages: number;
  searchParams?: Record<string, string | undefined>;
}

export function Pagination({ basePath, page, totalPages, searchParams = {} }: Props) {
  if (totalPages <= 1) return null;

  const build = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v) sp.set(k, v);
    sp.set('page', String(p));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Paginación">
      {page > 1 && (
        <Link
          href={build(page - 1)}
          className="h-9 px-3 inline-flex items-center rounded border border-surface-border hover:bg-surface-muted text-sm"
        >
          ← Anterior
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={build(p)}
          className={cn(
            'h-9 w-9 inline-flex items-center justify-center rounded text-sm',
            p === page
              ? 'bg-brand-500 text-white'
              : 'border border-surface-border hover:bg-surface-muted',
          )}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          href={build(page + 1)}
          className="h-9 px-3 inline-flex items-center rounded border border-surface-border hover:bg-surface-muted text-sm"
        >
          Siguiente →
        </Link>
      )}
    </nav>
  );
}
