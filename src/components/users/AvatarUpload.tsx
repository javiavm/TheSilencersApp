'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function AvatarUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd });
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
    <div className="flex items-center gap-4">
      {value ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={value}
          alt="Avatar"
          className="h-20 w-20 rounded-full border border-surface-border object-cover"
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-surface-muted border border-surface-border" />
      )}
      <div>
        <label className="inline-flex h-10 items-center gap-2 rounded-md border border-surface-border bg-surface-muted px-4 text-sm font-medium hover:bg-surface-border cursor-pointer">
          <Upload className="h-4 w-4" />
          {uploading ? 'Subiendo…' : 'Cambiar avatar'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handle(f);
            }}
          />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">JPG/PNG/WebP, máx 2MB.</p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
