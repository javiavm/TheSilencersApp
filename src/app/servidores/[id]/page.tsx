import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeCheck, ExternalLink, Pencil } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findServerById } from '@/models/repositories/serverRepository';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CopyIpButton } from '@/components/servers/CopyIpButton';
import { formatDate, GAME_LABELS } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const server = await findServerById(params.id);
  if (!server) return {};
  return {
    title: server.name,
    description: server.description.slice(0, 160),
    openGraph: {
      title: server.name,
      description: server.description.slice(0, 160),
      images: server.bannerUrl ? [{ url: server.bannerUrl }] : undefined,
    },
  };
}

export default async function ServerDetailPage({ params }: Props) {
  const server = await findServerById(params.id);
  if (!server) notFound();
  const session = await getServerSession(authOptions);
  const canEdit =
    session?.user?.id === server.ownerId ||
    session?.user?.role === 'ADMIN' ||
    session?.user?.role === 'MODERATOR';

  return (
    <div className="container py-10 grid gap-8 lg:grid-cols-[1fr_320px]">
      <article>
        {server.bannerUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={server.bannerUrl} alt={server.name} className="aspect-[16/6] w-full rounded-xl object-cover border border-surface-border" />
        ) : (
          <div className="aspect-[16/6] w-full rounded-xl bg-gradient-to-br from-brand-700/40 via-brand-500/20 to-transparent border border-surface-border" />
        )}

        <div className="mt-5 flex items-center gap-2">
          <Badge>{GAME_LABELS[server.game]}</Badge>
          {server.isVerified && (
            <span className="inline-flex items-center gap-1 text-sm text-brand-400">
              <BadgeCheck className="h-4 w-4" />
              Verificado
            </span>
          )}
        </div>

        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">{server.name}</h1>
        <div className="mt-1 text-sm text-muted-foreground">
          por{' '}
          <Link href={`/u/${server.owner.username}`} className="hover:text-brand-300">
            @{server.owner.username}
          </Link>{' '}
          · {formatDate(server.createdAt)}
        </div>

        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/90">
          {server.description}
        </div>

        {server.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {server.tags.map((t) => (
              <Badge key={t} variant="secondary">#{t}</Badge>
            ))}
          </div>
        )}
      </article>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-4">
            {server.ip ? (
              <div>
                <div className="text-xs uppercase text-muted-foreground">IP / host</div>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded bg-surface-muted px-2 py-1 text-sm">{server.ip}</code>
                  <CopyIpButton ip={server.ip} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">El dueño aún no agregó IP.</p>
            )}

            {server.discordInvite && (
              <a href={server.discordInvite} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="w-full">
                  <ExternalLink className="h-4 w-4" />
                  Unirse al Discord
                </Button>
              </a>
            )}

            {canEdit && (
              <Link href={`/servidores/${server.id}/editar`}>
                <Button variant="ghost" className="w-full">
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
