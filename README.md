# TARP 官网

TARP 的产品首页、玩家指南和模组创作文档，正式地址为 https://jointarp.party。独立维护，使用 Astro、Tailwind CSS、React 和 Bun，构建为静态网站。

## 开发

需要 Bun 1.4.0+ 和 Node.js 22.12+，在本目录运行：

```sh
bun install --frozen-lockfile
bun run dev
```

- `bun run build`：检查并构建，产物位于 `dist/`。
- `bun run preview`：预览构建产物。
- `bun run format:check`：检查格式。

公开文档位于 `src/content/docs/`，开发日志位于 `src/content/blog/`。构建默认使用 `https://jointarp.party` 生成 canonical 和社交分享地址，可通过 `SITE_URL` 覆盖。部署配置见 [.env.example](.env.example)。

## 素材来源

智能体 SVG 来自 [Lobe Icons 1.95.1](https://github.com/lobehub/lobe-icons)，许可文本保存在 [LICENSE.txt](public/brand/agents/LICENSE.txt)。pi 图标由项目作者提供；ZCode 图标来自[官方站点](https://zcode.z.ai/favicon-192x192.png?v=20260707-transparent)。

应用图标、雾中潜伏者和夜行刃插画由图像生成工具生成。苏棠立绘与近景头像、火把和木棍同步自《后山古墓》当前模组；主持头像同步桌面端 `HostAvatar.tsx` 的白色骰子 SVG，官网副本位于 `src/components/demo/HostAvatar.tsx`。

方形应用图标保存在 `public/brand/tarp-icon.png`，浏览器标签页使用 `public/favicon.ico` 和 16、32 像素 PNG；移动设备添加到主屏幕使用 `public/apple-touch-icon.png`。更新图标时同步更新这些导出文件。横版 TARP 字标继续使用原 SVG。

## 首屏截图

首页通过 `HeroScreenshots.astro` 展示静态实机截图。将截图放入 `public/screenshots/`，在 `src/data/site.ts` 的 `heroScreenshots` 中配置 `src`；未配置时显示待补充占位。截图建议为 16:10，分别展示角色与队伍、世界与规则、冒险与对话。

桌面端 UI 更新后重新截取对应画面并替换文件，官网不维护桌面窗口的 React 副本。
