'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  resourceId: string;
  initialCount: number;
  hasFile: boolean;
}

export function DownloadButton({ resourceId, initialCount, hasFile }: Props) {
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/resources/${resourceId}/download`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'No se pudo iniciar la descarga.');
      setCount(data.downloadCount);
      window.open(data.fileUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setPending(false);
    }
  };

  if (!hasFile) {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
        Este recurso aún no tiene archivo descargable.
      </div>
    );
  }

  return (
    <div>
      <Button size="lg" className="w-full" onClick={onClick} disabled={pending}>
        <Download className="h-4 w-4" />
        {pending ? 'Iniciando descarga…' : 'Descargar'}
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {count.toLocaleString('es-ES')} {count === 1 ? 'descarga' : 'descargas'}
      </p>
      {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
