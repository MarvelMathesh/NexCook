import { forwardRef, HTMLAttributes } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "../../utils/animations";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement>, MotionProps {
  variant?: "default" | "light" | "dark";
  glow?: boolean;
  noBlur?: boolean;
  border?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ 
    variant = "default", 
    glow = false, 
    noBlur = false, 
    border = true,
    className, 
    children, 
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "light":
          return "bg-white/10";
        case "dark":
          return "bg-black/60";
        default:
          return "bg-white/[0.03]";
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl",
          getVariantClasses(),
          border && "border border-white/10",
          !noBlur && "backdrop-blur-md backdrop-saturate-150",
          glow && "shadow-glow",
          className
        )}
        {...props}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-glass-shine opacity-30" />
        
        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";