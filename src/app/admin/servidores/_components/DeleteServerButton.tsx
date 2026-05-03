'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DeleteServerButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onClick = () => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    start(async () => {
      const res = await fetch(`/api/servers/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
      else alert('No se pudo eliminar.');
    });
  };

  return (
    <Button variant="destructive" size="sm" onClick={onClick} disabled={pending}>
      <Trash2 className="h-4 w-4" />
      {pending ? 'Eliminando…' : 'Eliminar'}
    </Button>
  );
}
