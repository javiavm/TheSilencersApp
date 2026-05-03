'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { User } from '@prisma/client';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save } from 'lucide-react';
import { AvatarUpload } from './AvatarUpload';

export function ProfileEditor({ user }: { user: User }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [username, setUsername] = useState(user.username ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    setOkMsg(null);
    startTransition(async () => {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          username: username.trim() || undefined,
          bio: bio.trim() || null,
          avatarUrl: avatarUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'No se pudo guardar.');
        return;
      }
      setOkMsg('Perfil actualizado.');
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-4"
    >
      <Card>
        <CardContent className="space-y-4">
          <AvatarUpload value={avatarUrl} onChange={setAvatarUrl} />

          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              maxLength={20}
              placeholder="tu-usuario"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              3-20 caracteres. Solo minúsculas, números y guiones.
            </p>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Cuéntanos algo sobre ti…"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {okMsg}
        </div>
      )}

      <Button type="submit" disabled={pending}>
        <Save className="h-4 w-4" />
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </form>
  );
}
