import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-background">
      <div className="container py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 font-bold">
            <span className="inline-block h-6 w-6 rounded bg-brand-500" />
            The Silencers
          </div>
          <p className="mt-2 text-muted-foreground">
            Hub gamer hispanohablante — guías, mods, plugins y servidores.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Explorar</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link href="/posts">Noticias</Link></li>
            <li><Link href="/recursos">Recursos</Link></li>
            <li><Link href="/servidores">Servidores</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Comunidad</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li><a href="#" target="_blank" rel="noreferrer">Discord</a></li>
            <li><a href="#" target="_blank" rel="noreferrer">Twitter / X</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Legal</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li><Link href="/about">Acerca de</Link></li>
            <li><Link href="/terminos">Términos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-surface-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} The Silencers — hecho con 💜 para la comunidad.
      </div>
    </footer>
  );
}
