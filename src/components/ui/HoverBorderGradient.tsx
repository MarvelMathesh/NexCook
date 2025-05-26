import React from "react";
import { motion } from "framer-motion";

interface HoverBorderGradientProps {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  duration?: number;
}

export const HoverBorderGradient: React.FC<HoverBorderGradientProps> = ({
  children,
  containerClassName = "",
  className = "",
  duration = 1,
}) => {
  return (
    <div className={`relative group ${containerClassName}`}>
      <motion.div
        className={`relative rounded-xl p-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 ${className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-sm"
          animate={{ rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative rounded-xl bg-black/90 backdrop-blur-sm">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
