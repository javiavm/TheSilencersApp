// Abstracción de storage. Hoy usa Supabase; en Fase 2 se swap a Cloudflare R2.
import { createClient } from '@supabase/supabase-js';

export interface StorageProvider {
  upload(path: string, data: ArrayBuffer | Buffer, contentType: string): Promise<string>;
  remove(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}

const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'the-silencers';

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.');
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const storage: StorageProvider = {
  async upload(path, data, contentType) {
    const client = getServerClient();
    const body = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    const { error } = await client.storage.from(bucket).upload(path, body, {
      contentType,
      upsert: true,
    });
    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    return storage.getPublicUrl(path);
  },

  async remove(path) {
    const client = getServerClient();
    const { error } = await client.storage.from(bucket).remove([path]);
    if (error) throw new Error(`Storage remove failed: ${error.message}`);
  },

  getPublicUrl(path) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    return `${url}/storage/v1/object/public/${bucket}/${path}`;
  },
};
