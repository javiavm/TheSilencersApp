import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProfile } from '@/services/userService';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Pencil, Newspaper, Package, Server as ServerIcon, BadgeCheck } from 'lucide-react';
import {
  formatDate,
  GAME_LABELS,
  POST_TYPE_LABELS,
  RESOURCE_CATEGORY_LABELS,
} from '@/lib/utils';
import { NotFoundError } from '@/services/postService';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { user } = await getProfile(params.username);
    return {
      title: `@${user.username}`,
      description: user.bio ?? `Perfil de @${user.username} en The Silencers.`,
    };
  } catch {
    return {};
  }
}

export default async function ProfilePage({ params }: Props) {
  let profile;
  try {
    profile = await getProfile(params.username);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }

  const session = await getServerSession(authOptions);
  const isMe = session?.user?.id === profile.user.id;

  const { user, posts, resources, servers } = profile;

  return (
    <div className="container py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {user.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={user.avatarUrl} alt={user.username ?? ''} className="h-20 w-20 rounded-full border border-surface-border" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-surface-muted border border-surface-border" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold truncate">@{user.username}</h1>
            {user.role !== 'USER' && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-400">
                <BadgeCheck className="h-3 w-3" />
                {user.role}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Miembro desde {formatDate(user.createdAt)}</p>
          {user.bio && <p className="mt-2 text-sm">{user.bio}</p>}
        </div>
        {isMe && (
          <Link href="/me">
            <Button variant="outline">
              <Pencil className="h-4 w-4" /> Editar perfil
            </Button>
          </Link>
        )}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Section icon={<Newspaper className="h-4 w-4" />} title="Posts" empty="Sin posts publicados">
          {posts.map((p) => (
            <Link key={p.id} href={`/posts/${p.slug}`} className="block">
              <Card className="hover:border-brand-500/60 transition-colors">
                <CardContent>
                  <div className="text-xs"><Badge>{POST_TYPE_LABELS[p.type]}</Badge></div>
                  <div className="mt-1 font-medium line-clamp-2">{p.title}</div>
                  {p.publishedAt && (
                    <div className="mt-1 text-xs text-muted-foreground">{formatDate(p.publishedAt)}</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </Section>

        <Section icon={<Package className="h-4 w-4" />} title="Recursos" empty="Sin recursos subidos">
          {resources.map((r) => (
            <Link key={r.id} href={`/recursos/${r.slug}`} className="block">
              <Card className="hover:border-brand-500/60 transition-colors">
                <CardContent>
                  <div className="text-xs flex flex-wrap gap-1">
                    <Badge>{RESOURCE_CATEGORY_LABELS[r.category]}</Badge>
                    <Badge variant="secondary">{GAME_LABELS[r.game]}</Badge>
                  </div>
                  <div className="mt-1 font-medium line-clamp-2">{r.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {r.downloadCount.toLocaleString('es-ES')} descargas
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Section>

        <Section icon={<ServerIcon className="h-4 w-4" />} title="Servidores" empty="Sin servidores registrados">
          {servers.map((s) => (
            <Link key={s.id} href={`/servidores/${s.id}`} className="block">
              <Card className="hover:border-brand-500/60 transition-colors">
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="font-medium line-clamp-1">{s.name}</span>
                    {s.isVerified && <BadgeCheck className="h-4 w-4 text-brand-400" />}
                  </div>
                  <div className="mt-1 text-xs"><Badge>{GAME_LABELS[s.game]}</Badge></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  empty,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.filter(Boolean).length > 0;
  return (
    <div>
      <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {icon} {title}
      </h2>
      {hasItems ? (
        <div className="space-y-3">{children}</div>
      ) : (
        <div className="rounded-md border border-dashed border-surface-border py-6 text-center text-sm text-muted-foreground">
          {empty}
        </div>
      )}
    </div>
  );
}
