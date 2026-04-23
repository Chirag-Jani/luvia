import { useEffect, useState } from "react";

interface CountdownProps {
  endDate: Date;
  compact?: boolean;
}

const calc = (end: Date) => {
  const diff = Math.max(0, end.getTime() - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
};

export const Countdown = ({ endDate, compact }: CountdownProps) => {
  const [t, setT] = useState(() => calc(endDate));
  useEffect(() => {
    const id = setInterval(() => setT(calc(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const items = [
    { label: "Days", value: t.d },
    { label: "Hours", value: t.h },
    { label: "Minutes", value: t.m },
    { label: "Seconds", value: t.s },
  ];

  return (
    <div className={`grid grid-cols-4 gap-2 sm:gap-3 ${compact ? "max-w-md" : "max-w-lg"}`}>
      {items.map((it) => (
        <div
          key={it.label}
          className={`glass-card text-center relative overflow-hidden ${
            compact ? "py-2 sm:py-2.5 px-1.5" : "py-3 sm:py-4 px-2"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-violet-cyan opacity-[0.04]" />
          <div
            className={`relative font-display font-bold tabular-nums text-gradient ${
              compact ? "text-lg sm:text-xl md:text-[1.45rem]" : "text-2xl sm:text-3xl md:text-4xl"
            }`}
          >
            {String(it.value).padStart(2, "0")}
          </div>
          <div
            className={`relative uppercase tracking-widest text-muted-foreground ${
              compact ? "text-[8px] sm:text-[9px] mt-0.5" : "text-[10px] sm:text-xs mt-1"
            }`}
          >
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
};
