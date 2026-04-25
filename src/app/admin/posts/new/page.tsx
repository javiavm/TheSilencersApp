import { PostForm } from '../_components/PostForm';

export default function NewPostPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">Nuevo post</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Redacta en rich text y publica cuando esté listo.
      </p>
      <PostForm mode={{ kind: 'create' }} />
    </>
  );
}
