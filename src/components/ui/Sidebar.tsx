import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

export const Sidebar = ({
  items,
  className,
  isOpen = false,
  onClose,
}: {
  items: {
    name: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }[];
  className?: string;
  isOpen?: boolean;
  onClose: () => void;
}) => {
  const [activeItem, setActiveItem] = useState(0);

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-black/90 p-4 text-white backdrop-blur-md",
          className
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center justify-between pt-2">
            <h2 className="text-xl font-bold">NexCook</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {items.map((item, index) => (
              <button
                key={index}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg p-3 transition-colors",
                  activeItem === index
                    ? "bg-white/20 text-white"
                    : "hover:bg-white/10"
                )}
                onClick={() => {
                  setActiveItem(index);
                  if (item.onClick) item.onClick();
                }}
              >
                {item.icon && (
                  <span className="text-lg">{item.icon}</span>
                )}
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto">
            <div className="rounded-lg bg-white/5 p-4">
              <p className="text-sm text-gray-300">
                Your NexCook module is running the latest firmware version.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};