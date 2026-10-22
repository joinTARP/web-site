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
