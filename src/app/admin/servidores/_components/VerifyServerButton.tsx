'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { BadgeCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  id: string;
  verified: boolean;
}

export function VerifyServerButton({ id, verified }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onClick = () => {
    start(async () => {
      const res = await fetch(`/api/servers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ verified: !verified }),
      });
      if (res.ok) router.refresh();
      else alert('No se pudo cambiar el estado.');
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={pending}>
      {verified ? (
        <>
          <ShieldOff className="h-4 w-4" /> Desverificar
        </>
      ) : (
        <>
          <BadgeCheck className="h-4 w-4" /> Verificar
        </>
      )}
    </Button>
  );
}
