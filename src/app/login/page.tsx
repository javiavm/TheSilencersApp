'use client';

import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function LoginPage() {
  return (
    <div className="container py-20">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Inicia sesión</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Necesitas una cuenta de Discord para publicar y subir recursos.
          </p>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg" onClick={() => signIn('discord', { callbackUrl: '/' })}>
            <LogIn className="h-4 w-4" />
            Continuar con Discord
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Al continuar aceptas nuestros Términos. Tu email no será compartido.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
