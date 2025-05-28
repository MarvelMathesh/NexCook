import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, AlertCircle, Check, CoffeeIcon, Droplets, Flame, RefreshCw, 
  Soup, Utensils, AlertTriangle, Cloud, Zap, Scissors 
} from "lucide-react";
import { useAppStore } from "../store";
import { Sidebar } from "./ui/Sidebar";
import { initialModules } from "../store/initialData";

export const ModuleStatusPanel = () => {
  const { modules, updateModuleLevel } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [refilling, setRefilling] = useState<string | null>(null);
  const [isRefillAllActive, setIsRefillAllActive] = useState(false);

  // Check if any module is in critical state (empty)
  const hasCriticalModule = modules.some(module => module.status === "critical");

  // Auto-show the panel when a module is critical
  useEffect(() => {
    if (hasCriticalModule) {
      setShowMonitor(true);
    }
  }, [hasCriticalModule]);
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Droplets":
        return <Droplets size={18} />;
      case "Utensils":
        return <Utensils size={18} />;
      case "Soup":
        return <Soup size={18} />;
      case "CoffeeIcon":
        return <CoffeeIcon size={18} />;
      case "Flame":
        return <Flame size={18} />;
      case "Cloud":
        return <Cloud size={18} />;
      case "Zap":
        return <Zap size={18} />;
      case "Scissors":
        return <Scissors size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMonitor = () => {
    setShowMonitor(!showMonitor);
  };

  const handleRefill = (moduleId: string) => {
    setRefilling(moduleId);
    const initialModule = initialModules.find(m => m.id === moduleId);
    const currentModule = modules.find(m => m.id === moduleId);
    
    if (initialModule && currentModule) {
      const refillAmount = -(initialModule.maxLevel - currentModule.currentLevel);
      updateModuleLevel(moduleId, refillAmount);
      setTimeout(() => {
        setRefilling(null);
      }, 1000);
    }
  };

  const handleRefillAll = () => {
    setIsRefillAllActive(true);
    
    // Refill all modules in sequence with a small delay between each
    modules.forEach((module, index) => {
      setTimeout(() => {
        const initialModule = initialModules.find(m => m.id === module.id);
        if (initialModule) {
          const refillAmount = -(initialModule.maxLevel - module.currentLevel);
          updateModuleLevel(module.id, refillAmount);
        }
        
        // Reset the refill all state when done
        if (index === modules.length - 1) {
          setTimeout(() => setIsRefillAllActive(false), 500);
        }
      }, index * 300);
    });
  };

  const sidebarItems = [
    { name: "Dashboard", icon: <Activity size={18} /> },
    { name: "Modules", icon: <Utensils size={18} /> },
    { name: "Recipes", icon: <CoffeeIcon size={18} /> },
    { name: "Settings", icon: <Flame size={18} /> },
  ];

  return (
    <>
      <Sidebar
        items={sidebarItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Animated critical module indicator */}
      <AnimatePresence>
        {hasCriticalModule && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed left-0 right-0 top-0 z-50 bg-red-500/90 p-2 text-center text-white shadow-lg backdrop-blur-sm"
          >
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle size={18} />
              <span className="font-medium">Module Empty! Please refill to continue cooking.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          backgroundColor: hasCriticalModule ? "rgba(239, 68, 68, 0.5)" : "rgba(0, 0, 0, 0.5)"
        }}
        className="fixed right-4 top-4 z-50 rounded-full p-3 backdrop-blur-md"
        onClick={toggleMonitor}
      >
        {hasCriticalModule ? (
          <AlertCircle size={20} className="text-white animate-pulse" />
        ) : (
          <Activity size={20} className="text-white" />
        )}
      </motion.button>

      <AnimatePresence>
        {showMonitor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed right-4 top-16 z-40 w-64 rounded-xl border ${hasCriticalModule ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-white/10'} bg-black/80 p-4 shadow-xl backdrop-blur-md`}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Module Status</h3>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isRefillAllActive}
                  onClick={handleRefillAll}
                  className={`flex items-center gap-1 rounded-full ${isRefillAllActive ? 'bg-blue-500/40' : 'bg-blue-500/20 hover:bg-blue-500/30'} px-2 py-1 text-xs text-blue-300`}
                >
                  <RefreshCw size={12} className={isRefillAllActive ? "animate-spin" : ""} />
                  <span>Refill All</span>
                </motion.button>
                
                <button onClick={toggleMonitor}>
                  <Check size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`rounded-lg ${
                    module.status === "warning"
                      ? "border border-yellow-500/50 bg-yellow-500/10"
                      : module.status === "critical"
                      ? "border border-red-500/50 bg-red-500/10 animate-pulse"
                      : "bg-white/5"
                  } p-3 ${module.status === "critical" ? "shadow-[0_0_10px_rgba(239,68,68,0.2)]" : ""}`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getModuleIcon(module.icon)}
                      <span className="text-sm font-medium text-white">
                        {module.name}
                      </span>
                    </div>
                    {module.status === "warning" || module.status === "critical" ? (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRefill(module.id)}
                        className={`flex items-center gap-1 rounded-full ${
                          module.status === "critical" ? "bg-red-500/30 text-red-300 hover:bg-red-500/50" : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                        } px-2 py-1 text-xs`}
                      >
                        <RefreshCw 
                          size={12} 
                          className={refilling === module.id ? "animate-spin" : ""} 
                        />
                        <span>{module.status === "critical" ? "Refill Now" : "Refill"}</span>
                      </motion.button>
                    ) : (
                      <Check size={16} className="text-green-500" />
                    )}
                  </div>

                  <div className="h-2 w-full rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: `${(module.currentLevel / module.maxLevel) * 100}%` }}
                      animate={{ width: `${(module.currentLevel / module.maxLevel) * 100}%` }}
                      transition={{ type: "spring", damping: 10 }}
                      className={`h-full rounded-full ${
                        module.status === "warning"
                          ? "bg-yellow-500"
                          : module.status === "critical"
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                    />
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span
                      className={
                        module.status === "warning"
                          ? "text-yellow-400"
                          : module.status === "critical"
                          ? "text-red-400"
                          : "text-gray-400"
                      }
                    >
                      {module.currentLevel} / {module.maxLevel} {module.unit}
                    </span>
                    {module.status === "warning" ? (
                      <span className="text-yellow-400">Low</span>
                    ) : module.status === "critical" ? (
                      <span className="text-red-400">Empty</span>
                    ) : (
                      <span className="text-gray-400">Normal</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};