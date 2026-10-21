import assert from 'node:assert/strict';
import { test } from 'node:test';
import { satteri } from '@astrojs/markdown-satteri';
import desktopVersionPlugin from './desktop-version-plugin.mjs';

test('构建时替换标题、正文与行内版本，保留历史版本和代码块', async () => {
  const processor = satteri({
    mdastPlugins: [desktopVersionPlugin({ version: '0.2.10' })],
  });
  const renderer = await processor.createRenderer({ syntaxHighlight: false });
  const result = await renderer.render(
    [
      '## v{{desktopVersion}}',
      '',
      '**{{desktopVersion}} / {{desktopVersion}}** 与 `{{desktopVersion}}`，历史版本 v0.1.0。',
      '',
      '```text',
      '{{desktopVersion}}',
      '```',
    ].join('\n'),
  );
  assert.match(result.code, /<strong>0\.2\.10 \/ 0\.2\.10<\/strong>/);
  assert.match(result.code, /<code>0\.2\.10<\/code>/);
  assert.match(result.code, /历史版本 v0\.1\.0/);
  assert.match(result.code, /<code[^>]*>\{\{desktopVersion\}\}/);
  assert.equal(result.metadata.headings[0].text, 'v0.2.10');
  assert.equal(result.metadata.headings[0].slug, 'v0210');
});

test('历史发布正文保持原文，不跟随当前桌面版本变化', async () => {
  const processor = satteri({
    mdastPlugins: [desktopVersionPlugin({ version: '0.2.10' })],
  });
  const renderer = await processor.createRenderer({ syntaxHighlight: false });
  const result = await renderer.render(
    '版本 v0.1.1，原文占位符 `{{desktopVersion}}`。',
    {
      fileURL: new URL('file:///website/src/content/releases/0.1.1.md'),
    },
  );
  assert.match(result.code, /v0\.1\.1/);
  assert.match(result.code, /<code>\{\{desktopVersion\}\}<\/code>/);
  assert.doesNotMatch(result.code, /0\.2\.10/);
});
