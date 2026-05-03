'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Server } from '@prisma/client';
import { Input, Label, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save } from 'lucide-react';

type Mode = { kind: 'create' } | { kind: 'edit'; server: Server };

const GAMES = [
  { value: 'MINECRAFT', label: 'Minecraft' },
  { value: 'DISCORD_BOT', label: 'Bot de Discord' },
  { value: 'GENERAL', label: 'General' },
  { value: 'OTHER', label: 'Otro' },
];

export function ServerForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const initial = mode.kind === 'edit' ? mode.server : null;
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [game, setGame] = useState(initial?.game ?? 'MINECRAFT');
  const [ip, setIp] = useState(initial?.ip ?? '');
  const [discordInvite, setDiscordInvite] = useState(initial?.discordInvite ?? '');
  const [bannerUrl, setBannerUrl] = useState(initial?.bannerUrl ?? '');
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') ?? '');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const payload: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim(),
      game,
      ip: ip.trim() || null,
      discordInvite: discordInvite.trim() || null,
      bannerUrl: bannerUrl.trim() || null,
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
    };

    startTransition(async () => {
      const url = mode.kind === 'create' ? '/api/servers' : `/api/servers/${mode.server.id}`;
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
      router.push(`/servidores/${saved.id}`);
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
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={60} />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} maxLength={1000} rows={6} placeholder="Modo de juego, reglas, eventos…" />
            </div>
            <div>
              <Label htmlFor="ip">IP / host</Label>
              <Input id="ip" value={ip ?? ''} onChange={(e) => setIp(e.target.value)} placeholder="play.miservidor.com:25565" maxLength={120} />
            </div>
            <div>
              <Label htmlFor="discord">Invitación a Discord</Label>
              <Input id="discord" type="url" value={discordInvite ?? ''} onChange={(e) => setDiscordInvite(e.target.value)} placeholder="https://discord.gg/abc123" />
            </div>
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
              <Label htmlFor="game">Juego</Label>
              <Select id="game" value={game} onChange={(e) => setGame(e.target.value as typeof game)}>
                {GAMES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="banner">Banner (URL)</Label>
              <Input id="banner" type="url" value={bannerUrl ?? ''} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="survival, pvp, 1.20" />
              <p className="mt-1 text-xs text-muted-foreground">Separados por comas.</p>
            </div>
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
