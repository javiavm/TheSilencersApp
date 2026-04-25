import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { findPostBySlug } from '@/models/repositories/postRepository';
import { RichTextRenderer } from '@/components/posts/RichTextRenderer';
import { formatDate, POST_TYPE_LABELS } from '@/lib/utils';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPostBySlug(params.slug);
  if (!post || !post.published) return {};
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.featuredImageUrl ? [{ url: post.featuredImageUrl }] : undefined,
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const post = await findPostBySlug(params.slug);
  if (!post || !post.published) notFound();

  return (
    <div className="container py-10 max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge>{POST_TYPE_LABELS[post.type]}</Badge>
        {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
        <span>·</span>
        <span>por @{post.author.username}</span>
      </div>

      <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{post.title}</h1>
      {post.excerpt && (
        <p className="mt-2 text-lg text-muted-foreground">{post.excerpt}</p>
      )}

      {post.featuredImageUrl && (
        <div className="relative mt-6 aspect-video overflow-hidden rounded-xl border border-surface-border">
          <Image
            src={post.featuredImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      <div className="mt-8">
        <RichTextRenderer doc={post.content} />
      </div>

      {post.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t border-surface-border pt-6">
          {post.tags.map((t) => (
            <Badge key={t} variant="secondary">
              #{t}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
