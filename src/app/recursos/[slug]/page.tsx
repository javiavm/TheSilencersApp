import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { findResourceBySlug } from '@/models/repositories/resourceRepository';
import { DownloadButton } from '@/components/resources/DownloadButton';
import { ResourceMedia } from '@/components/resources/ResourceMedia';
import {
  formatBytes,
  formatDate,
  GAME_LABELS,
  RESOURCE_CATEGORY_LABELS,
} from '@/lib/utils';

// Detecta si el recurso parece una skin de Minecraft (PNG + game MINECRAFT).
function detectMinecraftSkin(r: {
  game: string;
  fileUrl: string | null;
  thumbnailUrl: string | null;
}): string | null {
  if (r.game !== 'MINECRAFT') return null;
  const isPng = (u: string | null) => !!u && /\.png(\?.*)?$/i.test(u);
  if (isPng(r.fileUrl)) return r.fileUrl;
  if (isPng(r.thumbnailUrl)) return r.thumbnailUrl;
  return null;
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await findResourceBySlug(params.slug);
  if (!r || !r.published) return {};
  return {
    title: r.title,
    description: r.description.slice(0, 160),
    openGraph: {
      title: r.title,
      description: r.description.slice(0, 160),
      images: r.thumbnailUrl ? [{ url: r.thumbnailUrl }] : undefined,
    },
  };
}

export default async function ResourceDetailPage({ params }: Props) {
  const resource = await findResourceBySlug(params.slug);
  if (!resource || !resource.published) notFound();

  const skinUrl = detectMinecraftSkin(resource);

  return (
    <div className="container py-10 grid gap-8 lg:grid-cols-[1fr_320px]">
      <article>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge>{RESOURCE_CATEGORY_LABELS[resource.category]}</Badge>
          <Badge variant="secondary">{GAME_LABELS[resource.game]}</Badge>
          {resource.version && <span>v{resource.version}</span>}
          <span>·</span>
          <span>por @{resource.author.username}</span>
        </div>

        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
          {resource.title}
        </h1>

        <div className="mt-6">
          <ResourceMedia
            thumbnailUrl={resource.thumbnailUrl}
            skinUrl={skinUrl}
            title={resource.title}
          />
        </div>

        <div className="mt-6 whitespace-pre-wrap leading-relaxed text-foreground/90">
          {resource.description}
        </div>
      </article>

      <aside className="space-y-4">
        <Card>
          <CardContent>
            <DownloadButton
              resourceId={resource.id}
              initialCount={resource.downloadCount}
              hasFile={!!resource.fileUrl}
            />
            <dl className="mt-6 space-y-2 text-sm">
              <Row label="Tamaño" value={formatBytes(resource.size)} />
              <Row label="Versión" value={resource.version ?? '—'} />
              <Row label="Publicado" value={formatDate(resource.createdAt)} />
              <Row label="Actualizado" value={formatDate(resource.updatedAt)} />
              <Row label="Categoría" value={RESOURCE_CATEGORY_LABELS[resource.category]} />
              <Row label="Juego" value={GAME_LABELS[resource.game]} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              {resource.author.avatarUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={resource.author.avatarUrl}
                  alt={resource.author.username ?? ''}
                  className="h-10 w-10 rounded-full border border-surface-border"
                />
              )}
              <div className="min-w-0">
                <div className="font-medium">@{resource.author.username}</div>
                {resource.author.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {resource.author.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
