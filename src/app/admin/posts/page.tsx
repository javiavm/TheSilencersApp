import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminPosts } from '@/services/postService';
import { postListQuerySchema } from '@/lib/validations/post';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Pencil } from 'lucide-react';
import { formatDate, POST_TYPE_LABELS } from '@/lib/utils';
import { Pagination } from '@/components/posts/Pagination';
import { DeletePostButton } from './_components/DeletePostButton';

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function AdminPostsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const query = postListQuerySchema.parse({ ...searchParams, published: searchParams.published ?? 'all' });
  const { items, page, totalPages, total } = await getAdminPosts(query, session!.user);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted-foreground">{total} en total</p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="h-4 w-4" /> Nuevo post
          </Button>
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Actualizado</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Sin posts todavía.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="border-t border-surface-border">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/posts/${p.slug}`} className="hover:text-brand-300">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{POST_TYPE_LABELS[p.type]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.published ? (
                      <Badge variant="success">Publicado</Badge>
                    ) : (
                      <Badge variant="warning">Borrador</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/posts/${p.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" /> Editar
                        </Button>
                      </Link>
                      <DeletePostButton id={p.id} title={p.title} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/admin/posts"
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </>
  );
}
