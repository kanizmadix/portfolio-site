"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  const [mounted, setMounted] = useState(false);
  const [fine, setFine] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  const dotX = useSpring(mx, { stiffness: 900, damping: 40 });
  const dotY = useSpring(my, { stiffness: 900, damping: 40 });
  const ringX = useSpring(mx, { stiffness: 140, damping: 18 });
  const ringY = useSpring(my, { stiffness: 140, damping: 18 });

  useEffect(() => {
    setMounted(true);
    setFine(window.matchMedia("(pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!fine) return;

    const move = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const hide = () => setVisible(false);
    const over = (e: MouseEvent) => {
      setHovering(!!(e.target as Element)?.closest("a, button, [data-hover]"));
    };

    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", hide);
    window.addEventListener("mouseover", over);

    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", hide);
      window.removeEventListener("mouseover", over);
    };
  }, [fine, mx, my]);

  if (!mounted || !fine) return null;

  const wrapper: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 9990,
  };
  const centered: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    transform: "translate(-50%, -50%)",
  };

  return (
    <>
      {/* Trailing ring */}
      <motion.div style={{ ...wrapper, x: ringX, y: ringY, opacity: visible ? 1 : 0 }}>
        <motion.div
          style={{ ...centered, borderRadius: "50%", border: "1px solid" }}
          animate={{
            width: hovering ? 54 : 36,
            height: hovering ? 54 : 36,
            borderColor: hovering ? "rgba(99,102,241,0.85)" : "rgba(255,255,255,0.35)",
          }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        />
      </motion.div>

      {/* Inner dot — mix-blend-difference for light-on-dark inversion */}
      <motion.div style={{ ...wrapper, x: dotX, y: dotY, opacity: visible ? 1 : 0 }}>
        <motion.div
          style={{
            ...centered,
            borderRadius: "50%",
            background: "white",
            mixBlendMode: "difference",
          }}
          animate={{ width: hovering ? 10 : 5, height: hovering ? 10 : 5 }}
          transition={{ duration: 0.15 }}
        />
      </motion.div>
    </>
  );
}
