import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserById } from '@/models/repositories/userRepository';
import { ProfileEditor } from '@/components/users/ProfileEditor';

export default async function MePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const user = await findUserById(session.user.id);
  if (!user) redirect('/login');

  return (
    <div className="container py-10 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Cambios visibles en{' '}
            {user.username ? (
              <Link href={`/u/${user.username}`} className="text-brand-400 hover:text-brand-300">
                /u/{user.username}
              </Link>
            ) : (
              'tu perfil público'
            )}
            .
          </p>
        </div>
      </div>

      <ProfileEditor user={user} />
    </div>
  );
}
