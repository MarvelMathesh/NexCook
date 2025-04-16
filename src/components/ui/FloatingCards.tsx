import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

interface FloatingCardsProps {
  items: React.ReactNode[];
  className?: string;
  containerClassName?: string;
}

export const FloatingCards = ({
  items,
  className,
  containerClassName,
}: FloatingCardsProps) => {
  return (
    <div className={cn("relative h-60 w-full md:h-80", containerClassName)}>
      {items.map((item, idx) => (
        <Card item={item} idx={idx} key={idx} className={className} />
      ))}
    </div>
  );
};

const Card = ({
  item,
  idx,
  className,
}: {
  item: React.ReactNode;
  idx: number;
  className?: string;
}) => {
  // Create different animation values based on index
  const rotations = ["3deg", "-2deg", "5deg", "-5deg", "2deg", "-3deg"];
  const translations = [
    { x: "-3%", y: "3%" },
    { x: "5%", y: "-4%" },
    { x: "-5%", y: "-2%" },
    { x: "4%", y: "5%" },
    { x: "6%", y: "-3%" },
    { x: "-6%", y: "4%" },
  ];

  // Calculate positions, scale, and z-index based on index
  const getPositionStyles = (index: number) => {
    const rotation = rotations[index % rotations.length];
    const { x, y } = translations[index % translations.length];
    
    const initialScale = 1 - index * 0.05;
    const baseOffset = 5;
    const stepOffset = 10;
    
    return {
      position: "absolute" as const,
      left: "50%",
      top: "50%",
      x: `calc(-50% + ${x})`,
      y: `calc(-50% + ${y})`,
      rotate: rotation,
      scale: initialScale,
      zIndex: 10 - index,
      opacity: index === 0 ? 1 : 0.9 - index * 0.15,
    };
  };

  return (
    <motion.div
      initial={getPositionStyles(idx)}
      animate={{
        ...getPositionStyles(idx),
        y: [
          `calc(-50% + ${translations[idx % translations.length].y})`,
          `calc(-50% + ${parseInt(translations[idx % translations.length].y as string) + 1}%)`,
          `calc(-50% + ${translations[idx % translations.length].y})`,
        ],
      }}
      transition={{
        y: {
          repeat: Infinity,
          duration: 2 + idx * 0.2,
          repeatType: "reverse",
        },
      }}
      className={cn(
        "absolute h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-lg",
        className
      )}
    >
      {item}
    </motion.div>
  );
};
