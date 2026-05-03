import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/posts', '/recursos', '/servidores', '/u', '/buscar'],
        disallow: ['/admin', '/me', '/api'],
      },
    ],
    sitemap: `${env.NEXTAUTH_URL}/sitemap.xml`,
    host: env.NEXTAUTH_URL,
  };
}
