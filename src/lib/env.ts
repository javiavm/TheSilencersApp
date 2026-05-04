// Validación de variables de entorno al boot. Falla rápido si falta algo crítico.
import { z } from 'zod';

const isProd = process.env.NODE_ENV === 'production';

const requiredInProd = (msg: string) =>
  z.string().min(1, msg).refine((v) => !isProd || v.length > 0, msg);

// Postgres connection strings con caracteres especiales en el password no
// pasan z.string().url() — validamos con startsWith en lugar de URL parser.
const postgresUrl = z
  .string()
  .min(20, 'DATABASE_URL es muy corta o está vacía.')
  .refine(
    (v) => v.startsWith('postgresql://') || v.startsWith('postgres://'),
    'DATABASE_URL debe empezar con postgresql:// o postgres://',
  );

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: postgresUrl,

  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: requiredInProd('NEXTAUTH_SECRET es obligatorio en producción.'),

  DISCORD_CLIENT_ID: requiredInProd('DISCORD_CLIENT_ID es obligatorio en producción.'),
  DISCORD_CLIENT_SECRET: requiredInProd('DISCORD_CLIENT_SECRET es obligatorio en producción.'),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().default(''),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default('the-silencers'),

  SEED_ADMIN_DISCORD_ID: z.string().optional().default(''),
  SEED_ADMIN_USERNAME: z.string().optional().default('admin'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // Solo abortamos en build/runtime de producción; en dev mostramos warning.
  console.error('[env] variables inválidas:', parsed.error.flatten().fieldErrors);
  if (isProd) throw new Error('Configuración de entorno inválida.');
}

export const env = parsed.success ? parsed.data : (process.env as unknown as z.infer<typeof schema>);
