import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  Zap, 
  Droplets, 
  Utensils, 
  Soup, 
  CoffeeIcon, 
  Flame,
  Scissors,
  Thermometer,
  Wind,
  Sparkles,
  Shield
} from "lucide-react";
import { useAppStore } from "../../store";
import { GlassPanel } from "../ui/GlassPanel";
import { GlowText } from "../ui/GlowText";
import { ModuleStatusCard } from "../ModuleStatusCard";
import { Button } from "../ui/Button";
import { HoverGlow } from "../ui/HoverGlow";

export const ModuleStatusScreen = () => {
  const { modules, updateModuleLevel } = useAppStore();
  const [refilling, setRefilling] = useState<string | null>(null);
  const [isRefillAllActive, setIsRefillAllActive] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  // Check if any module is in critical state (empty)
  const hasCriticalModule = modules.some(module => module.status === "critical");
  const hasWarningModule = modules.some(module => module.status === "warning");

  // Enhanced module icon mapping for all 11 module types
  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case "Droplets":
        return <Droplets size={18} className="text-blue-400" />;
      case "Utensils":
        return <Utensils size={18} className="text-amber-400" />;
      case "Soup":
        return <Soup size={18} className="text-green-400" />;
      case "CoffeeIcon":
        return <CoffeeIcon size={18} className="text-brown-400" />;
      case "Flame":
        return <Flame size={18} className="text-red-400" />;
      case "Scissors":
        return <Scissors size={18} className="text-purple-400" />;
      case "Thermometer":
        return <Thermometer size={18} className="text-orange-400" />;
      case "Wind":
        return <Wind size={18} className="text-cyan-400" />;
      case "Sparkles":
        return <Sparkles size={18} className="text-yellow-400" />;
      case "Shield":
        return <Shield size={18} className="text-emerald-400" />;
      default:
        return <Zap size={18} className="text-purple-400" />;
    }
  };

  const handleRefill = (moduleId: string) => {
    setRefilling(moduleId);
    
    // Find initial and current module data
    const currentModule = modules.find(m => m.id === moduleId);
    
    if (currentModule) {
      // Calculate amount needed to refill to max
      const refillAmount = -(currentModule.maxLevel - currentModule.currentLevel);
      
      // Update module level (negative value means add)
      updateModuleLevel(moduleId, refillAmount);
      
      // Clear refilling state after a delay
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
        const refillAmount = -(module.maxLevel - module.currentLevel);
        updateModuleLevel(module.id, refillAmount);
        
        // Reset the refill all state when done
        if (index === modules.length - 1) {
          setTimeout(() => setIsRefillAllActive(false), 500);
        }
      }, index * 300);
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <GlowText
            text="Module Status"
            as="h1"
            size="3xl"
            className="mb-2"
          />
          <p className="text-white/60">
            Monitor and manage your smart cooking modules
          </p>
        </div>
        
        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
          <Button
            variant="glass"
            size="md"
            leadingIcon={<Settings size={16} />}
            onClick={() => setShowSystemInfo(!showSystemInfo)}
          >
            System
          </Button>
        </motion.div>
      </div>
      
      {/* System status panel */}
      <AnimatePresence>
        {showSystemInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 overflow-hidden"
          >
            <GlassPanel className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="mb-1 text-sm text-white/60">System Status</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <p className="font-medium">Online</p>
                  </div>
                </div>
                
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="mb-1 text-sm text-white/60">Firmware Version</p>
                  <p className="font-medium">v2.1.4</p>
                </div>
                
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="mb-1 text-sm text-white/60">Last Maintenance</p>
                  <p className="font-medium">2 days ago</p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Alert section */}
      {(hasCriticalModule || hasWarningModule) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <GlassPanel
            className={`p-4 ${hasCriticalModule ? 'border-red-500/30' : 'border-amber-500/30'}`}
            variant={hasCriticalModule ? "dark" : "default"}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-full ${hasCriticalModule ? 'bg-red-500/20' : 'bg-amber-500/20'} p-2`}>
                <AlertTriangle 
                  size={20} 
                  className={hasCriticalModule ? 'text-red-400' : 'text-amber-400'} 
                />
              </div>
              <div>
                <h3 className="font-medium">
                  {hasCriticalModule 
                    ? 'Critical Module Alert' 
                    : 'Module Attention Required'}
                </h3>
                <p className="text-sm text-white/60">
                  {hasCriticalModule 
                    ? 'Some modules are empty and need immediate refill.' 
                    : 'Some modules are running low and may need refill soon.'}
                </p>
              </div>
              
              <div className="ml-auto">
                <Button
                  variant={hasCriticalModule ? "primary" : "glass"}
                  size="sm"
                  leadingIcon={<RefreshCw size={16} className={isRefillAllActive ? "animate-spin" : ""} />}
                  onClick={handleRefillAll}
                  disabled={isRefillAllActive}
                  glow={hasCriticalModule}
                >
                  Refill All
                </Button>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      )}
      
      {/* Module grid */}
      <HoverGlow>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <ModuleStatusCard
              key={module.id}
              module={module}
              onRefill={handleRefill}
              isRefilling={refilling === module.id}
              moduleIcon={getModuleIcon(module.icon)}
            />
          ))}
        </div>
      </HoverGlow>
      
      {/* System information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <GlassPanel className="p-4">
          <h3 className="mb-4 text-lg font-medium">System Information</h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-sm text-white/60">Last Synchronization</p>
              <p className="font-medium">Just now</p>
            </div>
            
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-sm text-white/60">Next Scheduled Maintenance</p>
              <p className="font-medium">In 25 days</p>
            </div>
            
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-sm text-white/60">Active Modules</p>
              <p className="font-medium">
                {modules.filter(m => m.status === 'normal').length} / {modules.length}
              </p>
            </div>
            
            <div className="rounded-lg bg-white/5 p-3">
              <p className="text-sm text-white/60">Device Temperature</p>
              <p className="font-medium">Normal (38°C)</p>
            </div>
          </div>
          
          <div className="mt-4 text-right">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setShowSystemInfo(!showSystemInfo)}
            >
              {showSystemInfo ? "Less Details" : "More Details"}
            </Button>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
};