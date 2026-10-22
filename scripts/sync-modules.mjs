import { format } from 'prettier';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, rename } from 'node:fs/promises';
import {
  moduleSourceSchema,
  moduleInfoSchema,
  moduleFileUrl,
  moduleCoverUrl,
  catalogSchema,
} from '../src/lib/modules.ts';

const directory = new URL('../src/data/modules/', import.meta.url);
const sources = moduleSourceSchema
  .array()
  .parse(
    JSON.parse(await readFile(new URL('sources.json', directory), 'utf8')),
  );
const repositories = new Set();

async function fetchSource(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'TARP-module-catalog' },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`读取失败（${response.status}）：${url}`);
  return response;
}

const run = promisify(execFile);
const modules = [];
for (const source of sources) {
  if (repositories.has(source.repository.toLowerCase()))
    throw new Error(`重复收录：${source.repository}`);
  repositories.add(source.repository.toLowerCase());
  const { stdout } = await run(
    'git',
    [
      'ls-remote',
      '--exit-code',
      `https://github.com/${source.repository}.git`,
      `refs/heads/${source.ref}`,
      `refs/tags/${source.ref}`,
      `refs/tags/${source.ref}^{}`,
    ],
    { timeout: 30_000 },
  );
  const refs = new Map(
    stdout
      .trim()
      .split('\n')
      .map((line) => {
        const [sha, ref] = line.split('\t');
        return [ref, sha];
      }),
  );
  const resolved =
    refs.get(`refs/heads/${source.ref}`) ??
    refs.get(`refs/tags/${source.ref}^{}`) ??
    refs.get(`refs/tags/${source.ref}`);
  const revision = catalogSchema.element.shape.revision.parse(resolved);
  const content = await (
    await fetchSource(moduleFileUrl(source.repository, revision, source.file))
  ).text();
  const metadata = moduleInfoSchema.parse(
    source.file.endsWith('.toml')
      ? Bun.TOML.parse(content)
      : JSON.parse(content),
  );
  moduleCoverUrl(source.repository, revision, metadata.cover);
  modules.push({ ...source, revision, metadata });
  console.log(`已读取：${metadata.name}（${revision.slice(0, 7)}）`);
}

// 全部来源成功后再替换快照，失败时保留已收录的数据。
const output = new URL('catalog.json', directory);
const temporary = new URL('catalog.json.tmp', directory);
await writeFile(
  temporary,
  await format(JSON.stringify(catalogSchema.parse(modules)), {
    parser: 'json',
  }),
);
await rename(temporary, output);
console.log(`已同步 ${modules.length} 个模组，请检查差异后提交。`);
