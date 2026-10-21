const sloganLines = ['和 AI 一起体验', '角色扮演游戏'];
const slogan = sloganLines.join('');

export const site = {
  slogan,
  sloganLines,
  title: `TARP · AI跑团`,
  description:
    'TARP 是一款文字角色扮演智能体，由 AI 扮演主持人和队友。开源、本地运行，支持自由定义规则。',
  version: 'v0.1',
  stage: '试验性版本',
};

// 提供实机截图后，将 src 填为 public 下的图片路径，如 /screenshots/adventure.webp。
export const heroScreenshots: {
  title: string;
  alt: string;
  position: 'back' | 'front' | 'lower';
  src?: string;
}[] = [
  {
    title: '角色与队伍',
    alt: 'TARP 实机截图：角色与 AI 队友',
    position: 'back',
  },
  {
    title: '世界与规则',
    alt: 'TARP 实机截图：模组中的世界与规则',
    position: 'lower',
  },
  {
    title: '冒险与对话',
    alt: 'TARP 实机截图：与 AI 主持和队友一起跑团',
    position: 'front',
  },
];

export const moduleSearchHref =
  'https://github.com/search?q=topic%3Atarp-module&type=repositories';

export const nav = [
  { label: '文档', href: '/docs/', external: false },
  { label: '模组', href: moduleSearchHref, external: true },
  { label: '开发日志', href: '/blog/', external: false },
];

// 仅接受真实的公开源码地址，未配置时不生成无效链接。
const configuredSource = import.meta.env.PUBLIC_SOURCE_URL?.trim();
export const sourceHref =
  configuredSource && /^https:\/\//.test(configuredSource)
    ? configuredSource
    : undefined;

export const startHref = '/docs/getting-started/introduction/';

export const faqs = [
  {
    question: '没玩过跑团，也能玩吗？',
    answer:
      '可以。先连接模型、载入模组、选好角色，然后说出你想做什么，比如「我检查门锁」。AI 主持会描述场景、处理你的行动，需要检定时再掷骰。',
  },
  {
    question: '模型和语音怎么收费？',
    answer:
      '使用你自己的模型账号，费用按服务商的订阅或 API 计费方式计算。主持和 AI 队友都会调用模型，队友判断是否发言时也会产生调用。开启语音朗读后，语音服务的费用另算。',
  },
  {
    question: '存档在本地，还需要联网吗？',
    answer:
      '使用 AI 和语音服务时，通常需要联网。模组和存档保存在你的电脑上，但相关对话和资料会发给你连接的模型服务，要朗读的文字也会发给语音服务。',
  },
  {
    question: '能和朋友联机吗？',
    answer:
      '暂时不能。当前版本只支持本机游玩，你可以自己玩，也可以添加 AI 队友。',
  },
  {
    question: '能自己写模组吗？',
    answer:
      '可以。规则、人物、物品和场景都能自己定义，用的是 Markdown、JSON 或 TOML 文件。也可以搭配我们准备的模组创作 Skill，让 AI 智能体按你的设定来写。TARP 目前没有内置模组编辑器，文件需要在外部编辑。',
  },
  {
    question: '现在能下载吗？支持哪些系统？',
    answer: '安装包即将提供，发布后可从首页下载，并查看支持的系统。',
  },
  {
    question: '冒险进度会保存吗？',
    answer:
      '会。聊天、角色变化和笔记保存在本机，退出后可以从「继续冒险」接着玩。需要备份时，退出应用后复制完整的配置目录和模组源文件目录。',
  },
];

export const docsSections = [
  {
    id: 'getting-started',
    title: '快速开始',
    description: '准备应用、连接模型、载入模组和选角，开始第一局冒险。',
  },
  {
    id: 'play',
    title: '游戏指南',
    description: '行动、检定、队友，以及状态和笔记等工具。',
  },
  {
    id: 'modules',
    title: '模组创作',
    description: '文件格式、开局建卡、状态、音色与模组校验。',
  },
  { id: 'reference', title: '参考', description: '常见问题与更新记录。' },
];
