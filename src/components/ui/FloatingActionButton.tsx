import { ButtonHTMLAttributes } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "../../utils/animations";

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, MotionProps {
  icon: React.ReactNode;
  label?: string;
  variant?: "primary" | "secondary" | "glass";
  size?: "sm" | "md" | "lg";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "custom";
  showLabel?: boolean;
  className?: string;
}

export const FloatingActionButton = ({
  icon,
  label,
  variant = "primary",
  size = "md",
  position = "bottom-right",
  showLabel = false,
  className,
  ...props
}: FloatingActionButtonProps) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-accent text-white hover:bg-accent/90",
    glass: "glass text-white hover:bg-white/10",
  };

  const sizes = {
    sm: { button: "h-10 w-10", text: "text-xs" },
    md: { button: "h-14 w-14", text: "text-sm" },
    lg: { button: "h-16 w-16", text: "text-base" },
  };

  const positions = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
    "custom": "",
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={cn(
        "fixed z-50 flex items-center",
        position !== "custom" && positions[position],
        className
      )}
    >
      {/* Label */}
      {label && showLabel && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className={cn(
            "mr-3 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-md",
            sizes[size].text
          )}
        >
          {label}
        </motion.div>
      )}

      {/* Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center justify-center rounded-full shadow-lg",
          variants[variant],
          sizes[size].button
        )}
        {...props}
      >
        {icon}
      </motion.button>
    </motion.div>
  );
};