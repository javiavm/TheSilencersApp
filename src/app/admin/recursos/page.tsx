import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getResourcesAsModerator } from '@/services/resourceService';
import { resourceListQuerySchema } from '@/lib/validations/resource';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pencil, Download } from 'lucide-react';
import {
  formatBytes,
  formatDate,
  GAME_LABELS,
  RESOURCE_CATEGORY_LABELS,
} from '@/lib/utils';
import { Pagination } from '@/components/posts/Pagination';
import { DeleteResourceButton } from './_components/DeleteResourceButton';
import { TogglePublishButton } from './_components/TogglePublishButton';

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function AdminResourcesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const query = resourceListQuerySchema.parse({
    ...searchParams,
    published: searchParams.published ?? 'all',
  });
  const { items, total, page, totalPages } = await getResourcesAsModerator(query, session!.user);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recursos</h1>
          <p className="text-sm text-muted-foreground">{total} en total — moderación</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">Cat / Juego</th>
              <th className="px-4 py-2">Autor</th>
              <th className="px-4 py-2">Tamaño</th>
              <th className="px-4 py-2">
                <span className="inline-flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  Descargas
                </span>
              </th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Subido</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  Sin recursos todavía.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="border-t border-surface-border">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/recursos/${r.slug}`} className="hover:text-brand-300">
                      {r.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge>{RESOURCE_CATEGORY_LABELS[r.category]}</Badge>
                      <Badge variant="secondary">{GAME_LABELS[r.game]}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">@{r.author.username}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatBytes(r.size)}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {r.downloadCount.toLocaleString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    {r.published ? (
                      <Badge variant="success">Publicado</Badge>
                    ) : (
                      <Badge variant="warning">Oculto</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <TogglePublishButton id={r.id} published={r.published} />
                      <Link href={`/recursos/${r.slug}/editar`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                      </Link>
                      <DeleteResourceButton id={r.id} title={r.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/admin/recursos"
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </>
  );
}
