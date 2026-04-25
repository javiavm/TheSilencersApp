import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, POST_TYPE_LABELS } from '@/lib/utils';
import type { PostListItem } from '@/models/repositories/postRepository';

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-brand-500/60">
        {post.featuredImageUrl ? (
          <div className="relative aspect-video">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-brand-800/40 to-brand-500/20" />
        )}
        <CardContent>
          <div className="flex items-center gap-2 text-xs">
            <Badge>{POST_TYPE_LABELS[post.type]}</Badge>
            {post.publishedAt && (
              <span className="text-muted-foreground">{formatDate(post.publishedAt)}</span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-brand-300">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
          )}
          {post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="secondary">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
