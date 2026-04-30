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
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = n;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(from + (to - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const display = format
    ? n.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })
    : n.toFixed(decimals);

  return <span ref={ref} className="tabular-nums">{prefix}{display}{suffix}</span>;
};
