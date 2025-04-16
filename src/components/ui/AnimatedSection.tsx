import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "../../utils/animations";

type AnimationDirection = "up" | "down" | "left" | "right" | "none";

export const AnimatedSection = ({
  children,
  direction = "up",
  delay = 0,
  className,
  once = true,
  duration = 0.8,
  threshold = 0.2,
}: {
  children: React.ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  className?: string;
  once?: boolean;
  duration?: number;
  threshold?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, threshold });

  // Configure animation based on direction
  const getAnimationVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -30 },
          visible: { opacity: 1, y: 0 },
        };
      case "left":
        return {
          hidden: { opacity: 0, x: 30 },
          visible: { opacity: 1, x: 0 },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0 },
        };
      case "none":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 },
        };
      default:
        return {
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ 
        duration, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
