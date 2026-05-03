import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { getPublicServers } from '@/services/serverService';
import { serverListQuerySchema } from '@/lib/validations/server';
import { ServerCard } from '@/components/servers/ServerCard';
import { ServerFilters } from '@/components/servers/ServerFilters';
import { Pagination } from '@/components/posts/Pagination';

export const metadata: Metadata = {
  title: 'Servidores',
  description: 'Servidores gamer recomendados por la comunidad de The Silencers.',
};

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function ServersPage({ searchParams }: Props) {
  const query = serverListQuerySchema.parse(searchParams);
  const { items, total, page, totalPages } = await getPublicServers(query);
  const session = await getServerSession(authOptions);

  return (
    <div className="container py-10">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Servidores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? 'servidor registrado' : 'servidores registrados'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ServerFilters />
          {session?.user && (
            <Link href="/servidores/nuevo">
              <Button>
                <Plus className="h-4 w-4" /> Registrar servidor
              </Button>
            </Link>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center text-muted-foreground">
          No hay servidores que coincidan con los filtros.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <ServerCard key={s.id} server={s} />
          ))}
        </div>
      )}

      <Pagination basePath="/servidores" page={page} totalPages={totalPages} searchParams={searchParams} />
    </div>
  );
}
