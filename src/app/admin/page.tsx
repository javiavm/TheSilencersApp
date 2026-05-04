import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    posts,
    publishedPosts,
    resources,
    publishedResources,
    totalDownloadsAgg,
    users,
    servers,
    verifiedServers,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.resource.count(),
    prisma.resource.count({ where: { published: true } }),
    prisma.resource.aggregate({ _sum: { downloadCount: true } }),
    prisma.user.count(),
    prisma.server.count(),
    prisma.server.count({ where: { isVerified: true } }),
  ]);

  const totalDownloads = totalDownloadsAgg._sum.downloadCount ?? 0;

  return (
    <>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Resumen operativo del MVP.</p>

      <h2 className="mt-6 text-xs uppercase tracking-wider text-muted-foreground">Contenido</h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-3">
        <Stat label="Posts totales" value={posts} />
        <Stat label="Publicados" value={publishedPosts} />
        <Stat label="Borradores" value={posts - publishedPosts} />
      </div>

      <h2 className="mt-8 text-xs uppercase tracking-wider text-muted-foreground">Recursos</h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-3">
        <Stat label="Recursos totales" value={resources} />
        <Stat label="Publicados" value={publishedResources} />
        <Stat label="Descargas acumuladas" value={totalDownloads} />
      </div>

      <h2 className="mt-8 text-xs uppercase tracking-wider text-muted-foreground">Comunidad</h2>
      <div className="mt-2 grid gap-4 sm:grid-cols-3">
        <Stat label="Usuarios" value={users} />
        <Stat label="Servidores" value={servers} />
        <Stat label="Verificados" value={verifiedServers} />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-bold tabular-nums">
          {value.toLocaleString('es-ES')}
        </div>
      </CardContent>
    </Card>
  );
}
