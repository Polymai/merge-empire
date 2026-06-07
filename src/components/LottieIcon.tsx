import { useEffect, useMemo, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import type { LottieIconKind } from "../types/game";
import { createLottieIconData } from "../game/lottieIcons";

type LottieIconProps = {
  kind: LottieIconKind;
  className?: string;
};

export function LottieIcon({ kind, className = "" }: LottieIconProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const animationData = useMemo(() => createLottieIconData(kind), [kind]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let disposed = false;
    let animation: AnimationItem | null = null;
    const reducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed) return;
      animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: !reducedMotion,
        animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid meet",
          progressiveLoad: false,
        },
      });
      animation.setSpeed(0.78);
      if (reducedMotion) animation.goToAndStop(0, true);
    });
    return () => {
      disposed = true;
      animation?.destroy();
    };
  }, [animationData]);

  return <span ref={containerRef} className={["lottie-icon", className].filter(Boolean).join(" ")} aria-hidden="true" />;
}
