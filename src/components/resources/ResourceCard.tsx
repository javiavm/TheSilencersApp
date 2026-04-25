import Link from 'next/link';
import Image from 'next/image';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  formatBytes,
  formatDate,
  GAME_LABELS,
  RESOURCE_CATEGORY_LABELS,
  truncate,
} from '@/lib/utils';
import type { ResourceListItem } from '@/models/repositories/resourceRepository';

export function ResourceCard({ resource }: { resource: ResourceListItem }) {
  return (
    <Link href={`/recursos/${resource.slug}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-brand-500/60">
        {resource.thumbnailUrl ? (
          <div className="relative aspect-video">
            <Image
              src={resource.thumbnailUrl}
              alt={resource.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-brand-700/30 via-brand-500/20 to-transparent flex items-center justify-center">
            <span className="text-4xl">📦</span>
          </div>
        )}

        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge>{RESOURCE_CATEGORY_LABELS[resource.category]}</Badge>
            <Badge variant="secondary">{GAME_LABELS[resource.game]}</Badge>
            {resource.version && (
              <span className="text-muted-foreground">v{resource.version}</span>
            )}
          </div>

          <h3 className="mt-2 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-brand-300">
            {resource.title}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">
            {truncate(resource.description, 160)}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>por @{resource.author.username}</span>
            <span className="inline-flex items-center gap-1">
              <Download className="h-3 w-3" />
              {resource.downloadCount.toLocaleString('es-ES')}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatDate(resource.createdAt)}</span>
            <span>{formatBytes(resource.size)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
