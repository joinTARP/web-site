import { pluginFramesTexts } from '@expressive-code/plugin-frames';
import { defineEcConfig } from 'astro-expressive-code';

pluginFramesTexts.addLocale('zh', {
  terminalWindowFallbackTitle: '终端',
  copyButtonTooltip: '复制代码',
  copyButtonCopied: '已复制',
});

export default defineEcConfig({
  defaultLocale: 'zh-CN',
  themes: ['github-dark', 'github-light'],
  customizeTheme(theme) {
    theme.name = theme.type;
  },
  styleOverrides: {
    borderRadius: '0.375rem',
    codeFontFamily: 'var(--font-mono)',
    codeFontSize: '0.8125rem',
    codeLineHeight: '1.7',
    uiFontFamily: 'var(--font-sans)',
    frames: {
      frameBoxShadowCssValue: 'none',
    },
  },
});
