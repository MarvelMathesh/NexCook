import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/animations";

export const SparklesCore = ({ 
  id,
  className,
  background,
  minSize = 0.4,
  maxSize = 1,
  speed = 0.3,
  particleColor = "#FFF",
  particleDensity = 100
}: { 
  id: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [particles, setParticles] = useState<any[]>([]);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Get canvas and context
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    setContext(ctx);
    
    // Set dimensions
    const observeResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    };
    
    observeResize();
    window.addEventListener("resize", observeResize);
    
    return () => {
      window.removeEventListener("resize", observeResize);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    if (!context || dimensions.width === 0 || dimensions.height === 0) return;
    
    // Initialize particles
    const initParticles = () => {
      const newParticles = [];
      const { width, height } = dimensions;
      
      for (let i = 0; i < particleDensity; i++) {
        const particle = {
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: Math.random() * speed - speed / 2,
          speedY: Math.random() * speed - speed / 2
        };
        newParticles.push(particle);
      }
      
      setParticles(newParticles);
    };
    
    initParticles();
  }, [context, dimensions, minSize, maxSize, speed, particleDensity]);

  useEffect(() => {
    if (!context || particles.length === 0) return;
    
    // Animation function
    const animate = () => {
      context.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw each particle
      particles.forEach((particle, i) => {
        context.fillStyle = particleColor;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = dimensions.width;
        if (particle.x > dimensions.width) particle.x = 0;
        if (particle.y < 0) particle.y = dimensions.height;
        if (particle.y > dimensions.height) particle.y = 0;
        
        particles[i] = particle;
      });
      
      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    };
    
    animate();
    
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [context, particles, dimensions, particleColor]);

  return (
    <div className={cn("w-full h-full", className)}>
      <canvas
        id={id}
        ref={canvasRef}
        className="block w-full h-full"
        style={{
          background: background || "transparent"
        }}
      />
    </div>
  );
};

export function Sparkles({ id, className, children }: {
  id: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative w-full h-full", className)}>
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id={id}
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleColor="#FFFFFF"
          particleDensity={100}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}