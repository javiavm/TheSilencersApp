'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  id: string;
  published: boolean;
}

export function TogglePublishButton({ id, published }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onClick = () => {
    start(async () => {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ published: !published }),
      });
      if (res.ok) router.refresh();
      else alert('No se pudo cambiar el estado.');
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={pending}>
      {published ? (
        <>
          <EyeOff className="h-4 w-4" />
          Despublicar
        </>
      ) : (
        <>
          <Eye className="h-4 w-4" />
          Publicar
        </>
      )}
    </Button>
  );
}
