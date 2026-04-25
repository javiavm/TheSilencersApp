import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { getPublicResources } from '@/services/resourceService';
import { resourceListQuerySchema } from '@/lib/validations/resource';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceFilters } from '@/components/resources/ResourceFilters';
import { Pagination } from '@/components/posts/Pagination';

export const metadata: Metadata = {
  title: 'Recursos descargables',
  description: 'Guías, mods, plugins y builds para la comunidad gamer hispanohablante.',
};

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function ResourcesPage({ searchParams }: Props) {
  const query = resourceListQuerySchema.parse({ ...searchParams, published: 'true' });
  const { items, total, page, totalPages } = await getPublicResources(query);
  const session = await getServerSession(authOptions);

  return (
    <div className="container py-10">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recursos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? 'recurso disponible' : 'recursos disponibles'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ResourceFilters />
          {session?.user && (
            <Link href="/recursos/nuevo">
              <Button>
                <Plus className="h-4 w-4" />
                Subir recurso
              </Button>
            </Link>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center text-muted-foreground">
          {session?.user ? (
            <>
              No hay recursos que coincidan con los filtros.{' '}
              <Link href="/recursos/nuevo" className="text-brand-400 hover:text-brand-300">
                ¡Sé el primero en subir uno!
              </Link>
            </>
          ) : (
            <>
              No hay recursos todavía.{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300">
                Inicia sesión
              </Link>{' '}
              para subir el primero.
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}

      <Pagination
        basePath="/recursos"
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
