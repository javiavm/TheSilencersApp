import { z } from 'zod';
import { PostType } from '@prisma/client';

const postTypeEnum = z.nativeEnum(PostType);

// Whitelist de nodos Tiptap permitidos. Defensa en profundidad: el render
// vuelve a sanitizar con DOMPurify, pero validamos input también.
const ALLOWED_NODE_TYPES = new Set([
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
]);
const ALLOWED_MARKS = new Set(['bold', 'italic', 'strike', 'code', 'link']);

type TiptapNode = {
  type: string;
  content?: TiptapNode[];
  marks?: Array<{ type: string }>;
  text?: string;
  attrs?: Record<string, unknown>;
};

const tiptapNode: z.ZodType<TiptapNode> = z.lazy(() =>
  z
    .object({
      type: z.string(),
      content: z.array(tiptapNode).optional(),
      marks: z.array(z.object({ type: z.string() }).passthrough()).optional(),
      text: z.string().optional(),
      attrs: z.record(z.unknown()).optional(),
    })
    .passthrough()
    .refine((n) => ALLOWED_NODE_TYPES.has(n.type), { message: 'Nodo Tiptap no permitido.' })
    .refine(
      (n) => !n.marks || n.marks.every((m) => ALLOWED_MARKS.has(m.type)),
      { message: 'Marca Tiptap no permitida.' },
    ),
);

const tiptapDoc = z
  .object({
    type: z.literal('doc'),
    content: z.array(tiptapNode).optional(),
  })
  .passthrough();

export const postCreateSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres.').max(200),
  excerpt: z.string().max(300).optional().nullable(),
  type: postTypeEnum.default(PostType.NEWS),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  featuredImageUrl: z.string().url().optional().nullable(),
  content: tiptapDoc,
  published: z.boolean().default(false),
});

export const postUpdateSchema = postCreateSchema.partial();

export const postListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  type: postTypeEnum.optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
  published: z.enum(['true', 'false', 'all']).default('true'),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
