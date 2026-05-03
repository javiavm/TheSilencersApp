import Link from 'next/link';
import { listServers } from '@/models/repositories/serverRepository';
import { serverListQuerySchema } from '@/lib/validations/server';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pencil } from 'lucide-react';
import { formatDate, GAME_LABELS } from '@/lib/utils';
import { Pagination } from '@/components/posts/Pagination';
import { VerifyServerButton } from './_components/VerifyServerButton';
import { DeleteServerButton } from './_components/DeleteServerButton';

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function AdminServersPage({ searchParams }: Props) {
  const query = serverListQuerySchema.parse({ ...searchParams, verified: searchParams.verified ?? 'all' });
  const { items, total, page, totalPages } = await listServers(query);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Servidores</h1>
        <p className="text-sm text-muted-foreground">{total} en total — moderación y verificación</p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Juego</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Creado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Sin servidores todavía.
                </td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s.id} className="border-t border-surface-border">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/servidores/${s.id}`} className="hover:text-brand-300">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><Badge>{GAME_LABELS[s.game]}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">@{s.owner.username}</td>
                  <td className="px-4 py-3">
                    {s.isVerified ? (
                      <Badge variant="success">Verificado</Badge>
                    ) : (
                      <Badge variant="warning">Sin verificar</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <VerifyServerButton id={s.id} verified={s.isVerified} />
                      <Link href={`/servidores/${s.id}/editar`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" /> Editar
                        </Button>
                      </Link>
                      <DeleteServerButton id={s.id} name={s.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/admin/servidores" page={page} totalPages={totalPages} searchParams={searchParams} />
    </>
  );
}
