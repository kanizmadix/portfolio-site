"use client";
import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        // lerp 0.08 = heavy, weighted deceleration (Noomo/agency feel)
        // Default is 0.1; lower = more smoothing
        lerp: 0.08,
        duration: 1.4,
        smoothWheel: true,
        anchors: true,
        wheelMultiplier: 0.88,
        touchMultiplier: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      {children}
    </ReactLenis>
  );
}
