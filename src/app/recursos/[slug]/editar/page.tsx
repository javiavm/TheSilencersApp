import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findResourceBySlug } from '@/models/repositories/resourceRepository';
import { ResourceForm } from '@/components/resources/ResourceForm';

interface Props {
  params: { slug: string };
}

export default async function EditOwnResourcePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const resource = await findResourceBySlug(params.slug);
  if (!resource) notFound();

  const canModerate = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';
  const isOwner = resource.authorId === session.user.id;
  if (!isOwner && !canModerate) redirect(`/recursos/${params.slug}`);

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-2xl font-bold">Editar recurso</h1>
      <p className="text-sm text-muted-foreground mb-6">{resource.title}</p>
      <ResourceForm mode={{ kind: 'edit', resource, canModerate }} />
    </div>
  );
}
