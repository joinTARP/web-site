import { z } from 'astro/zod';

export const moduleSourceSchema = z.object({
  repository: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  ref: z.string().trim().min(1),
  file: z.enum(['module.json', 'module.toml']),
  testedWith: z.string().trim().min(1).optional(),
});

const text = z.string().trim().min(1);
export const moduleInfoSchema = z.object({
  name: text,
  description: text,
  cover: text.optional(),
  system: text.optional(),
  author: text.optional(),
  version: text.optional(),
  tags: z.array(text).default([]),
});

export const catalogSchema = z.array(
  moduleSourceSchema.extend({
    revision: z.string().regex(/^[a-f0-9]{40}$/),
    metadata: moduleInfoSchema,
  }),
);

export function moduleFileUrl(
  repository: string,
  revision: string,
  path: string,
) {
  if (
    path.split('/').some((part) => !part || part === '.' || part === '..') ||
    /[\\?#:]/.test(path)
  ) {
    throw new Error(`模组文件路径无效：${path}`);
  }
  return `https://raw.githubusercontent.com/${repository}/${encodeURIComponent(revision)}/module/${path.split('/').map(encodeURIComponent).join('/')}`;
}

export function moduleCoverUrl(
  repository: string,
  revision: string,
  cover?: string,
) {
  if (!cover) return undefined;
  if (/^https?:\/\//i.test(cover)) {
    const url = new URL(cover);
    if (url.username || url.password) throw new Error('封面地址不能包含凭据');
    return url.href;
  }
  return moduleFileUrl(repository, revision, cover);
}
