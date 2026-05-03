import type { Metadata } from 'next';
import Link from 'next/link';
import { Newspaper, Package, Server as ServerIcon, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { globalSearch, type SearchHit } from '@/services/searchService';

export const metadata: Metadata = {
  title: 'Buscar',
};

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? '').trim();
  const result = q ? await globalSearch(q, 12) : null;

  return (
    <div className="container py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold inline-flex items-center gap-2">
          <Search className="h-6 w-6" />
          Buscar
        </h1>
        <form className="mt-3" action="/buscar" method="get">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Busca posts, recursos, servidores…"
            autoFocus
            className="w-full rounded-md border border-surface-border bg-surface px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </form>
      </header>

      {!q ? (
        <p className="text-muted-foreground">Escribe al menos 2 caracteres para buscar.</p>
      ) : !result || result.total === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center text-muted-foreground">
          Sin resultados para <span className="text-foreground font-medium">"{q}"</span>.
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <Section
            title="Noticias"
            icon={<Newspaper className="h-4 w-4" />}
            items={result.posts}
            renderHref={(h) => `/posts/${h.slug}`}
          />
          <Section
            title="Recursos"
            icon={<Package className="h-4 w-4" />}
            items={result.resources}
            renderHref={(h) => `/recursos/${h.slug}`}
          />
          <Section
            title="Servidores"
            icon={<ServerIcon className="h-4 w-4" />}
            items={result.servers}
            renderHref={(h) => `/servidores/${h.id}`}
          />
        </div>
      )}
    </div>
  );
}

function Section<T extends string>({
  title,
  icon,
  items,
  renderHref,
}: {
  title: string;
  icon: React.ReactNode;
  items: SearchHit<T>[];
  renderHref: (h: SearchHit<T>) => string;
}) {
  return (
    <div>
      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {icon} {title} <span className="text-xs">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-surface-border py-6 text-center text-sm text-muted-foreground">
          Sin coincidencias.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((h) => (
            <Link key={h.id} href={renderHref(h)} className="block">
              <Card className="hover:border-brand-500/60 transition-colors">
                <CardContent>
                  <div className="font-medium line-clamp-2">{h.title}</div>
                  {h.excerpt && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {h.excerpt}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
