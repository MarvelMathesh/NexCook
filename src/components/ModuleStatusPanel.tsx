import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertCircle, Check, CoffeeIcon, Droplets, Flame, RefreshCw, Soup, Utensils } from "lucide-react";
import { useAppStore } from "../store";
import { Sidebar } from "./ui/Sidebar";
import { initialModules } from "../store/initialData";

export const ModuleStatusPanel = () => {
  const { modules, updateModuleLevel } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [refilling, setRefilling] = useState<string | null>(null);

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

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed right-4 top-4 z-50 rounded-full bg-black/50 p-3 backdrop-blur-md"
        onClick={toggleMonitor}
      >
        <Activity size={20} className="text-white" />
      </motion.button>

      <AnimatePresence>
        {showMonitor && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed right-4 top-16 z-40 w-64 rounded-xl border border-white/10 bg-black/80 p-4 shadow-xl backdrop-blur-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">Module Status</h3>
              <button onClick={toggleMonitor}>
                <Check size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`rounded-lg ${
                    module.status === "warning"
                      ? "border border-yellow-500 bg-yellow-500/10"
                      : module.status === "critical"
                      ? "border border-red-500 bg-red-500/10"
                      : "bg-white/5"
                  } p-3`}
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
                        className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/30"
                      >
                        <RefreshCw 
                          size={12} 
                          className={refilling === module.id ? "animate-spin" : ""} 
                        />
                        <span>Refill</span>
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