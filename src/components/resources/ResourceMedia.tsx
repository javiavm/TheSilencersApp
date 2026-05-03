'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ImageIcon, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

// El viewer 3D se carga solo cuando el usuario elige la pestaña 3D.
const SkinViewer3D = dynamic(() => import('./SkinViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] flex items-center justify-center text-sm text-muted-foreground">
      Cargando viewer 3D…
    </div>
  ),
});

interface Props {
  thumbnailUrl: string | null;
  skinUrl: string | null;
  title: string;
}

export function ResourceMedia({ thumbnailUrl, skinUrl, title }: Props) {
  const has3D = !!skinUrl;
  const has2D = !!thumbnailUrl;
  // Si solo hay 3D, arranca en 3D. Si hay ambos, arranca en 2D (carga más rápida).
  const [view, setView] = useState<'2d' | '3d'>(has2D ? '2d' : '3d');

  if (!has2D && !has3D) return null;

  return (
    <div>
      {has3D && has2D && (
        <div className="inline-flex rounded-md border border-surface-border bg-surface-muted p-1 mb-3">
          <TabButton active={view === '2d'} onClick={() => setView('2d')}>
            <ImageIcon className="h-4 w-4" /> 2D
          </TabButton>
          <TabButton active={view === '3d'} onClick={() => setView('3d')}>
            <Box className="h-4 w-4" /> 3D
          </TabButton>
        </div>
      )}

      {view === '2d' && has2D && (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-surface-border">
          <Image
            src={thumbnailUrl!}
            alt={title}
            fill
            className="object-contain bg-surface-muted"
            sizes="(max-width: 768px) 100vw, 720px"
            priority
          />
        </div>
      )}

      {view === '3d' && has3D && (
        <div className="flex justify-center rounded-xl border border-surface-border bg-gradient-to-b from-brand-900/30 to-background p-4">
          <SkinViewer3D skinUrl={skinUrl!} width={360} height={460} />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm transition-colors',
        active
          ? 'bg-brand-500 text-white'
          : 'text-muted-foreground hover:text-foreground hover:bg-surface',
      )}
    >
      {children}
    </button>
  );
}
