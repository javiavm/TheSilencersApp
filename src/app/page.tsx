import Link from 'next/link';
import { ArrowRight, Gamepad2, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getPublicPosts } from '@/services/postService';
import { PostCard } from '@/components/posts/PostCard';

// Server-rendered en cada request — evita problemas de DB durante el build.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { items: latestPosts } = await getPublicPosts({
    page: 1,
    pageSize: 3,
    published: 'true',
  });

  return (
    <>
      {/* Hero */}
      <section className="border-b border-surface-border bg-gradient-to-b from-brand-900/20 via-background to-background">
        <div className="container py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            El hub <span className="text-brand-400">gamer</span> hispanohablante.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Guías, mods, plugins y servidores reunidos en un solo lugar. Publica, descarga y
            comparte con la comunidad.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/posts">
              <Button size="lg">
                Ver noticias <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/recursos">
              <Button size="lg" variant="outline">
                Explorar recursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <section className="container py-16 grid gap-6 md:grid-cols-3">
        <Feature
          icon={<Gamepad2 className="h-5 w-5 text-brand-400" />}
          title="Contenido editorial"
          description="Noticias, anuncios y resultados de sorteos para la comunidad."
        />
        <Feature
          icon={<Download className="h-5 w-5 text-brand-400" />}
          title="Recursos descargables"
          description="Guías, mods, plugins y builds listos para usar."
        />
        <Feature
          icon={<Users className="h-5 w-5 text-brand-400" />}
          title="Servidores gamer"
          description="Descubre y promociona servidores de Minecraft, Roblox y más."
        />
      </section>

      {/* Últimas noticias */}
      {latestPosts.length > 0 && (
        <section className="container py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Últimas noticias</h2>
            <Link href="/posts" className="text-sm text-brand-400 hover:text-brand-300">
              Ver todas →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {latestPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-2 font-semibold">
          {icon} {title}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
