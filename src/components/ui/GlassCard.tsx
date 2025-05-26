import { HTMLAttributes, forwardRef } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "../../utils/animations";

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement>, MotionProps {
  variant?: "default" | "highlight" | "dark";
  hover?: boolean;
  glint?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    variant = "default", 
    hover = true,
    glint = true,
    className, 
    children,
    ...props 
  }, ref) => {
    const variants = {
      default: "bg-white/5 border-white/10",
      highlight: "bg-primary/5 border-primary/20",
      dark: "bg-black/60 border-white/5",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-md",
          variants[variant],
          className
        )}
        {...props}
      >
        {/* Background glint effect */}
        {glint && (
          <motion.div 
            className="absolute inset-0 bg-glass-shine opacity-20"
            animate={{
              x: ["0%", "100%"],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";