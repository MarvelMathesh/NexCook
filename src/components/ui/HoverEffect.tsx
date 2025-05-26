import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from "../../utils/animations";

interface HoverEffectProps {
  children: React.ReactNode;
  className?: string;
  spotlightSize?: number;
}

export const HoverEffect = ({
  children,
  className,
  spotlightSize = 400,
}: HoverEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    setPosition({ x, y });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle ${spotlightSize}px at ${position.x}px ${position.y}px, rgba(168, 85, 247, 0.15), transparent 80%)`,
          opacity,
        }}
      />
      {children}
    </motion.div>
  );
};