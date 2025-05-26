import { HTMLAttributes } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "../../utils/animations";

export interface GlowTextProps extends HTMLAttributes<HTMLDivElement>, MotionProps {
  text: string;
  gradient?: boolean;
  glow?: boolean;
  highlightColor?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
}

export const GlowText = ({ 
  text, 
  gradient = true, 
  glow = true,
  highlightColor = "from-primary to-accent",
  as = "h2",
  size = "xl",
  className,
  ...props
}: GlowTextProps) => {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
    "5xl": "text-5xl",
  };

  const Component = motion[as];

  return (
    <Component
      className={cn(
        sizeClasses[size],
        "font-bold",
        gradient && "bg-gradient-to-r bg-clip-text text-transparent",
        gradient && highlightColor,
        glow && "text-glow",
        className
      )}
      {...props}
    >
      {text}
    </Component>
  );
};