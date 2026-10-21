import { useId } from 'react';

/** 同步桌面端 HostAvatar 的静止形态；演示无真实模型执行状态。 */
export default function HostAvatar() {
  const id = useId();
  return (
    <span className="grid size-full place-items-center" aria-hidden="true">
      <span className="block size-[88%]">
        <svg
          viewBox="0 0 100 100"
          className="block size-full drop-shadow-[0_2px_1px_#0006]"
        >
          <defs>
            <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0.85" y2="1">
              <stop offset="0" stopColor="#fffefa" />
              <stop offset="0.55" stopColor="#e8e7e3" />
              <stop offset="1" stopColor="#969793" />
            </linearGradient>
            <radialGradient id={`${id}-light`} cx="0.3" cy="0.2" r="0.85">
              <stop offset="0" stopColor="white" stopOpacity="0.65" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path
            d="M46 8 Q50 5 54 8 L85 27 Q89 29 89 34 L89 68 Q89 73 85 76 L54 94 Q50 97 46 94 L15 76 Q11 73 11 68 L11 34 Q11 29 15 27 Z"
            fill={`url(#${id}-shell)`}
            stroke="#ffffff"
            strokeOpacity="0.35"
            strokeWidth="0.7"
          />
          <path
            d="M46 8 Q50 5 54 8 L85 27 Q89 29 89 34 L89 68 Q89 73 85 76 L54 94 Q50 97 46 94 L15 76 Q11 73 11 68 L11 34 Q11 29 15 27 Z"
            fill={`url(#${id}-light)`}
          />
          <g>
            <g fill="#232522">
              <rect x="37" y="42" width="7" height="15" rx="1.4" />
              <rect x="56" y="42" width="7" height="15" rx="1.4" />
            </g>
          </g>
        </svg>
      </span>
    </span>
  );
}
