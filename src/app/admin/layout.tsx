import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Newspaper, Package, Server as ServerIcon } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR') redirect('/');

  return (
    <div className="container py-8 grid gap-6 md:gap-8 md:grid-cols-[220px_1fr]">
      <aside>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Panel de admin
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="px-3 py-2 rounded hover:bg-surface-muted">
            Dashboard
          </Link>
          <Link href="/admin/posts" className="px-3 py-2 rounded hover:bg-surface-muted inline-flex items-center gap-2">
            <Newspaper className="h-4 w-4" /> Posts
          </Link>
          <Link href="/admin/recursos" className="px-3 py-2 rounded hover:bg-surface-muted inline-flex items-center gap-2">
            <Package className="h-4 w-4" /> Recursos
          </Link>
          <Link href="/admin/servidores" className="px-3 py-2 rounded hover:bg-surface-muted inline-flex items-center gap-2">
            <ServerIcon className="h-4 w-4" /> Servidores
          </Link>
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
