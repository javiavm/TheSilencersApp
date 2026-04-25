import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import DOMPurify from 'isomorphic-dompurify';

export function RichTextRenderer({ doc }: { doc: unknown }) {
  if (!doc || typeof doc !== 'object') return null;

  let html = '';
  try {
    html = generateHTML(doc as Parameters<typeof generateHTML>[0], [StarterKit]);
  } catch (err) {
    console.error('[RichTextRenderer] generateHTML failed', err);
    return <p className="text-muted-foreground">No se pudo renderizar el contenido.</p>;
  }

  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  return (
    <article
      className="prose-silencers"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
