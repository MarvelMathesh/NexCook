import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

interface GradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "accent" | "mix";
  interactive?: boolean;
  intensity?: "low" | "medium" | "high";
  animate?: boolean;
}

export const GradientBackground = ({
  className,
  children,
  variant = "primary",
  interactive = true,
  intensity = "medium",
  animate = true
}: GradientBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  // Handle mouse movement for interactive gradient
  useEffect(() => {
    if (!interactive || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      mousePosition.current = { x, y };
      updateGradientPosition();
    };

    const updateGradientPosition = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const { x, y } = mousePosition.current;
      const { width, height } = container.getBoundingClientRect();
      
      // Convert to percentage
      const xPercent = (x / width) * 100;
      const yPercent = (y / height) * 100;
      
      // Update the CSS variable for gradient position
      container.style.setProperty('--x', `${xPercent}%`);
      container.style.setProperty('--y', `${yPercent}%`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  // Get CSS classes based on props
  const getVariantClasses = () => {
    const intensityMap = {
      low: "opacity-10",
      medium: "opacity-20",
      high: "opacity-30"
    };

    switch (variant) {
      case "primary":
        return `bg-primary ${intensityMap[intensity]}`;
      case "accent":
        return `bg-accent ${intensityMap[intensity]}`;
      case "mix":
        return `bg-gradient-to-tr from-primary/40 to-accent/40 ${intensityMap[intensity]}`;
      default:
        return `bg-primary ${intensityMap[intensity]}`;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Interactive gradient overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: interactive
            ? 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), var(--gradient-color1), transparent 70%)'
            : undefined,
          '--gradient-color1': variant === 'primary' 
            ? 'rgba(168, 85, 247, 0.4)' 
            : variant === 'accent' 
              ? 'rgba(236, 72, 153, 0.4)' 
              : 'rgba(200, 80, 200, 0.4)'
        } as React.CSSProperties}
      />

      {/* Animated blobs */}
      {animate && (
        <>
          <motion.div
            className={cn(
              "absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl",
              getVariantClasses()
            )}
            animate={{
              x: [0, 30, 0],
              y: [0, 40, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className={cn(
              "absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl",
              variant === "primary" ? "bg-accent" : "bg-primary",
              intensity === "low" ? "opacity-10" : intensity === "medium" ? "opacity-15" : "opacity-20"
            )}
            animate={{
              x: [0, -40, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};