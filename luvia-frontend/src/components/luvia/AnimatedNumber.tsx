import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  format?: boolean;
}

export const AnimatedNumber = ({ value, duration = 1800, prefix = "", suffix = "", decimals = 0, format = true }: Props) => {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(value * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, duration]);

  const display = format
    ? n.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
    : n.toFixed(decimals);

  return <span ref={ref} className="tabular-nums">{prefix}{display}{suffix}</span>;
};
