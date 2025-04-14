import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../utils/animations";

export const CardSpotlight = ({
  children,
  className,
  spotlightClassName,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  spotlightClassName?: string;
  onClick?: () => void;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  useEffect(() => {
    function handleWindowResize() {
      setTimeout(() => {
        if (!divRef.current) return;
        divRef.current.style.transition = 'none';
        setTimeout(() => {
          if (!divRef.current) return;
          divRef.current.style.transition = '';
        }, 100);
      }, 100);
    }

    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={divRef}
      className={cn(
        "group relative h-full w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black p-8",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300",
          spotlightClassName,
          isFocused ? "group-hover:opacity-100" : ""
        )}
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.1), transparent 40%)`,
          opacity,
        }}
      />
      {children}
    </div>
  );
};