import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

export const MovingBorderGradient = ({
  children,
  containerClassName,
  borderClassName,
  duration = 8,
  className,
  rx = "50%",
  ry = "50%",
  gradientClassName = "from-purple-500 via-red-500 to-amber-500",
  animate = true,
  onClick,
}: {
  children?: React.ReactNode;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  rx?: string;
  ry?: string;
  gradientClassName?: string;
  animate?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className={cn("relative w-full h-full p-[1px] overflow-hidden", containerClassName)}
      onClick={onClick}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ rotate: 0 }}
          animate={animate ? { rotate: 360 } : undefined}
          transition={{
            duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-full h-full"
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r",
              gradientClassName
            )}
            style={{
              borderRadius: `${rx} / ${ry}`,
              width: "200%",
              height: "200%",
              top: "-50%",
              left: "-50%",
            }}
          />
        </motion.div>
      </div>
      <div
        className={cn("relative z-10 w-full h-full", className)}
      >
        {children}
      </div>
    </div>
  );
};
