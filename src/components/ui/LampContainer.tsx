import React, { useRef, useState, useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";

export const LampContainer = ({
  children,
  className = "",
  width = "full",
  height = "full",
}: {
  children: React.ReactNode;
  className?: string;
  width?: string;
  height?: string;
}) => {
  const lampRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const translateX = useMotionValue(0);
  const translateY = useMotionValue(0);
  const opacity = useMotionValue(0);

  useEffect(() => {
    opacity.set(1);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lampRef.current) {
      const rect = lampRef.current.getBoundingClientRect();
      const newPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setMousePosition(newPosition);

      // Normalize position (0 to 1)
      const normalizedX = newPosition.x / rect.width;
      const normalizedY = newPosition.y / rect.height;

      // Convert to -20 to 20 range
      const moveX = (normalizedX - 0.5) * 40;
      const moveY = (normalizedY - 0.5) * 40;

      translateX.set(moveX);
      translateY.set(moveY);
    }
  };

  return (
    <motion.div
      ref={lampRef}
      onMouseMove={handleMouseMove}
      className={`relative flex w-${width} h-${height} items-center justify-center ${className}`}
      animate={controls}
    >
      <div className="relative z-0 flex items-center justify-center">
        <motion.div
          style={{
            width: 200,
            height: 200,
            background: `radial-gradient(circle at center, rgba(168, 85, 247, 0.6) 0%, transparent 80%)`,
            borderRadius: "50%",
            position: "absolute",
            x: translateX,
            y: translateY,
            opacity,
          }}
        />

        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
};
