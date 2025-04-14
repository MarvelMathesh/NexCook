import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const [activeItem, setActiveItem] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed bottom-10 left-1/2 z-50 mx-auto -translate-x-1/2 transform rounded-full border border-white/[0.2] bg-black p-2 px-4 backdrop-blur-md",
        className
      )}
    >
      <nav className="flex items-center justify-center gap-2">
        {navItems.map((item, index) => (
          <button
            key={index}
            className={cn(
              "relative flex cursor-pointer items-center gap-1 rounded-full p-2 text-white",
              activeItem === index ? "bg-white/[0.2]" : "hover:bg-white/[0.1]"
            )}
            onClick={() => setActiveItem(index)}
          >
            <span className="text-sm">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
    </motion.div>
  );
};