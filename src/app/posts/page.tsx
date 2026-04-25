import type { Metadata } from 'next';
import { getPublicPosts } from '@/services/postService';
import { postListQuerySchema } from '@/lib/validations/post';
import { PostCard } from '@/components/posts/PostCard';
import { PostFilters } from '@/components/posts/PostFilters';
import { Pagination } from '@/components/posts/Pagination';

export const metadata: Metadata = {
  title: 'Noticias y anuncios',
  description: 'Últimas noticias, anuncios y resultados de sorteos en The Silencers.',
};

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function PostsPage({ searchParams }: Props) {
  const query = postListQuerySchema.parse({ ...searchParams, published: 'true' });
  const { items, total, page, totalPages } = await getPublicPosts(query);

  return (
    <div className="container py-10">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Noticias &amp; anuncios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {total === 1 ? 'publicación' : 'publicaciones'}
          </p>
        </div>
        <PostFilters />
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-border py-16 text-center text-muted-foreground">
          No hay posts que coincidan con los filtros.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      <Pagination
        basePath="/posts"
        page={page}
        totalPages={totalPages}
        searchParams={searchParams}
      />
    </div>
  );
}
