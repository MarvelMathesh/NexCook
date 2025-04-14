import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/animations";

export const FlipWords = ({
  words = [],
  duration = 2000,
  className = "",
  animationClassName,
}: {
  words?: string[];
  duration?: number;
  className?: string;
  animationClassName?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <div className={cn("inline-block relative", className)}>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={words[currentIndex]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className={cn(
              "absolute left-0 right-0 text-center",
              animationClassName
            )}
          >
            {words[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* This is for spacing to ensure the container has the right height */}
      <div className="opacity-0">{words[0]}</div>
    </div>
  );
};