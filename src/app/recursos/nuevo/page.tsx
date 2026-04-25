import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ResourceForm } from '@/components/resources/ResourceForm';

export default async function NewResourcePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-2xl font-bold">Subir un recurso</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Comparte una guía, mod, plugin o build con la comunidad. Los moderadores pueden
        despublicarlo si infringe las normas.
      </p>
      <ResourceForm mode={{ kind: 'create' }} />
    </div>
  );
}
