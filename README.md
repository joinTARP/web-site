# TARP 官网

[TARP 官网](https://jointarp.party)，包含产品介绍、玩家指南和模组创作文档。使用 Astro、Tailwind CSS、React 和 Bun 构建。

## 开发

需要 Bun 1.4.0+ 和 Node.js 22.12+，在本目录运行：

```sh
bun install --frozen-lockfile
bun run dev
```

- `bun run build`：检查并构建，产物位于 `dist/`。
- `bun run preview`：预览构建产物。
- `bun run format:check`：检查格式。

文档位于 `src/content/docs/`，开发日志位于 `src/content/blog/`。环境变量见 [.env.example](.env.example)。

## 素材

- 图片放在 `src/assets/`，SVG 和网站图标放在 `public/`。
- 首页截图由项目作者提供，位于 `src/assets/screenshots/`。
- JetBrains Mono 字体和 GSAP 动效库通过 [JSDMirror](https://github.com/jsdmirror/JSDMirror) 加载。

## 模组收录

模组库位于 `/modules/`。在 `src/data/modules/sources.json` 添加 GitHub 仓库的 `repository`（`作者/仓库`）、`ref`（分支或标签）和 `file`（`module.json` 或 `module.toml`）；模组固定放在仓库的 `module/` 中。可选的 `testedWith` 记录实际测试过的 TARP 版本，不填写未经验证的版本。

安装系统 Git 后运行 `bun run modules:sync`，从公开仓库解析分支或标签的提交，读取配置并生成 `src/data/modules/catalog.json`。同步只保存公开展示字段，不运行模组代码；所有来源成功后才替换快照。检查来源、素材授权和快照差异后，将来源与快照一起提交。移除来源后重新同步即可下架。

日常开发与构建读取已提交快照，不依赖外部仓库或相邻本地项目。封面直接使用源地址；模组内相对图片固定到快照记录的提交，加载失败时回退到文字封面。Git 导入填写来源分支或标签，分支的后续更新可能与收录快照不同。

运行 `bun test src/lib/modules.test.mjs` 检查展示字段提取与封面路径解析。
