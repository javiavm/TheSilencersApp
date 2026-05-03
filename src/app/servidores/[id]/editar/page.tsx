import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findServerById } from '@/models/repositories/serverRepository';
import { ServerForm } from '@/components/servers/ServerForm';

interface Props {
  params: { id: string };
}

export default async function EditServerPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const server = await findServerById(params.id);
  if (!server) notFound();

  const canModerate = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
  const isOwner = server.ownerId === session.user.id;
  if (!isOwner && !canModerate) redirect(`/servidores/${params.id}`);

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-2xl font-bold">Editar servidor</h1>
      <p className="text-sm text-muted-foreground mb-6">{server.name}</p>
      <ServerForm mode={{ kind: 'edit', server }} />
    </div>
  );
}
