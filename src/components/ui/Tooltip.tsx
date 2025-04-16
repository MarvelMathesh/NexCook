import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/animations";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  delay?: number;
}

export const Tooltip = ({
  children,
  content,
  position = "top",
  className,
  delay = 0.2
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const handleMouseEnter = () => {
    setIsMounted(true);
    timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
    setTimeout(() => {
      setIsMounted(false);
    }, 300);
  };

  const getPositionStyles = () => {
    switch (position) {
      case "bottom":
        return { top: "calc(100% + 5px)", left: "50%", translateX: "-50%" };
      case "left":
        return { right: "calc(100% + 5px)", top: "50%", translateY: "-50%" };
      case "right":
        return { left: "calc(100% + 5px)", top: "50%", translateY: "-50%" };
      case "top":
      default:
        return { bottom: "calc(100% + 5px)", left: "50%", translateX: "-50%" };
    }
  };

  const getInitialPosition = () => {
    switch (position) {
      case "bottom":
        return { y: -5, x: 0, opacity: 0 };
      case "left":
        return { x: 5, y: 0, opacity: 0 };
      case "right":
        return { x: -5, y: 0, opacity: 0 };
      case "top":
      default:
        return { y: 5, x: 0, opacity: 0 };
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isMounted && (
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={getInitialPosition()}
              animate={{ x: 0, y: 0, opacity: 1 }}
              exit={{ ...getInitialPosition(), opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute z-50 max-w-xs whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm",
                className
              )}
              style={{
                ...getPositionStyles(),
                transform: `translate(${position === "left" || position === "right" ? "0" : "-50%"}, ${position === "top" || position === "bottom" ? "0" : "-50%"})`,
              }}
            >
              {content}
              <div
                className={cn(
                  "absolute h-2 w-2 rotate-45 bg-black/90",
                  position === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
                  position === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
                  position === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
                  position === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
