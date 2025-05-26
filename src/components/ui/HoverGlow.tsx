import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

interface HoverGlowProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  opacity?: number;
  offset?: number;
}

export const HoverGlow = ({
  children,
  className,
  glowColor = "rgba(168, 85, 247, 0.4)",
  glowSize = 300,
  opacity = 0.15,
  offset = 20
}: HoverGlowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top } = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - left,
      y: e.clientY - top
    });
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-[50px] z-0"
        animate={{
          background: isHovered 
            ? `radial-gradient(${glowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent ${offset}%)`
            : "none",
          opacity: isHovered ? opacity : 0
        }}
        transition={{ duration: 0.15 }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};