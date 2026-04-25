'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Resource } from '@prisma/client';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FileUploader, type UploadedFile } from './FileUploader';
import { Save } from 'lucide-react';

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; resource: Resource; canModerate: boolean };

const CATEGORIES = [
  { value: 'GUIDE', label: 'Guía' },
  { value: 'MOD', label: 'Mod' },
  { value: 'PLUGIN', label: 'Plugin' },
  { value: 'BUILD', label: 'Build' },
  { value: 'OTHER', label: 'Otro' },
];

const GAMES = [
  { value: 'MINECRAFT', label: 'Minecraft' },
  { value: 'DISCORD_BOT', label: 'Bot de Discord' },
  { value: 'GENERAL', label: 'General' },
  { value: 'OTHER', label: 'Otro' },
];

export function ResourceForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initial = mode.kind === 'edit' ? mode.resource : null;
  const canModerate = mode.kind === 'edit' && mode.canModerate;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'MOD');
  const [game, setGame] = useState(initial?.game ?? 'MINECRAFT');
  const [version, setVersion] = useState(initial?.version ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? '');
  const [published, setPublished] = useState(initial?.published ?? true);
  const [file, setFile] = useState<UploadedFile | null>(
    initial?.fileUrl
      ? {
          url: initial.fileUrl,
          path: '',
          size: initial.size ?? 0,
          filename: initial.fileUrl.split('/').pop() ?? 'archivo',
          contentType: null,
        }
      : null,
  );
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);

    if (!file && mode.kind === 'create') {
      setError('Sube el archivo del recurso antes de guardar.');
      return;
    }

    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      category,
      game,
      version: version.trim() || null,
      thumbnailUrl: thumbnailUrl.trim() || null,
      fileUrl: file?.url ?? null,
      size: file?.size ?? null,
    };
    if (canModerate || mode.kind === 'create') payload.published = published;

    startTransition(async () => {
      const url = mode.kind === 'create' ? '/api/resources' : `/api/resources/${mode.resource.id}`;
      const method = mode.kind === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'No se pudo guardar.');
        return;
      }
      const saved = await res.json();
      router.push(saved.published ? `/recursos/${saved.slug}` : '/recursos');
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid gap-6 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={120}
                placeholder="Ej. Quark — utilidades para Minecraft"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                maxLength={4000}
                rows={8}
                placeholder="Qué hace, cómo se instala, requisitos…"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Soporta texto plano. Markdown llegará en Fase 2.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <Label>Archivo descargable</Label>
            <FileUploader value={file} onChange={setFile} />
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="game">Juego / contexto</Label>
              <Select
                id="game"
                value={game}
                onChange={(e) => setGame(e.target.value as typeof game)}
              >
                {GAMES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="version">Versión</Label>
              <Input
                id="version"
                value={version ?? ''}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                maxLength={20}
              />
            </div>
            <div>
              <Label htmlFor="thumbnailUrl">Miniatura (URL)</Label>
              <Input
                id="thumbnailUrl"
                type="url"
                value={thumbnailUrl ?? ''}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>

            {(canModerate || mode.kind === 'create') && (
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publicado</Label>
                <input
                  id="published"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 accent-brand-500"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={pending} className="w-full">
          <Save className="h-4 w-4" />
          {pending ? 'Guardando…' : 'Guardar'}
        </Button>
      </aside>
    </form>
  );
}
