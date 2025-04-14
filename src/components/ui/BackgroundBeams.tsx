import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/animations";

export function BackgroundBeams({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  
  const beamsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (beamsRef.current) {
        const rect = beamsRef.current.getBoundingClientRect();
        setMousePosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (beamsRef.current) {
      const rect = beamsRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={beamsRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "h-screen w-full overflow-hidden [--beams-color:theme(colors.purple.500)] dark:[--beams-color:theme(colors.purple.500)]",
        className
      )}
      style={{
        backgroundColor: "transparent",
      }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent, transparent 40%, black), radial-gradient(circle at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), var(--beams-color) 0px, transparent 50%)",
          backgroundBlendMode: "lighten",
          backgroundSize: "cover",
          backgroundPosition: "center",
          "--x": mousePosition.x,
          "--y": mousePosition.y,
        } as React.CSSProperties}
      />
      {children}
    </div>
  );
}