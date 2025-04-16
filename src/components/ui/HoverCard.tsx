import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

export const HoverCard = ({
  children,
  className,
  cardClassName,
  direction = "up",
  scale = 1.05,
  rotate = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
  direction?: "up" | "down" | "left" | "right" | "center";
  scale?: number;
  rotate?: boolean;
  onClick?: () => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Direction based hover values
  const getHoverValues = () => {
    switch (direction) {
      case "up":
        return { y: -8 };
      case "down":
        return { y: 8 };
      case "left":
        return { x: -8 };
      case "right":
        return { x: 8 };
      case "center":
        return { y: 0 };
      default:
        return { y: -8 };
    }
  };

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      <motion.div
        animate={
          isHovering
            ? {
                scale,
                ...getHoverValues(),
                rotate: rotate ? 1 : 0,
              }
            : {
                scale: 1,
                y: 0,
                x: 0,
                rotate: 0,
              }
        }
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className={cn("origin-center", cardClassName)}
      >
        {children}

        {/* Bottom shadow on hover */}
        {isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 0.3 }}
            className="absolute -bottom-4 left-0 right-0 z-[-1] mx-auto h-[10px] w-[80%] rounded-full bg-purple-500 blur-lg"
          />
        )}
      </motion.div>
    </div>
  );
};
