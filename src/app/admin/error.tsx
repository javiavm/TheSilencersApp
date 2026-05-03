'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin/error]', error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-6 text-sm">
      <p className="font-semibold text-red-300">Error en el panel</p>
      <p className="mt-1 text-red-300/80">{error.message}</p>
      {error.digest && (
        <p className="mt-1 text-xs text-red-300/60">ref: {error.digest}</p>
      )}
      <Button onClick={reset} className="mt-4" size="sm">
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}
