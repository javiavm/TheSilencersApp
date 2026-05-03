import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServerForm } from '@/components/servers/ServerForm';

export default async function NewServerPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-2xl font-bold">Registrar servidor</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Comparte tu servidor con la comunidad. Un moderador podrá verificarlo después.
      </p>
      <ServerForm mode={{ kind: 'create' }} />
    </div>
  );
}
