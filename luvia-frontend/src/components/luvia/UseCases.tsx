import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Brain, Factory, Rocket, Zap, type LucideIcon } from "lucide-react";
import { useMemo, useRef } from "react";

import { Reveal } from "./Reveal";

const items = [
  {
    icon: Brain,
    title: "AI Model Training",
    desc: "Train and fine-tune LLMs on high-throughput distributed compute without fixed infra overhead.",
    tag: "High Throughput",
    accent: "from-[#1f7bff] via-[#2f4dff] to-[#5d2eff]",
  },
  {
    icon: Zap,
    title: "Inference Services",
    desc: "Serve realtime copilots, chat systems, and API inference with latency-aware routing.",
    tag: "Low Latency",
    accent: "from-[#00a8ff] via-[#1a6dff] to-[#3e3bff]",
  },
  {
    icon: Rocket,
    title: "AI Startups",
    desc: "Scale from MVP to growth phase using elastic capacity and deterministic pricing.",
    tag: "Elastic Scale",
    accent: "from-[#0e7fff] via-[#3f4dff] to-[#6c31ff]",
  },
  {
    icon: Factory,
    title: "Enterprises",
    desc: "Run burst workloads and mission-critical compute plans with execution guarantees.",
    tag: "Enterprise Grade",
    accent: "from-[#0f9dff] via-[#345bff] to-[#523dff]",
  },
];

type UseCaseItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
  accent: string;
};

function UseCaseStackCard({
  it,
  index,
  progress,
  imageSrc,
}: {
  it: UseCaseItem;
  index: number;
  progress: MotionValue<number>;
  imageSrc: string;
}) {
  const reverse = index % 2 === 1;
  const inStart = 0.08 + index * 0.15;
  const inEnd = inStart + 0.2;
  const settleEnd = inEnd + 0.25;

  const y = useTransform(progress, [inStart, inEnd], [72, 0]);
  const opacity = useTransform(progress, [inStart, inEnd], [0.35, 1]);
  const scale = useTransform(
    progress,
    [inStart, inEnd, settleEnd],
    [0.95, 1, 0.985],
  );
  const filter = useTransform(
    progress,
    [inStart, inEnd],
    ["blur(6px)", "blur(0px)"],
  );

  const Icon = it.icon;

  return (
    <motion.article
      className={`sticky rounded-[24px] border border-border/75 bg-[linear-gradient(145deg,hsl(240_23%_11%_/_0.97),hsl(230_36%_10%_/_0.9))] p-4 sm:p-6 shadow-[0_14px_44px_rgba(0,0,0,0.42)] will-change-transform ${
        index > 0 ? "-mt-14 sm:-mt-16" : ""
      }`}
      style={{
        top: `${88 + index * 18}px`,
        zIndex: 20 + index,
        y,
        opacity,
        scale,
        filter,
      }}
    >
      <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
        <div className={reverse ? "lg:order-2" : "lg:order-1"}>
          <div className="w-10 h-10 rounded-xl border border-primary/35 bg-primary/12 grid place-items-center">
            <Icon className="w-5 h-5 text-primary-glow" />
          </div>
          <div className="mt-4 inline-flex rounded-full px-3 py-1 border border-border/70 text-[10px] uppercase tracking-[0.16em] text-foreground/70">
            {it.tag}
          </div>
          <h3 className="mt-4 font-display font-semibold text-2xl sm:text-[1.9rem] leading-tight">
            {it.title}
          </h3>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-[52ch]">
            {it.desc}
          </p>
        </div>

        <div className={reverse ? "lg:order-1" : "lg:order-2"}>
          <div
            className={`relative h-[180px] sm:h-[220px] rounded-2xl overflow-hidden bg-gradient-to-br ${it.accent}`}
          >
            <img
              src={imageSrc}
              alt={it.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export const UseCases = () => {
  const stackRef = useRef<HTMLDivElement | null>(null);
  const randomImageSet = useMemo(() => {
    const imagePool = Array.from(
      { length: 9 },
      (_, idx) => `/images/${idx + 1}.png`,
    );
    const shuffled = [...imagePool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled.slice(0, items.length);
  }, []);

  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start 85%", "end 20%"],
  });

  return (
    <section className="py-20 sm:py-24 relative">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-2xl">
              Powering the next generation of{" "}
              <span className="text-gradient-violet">AI</span>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Layered use-case panels that stack progressively as you scroll.
            </p>
          </Reveal>

          <div ref={stackRef} className="mt-10 pb-20">
            {items.map((it, i) => (
              <UseCaseStackCard
                key={it.title}
                it={it}
                index={i}
                progress={scrollYProgress}
                imageSrc={randomImageSet[i] ?? "/images/1.png"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
