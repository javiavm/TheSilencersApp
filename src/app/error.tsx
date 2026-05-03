'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="container py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-red-400">Algo salió mal</p>
      <h1 className="mt-2 text-3xl font-extrabold">Ocurrió un error</h1>
      <p className="mt-2 text-muted-foreground max-w-md mx-auto">
        Intentamos cargar la página pero falló. Puedes reintentar o volver al inicio.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground">ref: {error.digest}</p>
      )}
      <div className="mt-6 flex items-center justify-center gap-2">
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
        <a href="/">
          <Button variant="outline">Volver al inicio</Button>
        </a>
      </div>
    </div>
  );
}
