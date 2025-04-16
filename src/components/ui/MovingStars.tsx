import React, { useRef, useState, useEffect } from "react";
import { cn } from "../../utils/animations";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalRadius: number;
}

interface MovingStarsProps {
  className?: string;
  quantity?: number;
  starColor?: string;
  maxStarSize?: number;
  backgroundOpacity?: number;
}

export const MovingStars = ({
  className,
  quantity = 100,
  starColor = "#ffffff",
  maxStarSize = 2.5,
  backgroundOpacity = 0.1,
}: MovingStarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const starsRef = useRef<Star[]>([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const isMouseMovingRef = useRef(false);
  const lastMouseMoveTime = useRef(0);

  // Initialize canvas and stars
  useEffect(() => {
    const initCanvas = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const { width, height } = canvas.getBoundingClientRect();
      
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
      
      // Create stars
      starsRef.current = Array.from({ length: quantity }, () => {
        const radius = Math.random() * maxStarSize;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius,
          originalRadius: radius,
          color: starColor,
        };
      });
    };

    initCanvas();
    startAnimation();

    const handleResize = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      initCanvas();
      startAnimation();
    };

    window.addEventListener('resize', handleResize);
    
    // Set up mouse movement detection
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mousePositionRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        isMouseMovingRef.current = true;
        lastMouseMoveTime.current = Date.now();
        
        // Reset mouse moving flag after a delay
        setTimeout(() => {
          if (Date.now() - lastMouseMoveTime.current >= 100) {
            isMouseMovingRef.current = false;
          }
        }, 100);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [quantity, maxStarSize, starColor]);

  const startAnimation = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Clear canvas with semi-transparent black for trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${backgroundOpacity})`;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      
      starsRef.current.forEach((star) => {
        // Calculate distance to mouse if mouse is moving
        if (isMouseMovingRef.current) {
          const dx = mousePositionRef.current.x - star.x;
          const dy = mousePositionRef.current.y - star.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Apply attraction force if close enough to mouse
          if (distance < 120) {
            const force = 0.2;
            star.vx += (dx / distance) * force;
            star.vy += (dy / distance) * force;
            
            // Increase star size when close to mouse
            star.radius = star.originalRadius * (1 + (120 - distance) / 120);
          } else {
            // Return to original size
            star.radius = star.originalRadius;
          }
        } else {
          // Return to original size when mouse stops
          star.radius = star.originalRadius;
        }
        
        // Apply velocity limits
        star.vx = Math.max(-1, Math.min(1, star.vx));
        star.vy = Math.max(-1, Math.min(1, star.vy));
        
        // Update position
        star.x += star.vx;
        star.y += star.vy;
        
        // Wrap around edges
        if (star.x < 0) star.x = dimensions.width;
        if (star.x > dimensions.width) star.x = 0;
        if (star.y < 0) star.y = dimensions.height;
        if (star.y > dimensions.height) star.y = 0;
        
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
      });
      
      animationFrameId.current = requestAnimationFrame(render);
    };
    
    render();
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
};
