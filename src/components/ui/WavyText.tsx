import React from "react";
import { motion } from "framer-motion";

interface WavyTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  replay?: boolean;
  replay_delay?: number;
}

export const WavyText = ({
  text,
  delay = 0,
  duration = 0.05,
  className = "",
  replay = false,
  replay_delay = 7,
}: WavyTextProps) => {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: duration, delayChildren: i * delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.h1
      className={className}
      style={{ display: "flex", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate={replay ? ["hidden", "visible"] : "visible"}
      transition={{
        repeat: replay ? Infinity : 0,
        repeatDelay: replay_delay,
      }}
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={child}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};
