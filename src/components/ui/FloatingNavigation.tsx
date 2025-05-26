import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/animations";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface FloatingNavigationProps {
  items: NavigationItem[];
  className?: string;
  activeId?: string;
  onItemClick?: (id: string) => void;
}

export const FloatingNavigation = ({ 
  items, 
  className,
  activeId,
  onItemClick
}: FloatingNavigationProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item?.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(id);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-1 py-1",
        "glass-panel flex items-center justify-center gap-1",
        className
      )}
    >
      {items.map((item) => {
        const isActive = activeId === item.id;
        const isHovered = hoveredItem === item.id;

        return (
          <div key={item.id} className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                "relative z-10 flex h-12 items-center justify-center rounded-full px-4 text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-white" 
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.icon}
              
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="ml-2 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            
            {isActive && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute inset-0 rounded-full bg-primary/20"
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 30 
                }}
              />
            )}
          </div>
        );
      })}
    </motion.div>
  );
};