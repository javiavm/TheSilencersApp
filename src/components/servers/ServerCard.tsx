import Link from 'next/link';
import { BadgeCheck, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { GAME_LABELS, truncate } from '@/lib/utils';
import type { ServerListItem } from '@/models/repositories/serverRepository';

export function ServerCard({ server }: { server: ServerListItem }) {
  return (
    <Link href={`/servidores/${server.id}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-brand-500/60">
        {server.bannerUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={server.bannerUrl} alt={server.name} loading="lazy" decoding="async" className="aspect-[16/6] w-full object-cover" />
        ) : (
          <div className="aspect-[16/6] bg-gradient-to-br from-brand-700/40 via-brand-500/20 to-transparent" />
        )}
        <CardContent>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold leading-snug line-clamp-1 group-hover:text-brand-300">
              {server.name}
            </h3>
            {server.isVerified && (
              <BadgeCheck className="h-4 w-4 text-brand-400" aria-label="Verificado" />
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <Badge>{GAME_LABELS[server.game]}</Badge>
            {server.ip && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Hash className="h-3 w-3" />
                {server.ip}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {truncate(server.description, 140)}
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            por @{server.owner.username}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
