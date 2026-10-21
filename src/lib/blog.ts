import { getCollection } from 'astro:content';

export async function getPosts() {
  const posts = await getCollection(
    'blog',
    ({ data }) => import.meta.env.DEV || !data.draft,
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long' }).format(date);
