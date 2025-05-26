import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "../../utils/animations";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, MotionProps {
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  glow?: boolean;
  isActive?: boolean;
  className?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ 
    variant = "primary", 
    size = "md", 
    rounded = true,
    glow = false,
    isActive = false,
    className, 
    children, 
    ...props 
  }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/80",
      secondary: "bg-accent text-white hover:bg-accent/80",
      ghost: "bg-transparent hover:bg-white/10",
      glass: "bg-white/5 backdrop-blur-lg hover:bg-white/10",
    };

    const sizes = {
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center justify-center transition-all duration-200",
          variants[variant],
          sizes[size],
          rounded ? "rounded-full" : "rounded-xl",
          glow && "shadow-glow",
          isActive && variant === "glass" && "bg-primary/20 text-primary",
          isActive && variant === "ghost" && "bg-primary/10 text-primary",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";