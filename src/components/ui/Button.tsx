import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "../../utils/animations";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, MotionProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "lg" | "xl" | "2xl";
  glow?: boolean;
  isLoading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = "primary", 
    size = "md", 
    rounded = "lg",
    glow = false,
    isLoading = false,
    leadingIcon,
    trailingIcon,
    className, 
    children, 
    ...props 
  }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-primary to-primary/90 text-white hover:shadow-lg hover:shadow-primary/20",
      secondary: "bg-gradient-to-r from-accent to-accent/90 text-white hover:shadow-lg hover:shadow-accent/20",
      outline: "bg-transparent border border-white/20 hover:bg-white/5",
      ghost: "bg-transparent hover:bg-white/5",
      glass: "bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10",
    };

    const sizes = {
      sm: "py-1.5 px-3 text-sm",
      md: "py-2.5 px-5",
      lg: "py-3 px-6 text-lg",
    };

    const roundedVariants = {
      full: "rounded-full",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center justify-center font-medium transition-all duration-200",
          variants[variant],
          sizes[size],
          roundedVariants[rounded],
          glow && variant === "primary" && "shadow-glow",
          glow && variant === "secondary" && "shadow-[0_0_15px_rgba(236,72,153,0.5)]",
          isLoading && "opacity-70 cursor-not-allowed",
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!isLoading && leadingIcon && <span className="mr-2">{leadingIcon}</span>}
        {children}
        {!isLoading && trailingIcon && <span className="ml-2">{trailingIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";