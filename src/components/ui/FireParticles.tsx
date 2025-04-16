import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/animations";

interface FireParticle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  opacity: number;
  blur: number;
  path: number;
}

interface FireParticlesProps {
  quantity?: number;
  intensity?: number;
  className?: string;
  globalEffect?: boolean;
  localEffect?: boolean;
  colors?: string[];
}

export const FireParticles = ({ 
  quantity = 20,
  intensity = 1,
  className = "",
  globalEffect = false,
  localEffect = false,
  colors
}: FireParticlesProps) => {
  const [particles, setParticles] = useState<FireParticle[]>([]);
  
  // Generate new particles
  useEffect(() => {
    // Fire colors from orange/red to yellow
    const fireColors = colors || (globalEffect ? 
      [
        "bg-orange-500/30", 
        "bg-red-500/20", 
        "bg-amber-400/25",
        "bg-yellow-300/20",
        "bg-red-600/30" 
      ] : [
        "bg-orange-500/80", 
        "bg-red-500/60", 
        "bg-amber-400/70",
        "bg-yellow-300/50",
        "bg-red-600/60"
      ]);
    
    // Generate particles with randomized properties
    const newParticles = Array.from({ length: quantity }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // Random horizontal position (%)
      size: Math.random() * (globalEffect ? 15 : 8) + (globalEffect ? 5 : 2), // Random size
      duration: Math.random() * 3 + (globalEffect ? 4 : 2), // Random duration 
      delay: Math.random() * (globalEffect ? 8 : 4), // Random delay
      color: fireColors[Math.floor(Math.random() * fireColors.length)],
      opacity: Math.random() * 0.6 + 0.4, // Random opacity
      blur: Math.floor(Math.random() * 3), // Random blur amount
      path: Math.floor(Math.random() * 3) // Different path patterns
    }));
    
    setParticles(newParticles);
  }, [quantity, globalEffect, localEffect, colors]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <AnimatePresence>
        {particles.map((particle) => {
          // Define different path patterns for variety
          const getAnimationPath = () => {
            switch(particle.path) {
              case 0: // Slightly curved path
                return { 
                  y: [0, -100, -200], 
                  x: [0, particle.x > 50 ? 20 : -20, 0] 
                };
              case 1: // Straight up
                return { 
                  y: [0, -150, -300], 
                  x: [0, 0, 0] 
                };
              case 2: // S-curve
                return { 
                  y: [0, -100, -200, -300], 
                  x: [0, 15, -15, 0] 
                };
              default:
                return { y: [0, -200], x: [0, 0] };
            }
          };

          return (
            <motion.div
              key={particle.id}
              className={`absolute rounded-full ${particle.color}`}
              style={{
                left: `${particle.x}%`,
                bottom: globalEffect ? "-2%" : "5%",
                width: `${particle.size * (intensity || 1)}px`,
                height: `${particle.size * (intensity || 1)}px`,
                filter: `blur(${particle.blur}px)`,
                opacity: particle.opacity * (intensity || 1),
              }}
              initial={{ 
                scale: 0.5,
                opacity: 0,
              }}
              animate={{ 
                ...getAnimationPath(),
                scale: [0.5, 1, 0.5],
                opacity: [0, particle.opacity * (intensity || 1), 0],
              }}
              transition={{ 
                duration: particle.duration,
                delay: particle.delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
