import { z } from 'astro/zod';

export const moduleSourceSchema = z.object({
  repository: z
    .string()
    .regex(/^[a-z\d][a-z\d-]{0,38}\/[\w.-]{1,100}$/i)
    .refine((value) => !/^\.+$/.test(value.split('/')[1]!)),
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

/** 官网版本仅用于下载完成后的差异提醒，导入始终取默认分支最新内容。 */
export function moduleImportUrl(repository: string, revision?: string) {
  const source = moduleSourceSchema.parse({ repository, file: 'module.toml' });
  const params = new URLSearchParams({ repository: source.repository });
  if (revision)
    params.set(
      'revision',
      catalogSchema.element.shape.revision.parse(revision),
    );
  return `tarp://import?${params}`;
}
