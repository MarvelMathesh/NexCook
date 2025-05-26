import { cn } from "../../utils/animations";

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
  shimmerColor?: string;
}

export const Shimmer = ({ 
  className, 
  children, 
  shimmerColor = "from-transparent via-white/20 to-transparent" 
}: ShimmerProps) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 z-0">
        <div className={cn(
          "h-[200%] w-[200%] animate-[shimmer_2s_infinite] bg-gradient-to-r opacity-20",
          shimmerColor
        )} 
        style={{
          backgroundSize: "100% 100%",
          backgroundPosition: "-100% 0",
          backgroundRepeat: "no-repeat",
          animation: "shimmer 2s infinite",
        }}
        />
      </div>
      {children}
    </div>
  );
};

// Add this to your global CSS or animations.ts file
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }