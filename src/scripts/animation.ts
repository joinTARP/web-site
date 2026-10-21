import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

// 动效只监听滚动位置，页面滚动由浏览器原生处理。
export { gsap, ScrollTrigger, SplitText };
