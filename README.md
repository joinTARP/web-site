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

首页明暗主题真机图位于 `src/assets/screenshots/adventure-desktop-light.png` 和 `src/assets/screenshots/adventure-desktop-dark.png`，来源为项目作者提供的 2026-10-21 桌面端截图，以质量 70、最大宽度 1920 像素生成响应式 WebP；首屏只加载当前主题的截图，切换主题后再加载对应图片。

内容图片统一放在 `src/assets/`，通过 `astro:assets` 在构建时生成 WebP 与响应式尺寸；SVG 和网站图标保留在 `public/`。

桌面发布版本统一维护在 `src/data/site.ts` 的 `desktopVersion`，下载链接和页面版本展示均由它派生；Markdown 正文、标题与行内代码通过 `{{desktopVersion}}` 引用，构建时替换。历史发布记录、CLI 与模组示例保留各自的明确版本号，不跟随桌面版本变化。正式桌面 Release 公开后，由桌面仓库工作流自动提交该变量的更新。

每个正式桌面版本单独保存为 `src/content/releases/<版本号>.md`，正文来自 GitHub Release，元数据包含 `version`、`date` 和 `source`。正式版本发布或编辑后，同步工作流只读取和创建或更新该版本文件，不遍历或自动补齐历史版本，已有版本可在桌面仓库 Actions 中按标签手动同步；仅在发布版本更高时连同 `desktopVersion` 一起提交，编辑旧版说明不会降级下载版本。更新记录入口 `/docs/reference/changelog/` 按版本从新到旧展示列表，详情位于 `/releases/<版本号>/`。发布正文不替换当前版本占位符，历史说明保持各自版本；无正文时显示未填写说明。
