'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Heading3,
  Undo2,
  Redo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: unknown;
  onChange: (doc: unknown) => void;
  placeholder?: string;
}

export function TiptapEditor({ value, onChange, placeholder = 'Escribe aquí…' }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: (value as NonNullable<Parameters<typeof useEditor>[0]>['content']) ?? '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose-silencers min-h-[360px] rounded-b-md border border-t-0 border-surface-border bg-surface p-4 focus:outline-none',
        'data-placeholder': placeholder,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor || !value) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value);
    if (current !== next) editor.commands.setContent(value as never, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, JSON.stringify(value)]);

  if (!editor) return null;

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  const btn = (active: boolean) =>
    cn(
      'h-8 w-8 inline-flex items-center justify-center rounded hover:bg-surface-muted text-muted-foreground',
      active && 'bg-brand-500/15 text-brand-300',
    );

  return (
    <div className="flex items-center gap-1 rounded-t-md border border-surface-border bg-surface-muted p-1">
      <button type="button" className={btn(editor.isActive('bold'))}
        onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Negrita">
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive('italic'))}
        onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Cursiva">
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive('strike'))}
        onClick={() => editor.chain().focus().toggleStrike().run()} aria-label="Tachado">
        <Strikethrough className="h-4 w-4" />
      </button>
      <Divider />
      <button type="button" className={btn(editor.isActive('heading', { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="H2">
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive('heading', { level: 3 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="H3">
        <Heading3 className="h-4 w-4" />
      </button>
      <Divider />
      <button type="button" className={btn(editor.isActive('bulletList'))}
        onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Lista">
        <List className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive('orderedList'))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Lista ordenada">
        <ListOrdered className="h-4 w-4" />
      </button>
      <button type="button" className={btn(editor.isActive('blockquote'))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()} aria-label="Cita">
        <Quote className="h-4 w-4" />
      </button>
      <Divider />
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()}
        aria-label="Deshacer">
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()}
        aria-label="Rehacer">
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}

const Divider = () => <div className="mx-1 h-6 w-px bg-surface-border" />;
