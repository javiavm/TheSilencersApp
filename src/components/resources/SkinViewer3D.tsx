'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  skinUrl: string;
  width?: number;
  height?: number;
}

// Renderiza una skin de Minecraft en 3D con skinview3d.
// Cargado dinámicamente desde ResourceMedia — no se incluye en el bundle inicial.
export default function SkinViewer3D({ skinUrl, width = 320, height = 420 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<{ dispose?: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    setError(null);
    setLoading(true);

    (async () => {
      try {
        const sv3d = await import('skinview3d');
        if (cancelled) return;

        const viewer = new sv3d.SkinViewer({
          canvas,
          width,
          height,
          skin: skinUrl,
        });

        viewer.animation = new sv3d.WalkingAnimation();
        viewer.animation.speed = 0.5;
        viewer.zoom = 0.85;

        // Permitir rotación pero no pan/zoom agresivo.
        if (viewer.controls) {
          viewer.controls.enableRotate = true;
          viewer.controls.enableZoom = true;
          viewer.controls.enablePan = false;
        }

        viewerRef.current = viewer;
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        console.error('[SkinViewer3D]', e);
        setError(
          e instanceof Error
            ? `No se pudo cargar la skin: ${e.message}`
            : 'No se pudo cargar la skin.',
        );
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      viewerRef.current?.dispose?.();
      viewerRef.current = null;
    };
  }, [skinUrl, width, height]);

  if (error) {
    return (
      <div
        className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300"
        style={{ width, minHeight: 80 }}
      >
        {error}
        <p className="mt-1 text-xs text-amber-300/70">
          Verifica que la URL sea un PNG de skin válido (64×64 o 64×32).
        </p>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="rounded-md bg-gradient-to-b from-brand-900/30 to-background border border-surface-border"
        style={{ width, height }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Cargando viewer 3D…
        </div>
      )}
    </div>
  );
}
