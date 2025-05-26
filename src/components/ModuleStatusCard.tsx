import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { cn } from "../utils/animations";
import { Module } from "../types";
import { GlassCard } from "./ui/GlassCard";
import { IconButton } from "./ui/IconButton";

interface ModuleStatusCardProps {
  module: Module;
  onRefill: (moduleId: string) => void;
  isRefilling: boolean;
  moduleIcon: React.ReactNode;
}

export const ModuleStatusCard = ({ 
  module, 
  onRefill, 
  isRefilling,
  moduleIcon
}: ModuleStatusCardProps) => {
  // Calculate percentage for progress bar
  const progressPercentage = (module.currentLevel / module.maxLevel) * 100;
  
  // Determine status colors
  const getStatusColor = () => {
    switch (module.status) {
      case "critical":
        return "from-red-500 to-red-600";
      case "warning":
        return "from-amber-500 to-amber-600";
      default:
        return "from-green-500 to-green-600";
    }
  };
  
  const getStatusText = () => {
    switch (module.status) {
      case "critical":
        return { text: "Empty", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> };
      case "warning":
        return { text: "Low", icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> };
      default:
        return { text: "Normal", icon: <CheckCircle className="h-4 w-4 text-green-500" /> };
    }
  };
  
  const status = getStatusText();

  return (
    <GlassCard
      variant={module.status === "critical" ? "highlight" : "default"}
      className={cn(
        "overflow-hidden transition-all duration-300",
        module.status === "critical" && "border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
      )}
    >
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              {moduleIcon}
            </div>
            <div>
              <h3 className="font-medium">{module.name}</h3>
              <div className="flex items-center gap-1 text-xs text-white/60">
                {status.icon}
                <span>{status.text}</span>
              </div>
            </div>
          </div>
          
          {(module.status === "critical" || module.status === "warning") && (
            <IconButton
              onClick={() => onRefill(module.id)}
              disabled={isRefilling}
              variant="glass"
              className={module.status === "critical" ? "bg-red-500/20" : ""}
            >
              <RefreshCw 
                size={16} 
                className={isRefilling ? "animate-spin" : ""} 
              />
            </IconButton>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className={cn(
                "h-full rounded-full bg-gradient-to-r",
                getStatusColor()
              )}
            />
          </div>
          
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-white/60">
              {module.currentLevel} / {module.maxLevel} {module.unit}
            </span>
            <span className={cn(
              module.status === "critical" && "text-red-400",
              module.status === "warning" && "text-amber-400",
              module.status === "normal" && "text-green-400"
            )}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};