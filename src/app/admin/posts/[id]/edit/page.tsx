import { notFound } from 'next/navigation';
import { findPostById } from '@/models/repositories/postRepository';
import { PostForm } from '../../_components/PostForm';

interface Props {
  params: { id: string };
}

export default async function EditPostPage({ params }: Props) {
  const post = await findPostById(params.id);
  if (!post) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold">Editar post</h1>
      <p className="text-sm text-muted-foreground mb-6">{post.title}</p>
      <PostForm mode={{ kind: 'edit', post }} />
    </>
  );
}
