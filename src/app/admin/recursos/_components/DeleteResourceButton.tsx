'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function DeleteResourceButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const onClick = () => {
    if (!confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return;
    start(async () => {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
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
