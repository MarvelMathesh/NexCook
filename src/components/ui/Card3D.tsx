import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/animations";

export const Card3D = ({
  children,
  className,
  cardClassName,
  glareClassName,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
  glareClassName?: string;
  [key: string]: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [cardX, setCardX] = useState(0);
  const [cardY, setCardY] = useState(0);
  const [glareX, setGlareX] = useState(0);
  const [glareY, setGlareY] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
      setHeight(ref.current.offsetHeight);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      
      const normalizedX = (e.clientX - rect.left) / width;
      const normalizedY = (e.clientY - rect.top) / height;
      
      setMouseX(normalizedX);
      setMouseY(normalizedY);
      
      // Card rotation values (limited to -10 to 10 degrees)
      const rotateY = 20 * (normalizedX - 0.5);
      const rotateX = -20 * (normalizedY - 0.5);
      
      setCardX(rotateX);
      setCardY(rotateY);
      
      // Glare position
      setGlareX(normalizedX * 100);
      setGlareY(normalizedY * 100);
    }
  };

  const handleMouseLeave = () => {
    // Reset card position with a smooth transition
    setCardX(0);
    setCardY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
      }}
      {...props}
    >
      <motion.div
        className={cn(
          "relative z-10 h-full w-full transition-all duration-200 ease-out",
          cardClassName
        )}
        animate={{
          rotateX: cardX,
          rotateY: cardY,
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
        }}
      >
        {children}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_80%)] opacity-0 transition-opacity duration-500",
            glareClassName
          )}
          style={{
            top: `${glareY}%`,
            left: `${glareX}%`,
            transform: "translate(-50%, -50%)",
            opacity: mouseX > 0 && mouseY > 0 ? 0.5 : 0,
          }}
        />
      </motion.div>
    </motion.div>
  );
};