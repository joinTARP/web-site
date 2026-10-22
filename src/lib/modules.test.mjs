import { describe, expect, test } from 'bun:test';
import {
  moduleInfoSchema,
  moduleFileUrl,
  moduleCoverUrl,
  catalogSchema,
} from './modules';

const repository = 'joinTARP/example';
const revision = 'a'.repeat(40);

describe('模组收录', () => {
  test('只提取公开展示字段，JSON 和 TOML 使用相同结构', () => {
    const info = { name: '古墓', description: '一次冒险', tags: ['调查'] };
    expect(
      moduleInfoSchema.parse({ ...info, hostPrompt: '秘密', gameStarts: [] }),
    ).toEqual(info);
    expect(
      moduleInfoSchema.parse(
        Bun.TOML.parse(
          'name = "古墓"\ndescription = "一次冒险"\ntags = ["调查"]',
        ),
      ),
    ).toEqual(info);
    expect(() => moduleInfoSchema.parse({ name: '缺少简介' })).toThrow();
  });

  test('相对封面按相同 Git 版本解析，编码中文、空格和百分号', () => {
    expect(moduleCoverUrl(repository, revision, '图片/封面 100%.webp')).toBe(
      `https://raw.githubusercontent.com/${repository}/${revision}/module/%E5%9B%BE%E7%89%87/%E5%B0%81%E9%9D%A2%20100%25.webp`,
    );
    expect(moduleCoverUrl(repository, revision)).toBeUndefined();
    expect(
      moduleCoverUrl(repository, revision, 'https://images.example/cover.webp'),
    ).toBe('https://images.example/cover.webp');
    expect(
      moduleFileUrl(repository, 'feature/catalog', 'module.json'),
    ).toContain('/feature%2Fcatalog/module/module.json');
  });

  test('拒绝越界路径、非 HTTP 地址、凭据和非固定版本', () => {
    for (const cover of [
      '../secret.png',
      '/cover.png',
      'file:///cover.png',
      'javascript:alert(1)',
      '图片\\cover.png',
      'cover.png?x=1',
      'https://user:password@example.com/cover.png',
    ]) {
      expect(() => moduleCoverUrl(repository, revision, cover)).toThrow();
    }
    expect(() =>
      catalogSchema.parse([
        {
          repository,
          ref: 'main',
          file: 'module.json',
          revision: 'main',
          metadata: { name: '古墓', description: '冒险' },
        },
      ]),
    ).toThrow();
  });
});
