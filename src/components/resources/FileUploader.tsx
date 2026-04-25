'use client';

import { useRef, useState } from 'react';
import { Upload, FileCheck2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatBytes } from '@/lib/utils';

export interface UploadedFile {
  url: string;
  path: string;
  size: number;
  filename: string;
  contentType: string | null;
}

interface Props {
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
  endpoint?: string;
  maxBytes?: number;
}

export function FileUploader({
  value,
  onChange,
  endpoint = '/api/upload/file',
  maxBytes = 50 * 1024 * 1024,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File) => {
    setError(null);
    if (file.size > maxBytes) {
      setError(`Archivo demasiado grande (máx ${formatBytes(maxBytes)}).`);
      return;
    }
    setUploading(true);
    setProgress(0);

    // XHR para tener progreso real — fetch aún no expone upload.progress.
    const fd = new FormData();
    fd.append('file', file);

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint);
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            onChange(data as UploadedFile);
          } else {
            setError(data.error ?? `Error ${xhr.status}`);
          }
        } catch {
          setError('Respuesta inválida del servidor.');
        }
        resolve();
      };
      xhr.onerror = () => {
        setError('Error de red.');
        resolve();
      };
      xhr.send(fd);
    });

    setUploading(false);
    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  if (value) {
    return (
      <div className="rounded-md border border-surface-border bg-surface-muted p-3">
        <div className="flex items-center gap-3">
          <FileCheck2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{value.filename}</div>
            <div className="text-xs text-muted-foreground">
              {formatBytes(value.size)} · {value.contentType ?? 'binario'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Quitar archivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-surface-border bg-surface-muted p-6 text-sm text-muted-foreground hover:border-brand-500/50 cursor-pointer">
        <Upload className="h-5 w-5" />
        <span>
          {uploading
            ? `Subiendo${progress !== null ? ` ${progress}%` : '…'}`
            : `Click para subir archivo (máx ${formatBytes(maxBytes)})`}
        </span>
        <span className="text-xs">ZIP, JAR, RAR, 7z, JSON, TXT, PDF…</span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
      </label>
      {progress !== null && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded bg-surface-border">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
