'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Post } from '@prisma/client';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { ImageUploader } from './ImageUploader';
import { Save, Eye } from 'lucide-react';

type Mode = { kind: 'create' } | { kind: 'edit'; post: Post };

export function PostForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initial = mode.kind === 'edit' ? mode.post : null;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');
  const [type, setType] = useState(initial?.type ?? 'NEWS');
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') ?? '');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initial?.featuredImageUrl ?? '');
  const [published, setPublished] = useState(initial?.published ?? false);
  const [content, setContent] = useState<unknown>(
    initial?.content ?? { type: 'doc', content: [] },
  );
  const [error, setError] = useState<string | null>(null);

  const submit = (publishNow: boolean | null = null) => {
    setError(null);
    const shouldPublish = publishNow === null ? published : publishNow;
    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      type,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      featuredImageUrl: featuredImageUrl || null,
      content,
      published: shouldPublish,
    };

    startTransition(async () => {
      const url = mode.kind === 'create' ? '/api/posts' : `/api/posts/${mode.post.id}`;
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
      router.push('/admin/posts');
      router.refresh();
      // Fallback opcional: ir al post público si quedó publicado.
      if (saved.published && saved.slug && publishNow) {
        // comentado intencionalmente para no romper el flujo de edición.
      }
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
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Extracto</Label>
              <Textarea
                id="excerpt"
                value={excerpt ?? ''}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                maxLength={300}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Resumen corto para listados y SEO. Máx 300 caracteres.
              </p>
            </div>
          </CardContent>
        </Card>

        <div>
          <Label>Contenido</Label>
          <div className="mt-2">
            <TiptapEditor value={content} onChange={setContent} />
          </div>
        </div>

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
              <Label htmlFor="type">Tipo</Label>
              <Select id="type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                <option value="NEWS">Noticia</option>
                <option value="ANNOUNCEMENT">Anuncio</option>
                <option value="GIVEAWAY">Sorteo</option>
                <option value="RESULT">Resultado</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="minecraft, mods, 1.20"
              />
              <p className="mt-1 text-xs text-muted-foreground">Separados por comas.</p>
            </div>

            <div>
              <Label>Imagen destacada</Label>
              <ImageUploader value={featuredImageUrl ?? ''} onChange={setFeaturedImageUrl} />
            </div>

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
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={pending} className="flex-1">
            <Save className="h-4 w-4" />
            {pending ? 'Guardando…' : 'Guardar'}
          </Button>
          {mode.kind === 'edit' && !published && (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => {
                setPublished(true);
                submit(true);
              }}
            >
              <Eye className="h-4 w-4" />
              Publicar
            </Button>
          )}
        </div>
      </aside>
    </form>
  );
}
