import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glare?: boolean;
}

export default function TiltCard({ children, className = "", glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = (x / rect.width - 0.5) * 16;
    const rotateX = (y / rect.height - 0.5) * -16;

    setStyle({ rotateX, rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.32,
    });
  };

  const handleMouseLeave = () => {
    setStyle({ rotateX: 0, rotateY: 0 });
    setGlarePos((current) => ({ ...current, opacity: 0 }));
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: style.rotateX, rotateY: style.rotateY }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.8), transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}
