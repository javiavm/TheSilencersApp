import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-brand-400">Error 404</p>
      <h1 className="mt-2 text-4xl font-extrabold">Página no encontrada</h1>
      <p className="mt-2 text-muted-foreground">La ruta que buscas no existe o fue movida.</p>
      <div className="mt-6">
        <Link href="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
