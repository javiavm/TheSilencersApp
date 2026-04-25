'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al subir');
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative overflow-hidden rounded-md border border-surface-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            aria-label="Quitar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border bg-surface-muted p-6 text-sm text-muted-foreground hover:border-brand-500/50 cursor-pointer">
          <Upload className="h-5 w-5" />
          <span>{uploading ? 'Subiendo…' : 'Click para subir imagen (máx 5MB)'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="text-xs text-muted-foreground">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt('O pega una URL de imagen:');
            if (url) onChange(url);
          }}
        >
          Usar URL externa
        </Button>
      </div>
    </div>
  );
}
