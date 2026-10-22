type AnimationWindow = Window & {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  SplitText: typeof import('gsap/SplitText').SplitText;
};
const animationWindow = window as unknown as AnimationWindow;

function loadScript(name: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://cdn.jsdmirror.com/npm/gsap@3.15.0/dist/${name}.min.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`动画库 ${name} 加载失败。`));
    document.head.append(script);
  });
}

// 从文档页首次进入官网时，也要先加载核心库，再加载依赖它的插件。
try {
  if (!animationWindow.gsap) await loadScript('gsap');
  await Promise.all([
    !animationWindow.ScrollTrigger && loadScript('ScrollTrigger'),
    !animationWindow.SplitText && loadScript('SplitText'),
  ]);
} catch (error) {
  document.documentElement.classList.remove('motion');
  throw error;
}
const { gsap, ScrollTrigger, SplitText } = animationWindow;

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

// 动效只监听滚动位置，页面滚动由浏览器原生处理。
export { gsap, ScrollTrigger, SplitText };

// 客户端导航不会重新执行模块，页面动效需要随路由建立并清理。
export function onPageAnimation(setup: (context: gsap.Context) => void) {
  let context: gsap.Context | undefined;
  document.addEventListener('astro:page-load', () => {
    if (!document.documentElement.hasAttribute('data-animate')) return;
    context = gsap.context((self) => setup(self), document.body);
  });
  document.addEventListener('astro:before-swap', () => {
    context?.revert();
    context = undefined;
  });
}
