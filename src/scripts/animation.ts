const { gsap, ScrollTrigger, SplitText } = window as unknown as {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  SplitText: typeof import('gsap/SplitText').SplitText;
};

if (!gsap || !ScrollTrigger || !SplitText) {
  document.documentElement.classList.remove('motion');
  throw new Error('动画库加载失败，已直接显示页面内容。');
}

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

// 动效只监听滚动位置，页面滚动由浏览器原生处理。
export { gsap, ScrollTrigger, SplitText };
