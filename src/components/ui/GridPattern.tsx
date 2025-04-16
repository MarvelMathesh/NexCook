import React, { useEffect, useRef } from "react";
import { cn } from "../../utils/animations";

export function GridPattern({
  width = 100,
  height = 100,
  x = 0,
  y = 0,
  squared = true,
  className,
}: {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squared?: boolean;
  className?: string;
}) {
  const gridPattern = useRef<SVGPatternElement | null>(null);
  const gridContainer = useRef<SVGRectElement | null>(null);

  // Add subtle animation to the grid pattern
  useEffect(() => {
    if (!gridPattern.current || !gridContainer.current) return;

    // Create a slow animation effect
    const interval = setInterval(() => {
      const currentX = parseFloat(gridPattern.current?.getAttribute("x") || "0");
      const currentY = parseFloat(gridPattern.current?.getAttribute("y") || "0");

      const newX = currentX + 0.05 > 1 ? 0 : currentX + 0.05;
      const newY = currentY + 0.05 > 1 ? 0 : currentY + 0.05;

      gridPattern.current?.setAttribute("x", newX.toString());
      gridPattern.current?.setAttribute("y", newY.toString());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg
      className={cn("absolute inset-0 h-full w-full", className)}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${x} ${y})`}
          ref={gridPattern}
        >
          {squared ? (
            <path
              d={`M${height}.5 0.5 L${height}.5 ${width}.5 L0.5 ${width}.5`}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeLinecap="round"
            />
          ) : (
            <rect width="100%" height="100%" fill="none" stroke="rgba(255,255,255,0.08)" />
          )}
        </pattern>
      </defs>
      <rect
        ref={gridContainer}
        width="100%"
        height="100%"
        fill="url(#grid-pattern)"
      />
    </svg>
  );
}
