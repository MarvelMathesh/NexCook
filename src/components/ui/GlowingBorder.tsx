import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

export const GlowingBorder = ({
  children,
  className,
  containerClassName,
  glowClassName,
  borderClassName,
  size = "md",
  glowColor = "from-purple-500 to-pink-500",
  animate = true,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glowClassName?: string;
  borderClassName?: string;
  size?: "sm" | "md" | "lg";
  glowColor?: string;
  animate?: boolean;
}) => {
  // Size maps
  const sizeMap = {
    sm: {
      padding: "p-px",
      radius: "rounded-lg",
      glow: "blur-md",
    },
    md: {
      padding: "p-[1.5px]",
      radius: "rounded-xl",
      glow: "blur-lg",
    },
    lg: {
      padding: "p-[2px]",
      radius: "rounded-2xl",
      glow: "blur-xl",
    },
  };

  const selectedSize = sizeMap[size];

  return (
    <div className={cn("relative", containerClassName)}>
      {/* Animated gradient glow */}
      <motion.div
        initial={animate ? { rotate: 0 } : undefined}
        animate={animate ? { rotate: 360 } : undefined}
        transition={animate ? { duration: 5, repeat: Infinity, ease: "linear" } : undefined}
        className={cn(
          "absolute inset-0 -z-10",
          selectedSize.glow,
          selectedSize.radius,
          glowClassName
        )}
      >
        <div
          className={cn(
            "h-full w-full bg-gradient-to-r opacity-75",
            glowColor
          )}
        />
      </motion.div>

      {/* Border */}
      <div
        className={cn(
          "relative overflow-hidden",
          selectedSize.padding,
          selectedSize.radius,
          borderClassName
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r",
            glowColor
          )}
        />
        <div
          className={cn(
            "relative h-full w-full bg-black",
            selectedSize.radius,
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
