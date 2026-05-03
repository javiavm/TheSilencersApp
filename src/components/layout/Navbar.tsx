'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { LogIn, LogOut, Moon, Sun, Shield, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchBar } from './SearchBar';

export function Navbar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="inline-block h-6 w-6 rounded bg-brand-500" />
            <span>The Silencers</span>
          </Link>
          <nav className="hidden gap-5 md:flex text-sm text-muted-foreground">
            <Link href="/posts" className="hover:text-foreground">Noticias</Link>
            <Link href="/recursos" className="hover:text-foreground">Recursos</Link>
            <Link href="/servidores" className="hover:text-foreground">Servidores</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <Link href="/buscar" className="md:hidden" aria-label="Buscar">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Panel</span>
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
            className="relative"
          >
            <Sun className="h-4 w-4 scale-0 dark:scale-100 transition-transform" />
            <Moon className="absolute h-4 w-4 scale-100 dark:scale-0 transition-transform" />
          </Button>

          {status === 'loading' ? null : session?.user ? (
            <div className="flex items-center gap-2">
              <Link href="/me" className="inline-flex items-center" aria-label="Mi perfil">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? ''}
                    className="h-8 w-8 rounded-full border border-surface-border hover:border-brand-500 transition-colors"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-surface-muted border border-surface-border" />
                )}
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => signIn('discord')}>
              <LogIn className="h-4 w-4" />
              Login con Discord
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
