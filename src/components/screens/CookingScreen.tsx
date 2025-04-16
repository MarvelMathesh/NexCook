import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { CheckCircle, ChefHat, Loader, Clock, XCircle, AlertTriangle, Flame, Droplets, Thermometer, RefreshCw, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";
import { BackgroundBeams } from "../ui/BackgroundBeams";
import { Sparkles } from "../ui/SparklesEffect";
import { TextGenerateEffect } from "../ui/TextGenerateEffect";
import { GlowingBorder } from "../ui/GlowingBorder";
import { FireParticles } from "../ui/FireParticles";
import { Tooltip } from "../ui/Tooltip";
import { LampContainer } from "../ui/LampContainer";
import { cn } from "../../utils/animations";

const steps = [
  "Initializing smart cooking system",
  "Measuring precise ingredients",
  "Activating thermal elements",
  "Dispensing components in sequence",
  "Monitoring culinary parameters",
  "Applying finishing techniques"
];

const cookingParameters = [
  { name: "Temperature", icon: <Thermometer size={14} className="text-red-400" />, getValue: (progress: number) => `${Math.round(170 + progress)}°C`, description: "Current cooking temperature" },
  { name: "Pressure", icon: <Flame size={14} className="text-orange-400" />, getValue: (progress: number) => `${(0.8 + progress/200).toFixed(1)} bar`, description: "System pressure level" },
  { name: "Moisture", icon: <Droplets size={14} className="text-blue-400" />, getValue: (progress: number) => `${Math.round(40 + progress/2)}%`, description: "Ambient humidity level" }
];

export const CookingScreen = () => {
  const navigate = useNavigate();
  const { 
    selectedRecipe, 
    cookingProgress, 
    setCookingProgress, 
    setCookingStep, 
    cookingStep,
    cookingQueue,
    processNextQueueItem,
    resetCooking
  } = useAppStore();
  
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [activeParameter, setActiveParameter] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);
  
  const timersRef = useRef<{
    timerInterval: NodeJS.Timeout | null;
    stepTimeouts: NodeJS.Timeout[];
    completionTimer: NodeJS.Timeout | null;
    warningTimer: NodeJS.Timeout | null;
  }>({
    timerInterval: null,
    stepTimeouts: [],
    completionTimer: null,
    warningTimer: null
  });
  
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);
  const isTimerActiveRef = useRef<boolean>(true);

  const progressSpring = useSpring(cookingProgress, { 
    stiffness: 100, 
    damping: 20
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRetryButton(false);
      
      if (!isTimerActiveRef.current) {
        setShowRetryButton(true);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setCookingProgress(0);
    setCookingStep(0);
    setIsComplete(false);
    isTimerActiveRef.current = true;
    
    const totalDuration = selectedRecipe ? (selectedRecipe.cookingTime * 1000 * 60) / 6 : 5000;
    totalDurationRef.current = totalDuration;
    
    setRemainingTime(Math.floor(totalDuration / 1000));
    startTimeRef.current = Date.now();
    
    const stepInterval = totalDuration / steps.length;
    
    const timerInterval = setInterval(() => {
      if (!isTimerActiveRef.current) return;
      
      const elapsedMs = Date.now() - startTimeRef.current;
      const remainingSecs = Math.max(0, Math.ceil((totalDuration - elapsedMs) / 1000));
      const progressPercent = Math.min(Math.floor((elapsedMs / totalDuration) * 100), 100);
      
      setRemainingTime(remainingSecs);
      setCookingProgress(progressPercent);
      
      if (Math.random() < 0.0005 && !showWarning && !isComplete) {
        setShowWarning(true);
        const warningTimer = setTimeout(() => setShowWarning(false), 4000);
        timersRef.current.warningTimer = warningTimer;
      }
      
      if (!navigator.onLine && !showRetryButton && isTimerActiveRef.current) {
        isTimerActiveRef.current = false;
        setShowRetryButton(true);
      }
    }, 100);
    
    timersRef.current.timerInterval = timerInterval;
    
    const stepTimeouts: NodeJS.Timeout[] = [];
    for (let i = 0; i < steps.length; i++) {
      const timeout = setTimeout(() => {
        if (!isTimerActiveRef.current) return;
        setCookingStep(i);
      }, i * stepInterval);
      
      stepTimeouts.push(timeout);
    }
    timersRef.current.stepTimeouts = stepTimeouts;
    
    const completionTimer = setTimeout(() => {
      if (!isTimerActiveRef.current) return;
      
      setIsComplete(true);
      setRemainingTime(0);
      setCookingProgress(100);
      
      setTimeout(() => {
        if (cookingQueue.items.length > 0 && cookingQueue.currentItem < cookingQueue.items.length) {
          setIsProcessingQueue(true);
          processNextQueueItem();
        } else {
          navigate('/rating');
        }
      }, 2000);
    }, totalDuration);
    
    timersRef.current.completionTimer = completionTimer;
    
    return () => {
      clearAllTimers();
    };
  }, [selectedRecipe, setCookingProgress, setCookingStep, navigate, cookingQueue, processNextQueueItem, showWarning]);

  const handleRetry = () => {
    setIsRetrying(true);
    
    setTimeout(() => {
      if (navigator.onLine) {
        isTimerActiveRef.current = true;
        startTimeRef.current = Date.now() - (cookingProgress / 100) * totalDurationRef.current;
        
        setShowRetryButton(false);
        setIsRetrying(false);
      } else {
        setIsRetrying(false);
      }
    }, 1500);
  };

  const clearAllTimers = () => {
    if (timersRef.current.timerInterval) {
      clearInterval(timersRef.current.timerInterval);
    }
    
    timersRef.current.stepTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    
    if (timersRef.current.completionTimer) {
      clearTimeout(timersRef.current.completionTimer);
    }
    
    if (timersRef.current.warningTimer) {
      clearTimeout(timersRef.current.warningTimer);
    }
  };

  const handleForceStop = () => {
    clearAllTimers();
    resetCooking();
    navigate('/recipes');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedRecipe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>No recipe selected.</p>
      </div>
    );
  }

  const remainingItems = cookingQueue.items.length - cookingQueue.currentItem;

  return (
    <div 
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-white"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 z-0 bg-black">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(
                600px circle at ${mouseX.get()}px ${mouseY.get()}px,
                rgba(139, 92, 246, 0.15),
                transparent 40%
              )
            `,
          }}
        />
        <FireParticles 
          globalEffect={true}
          quantity={60}
          className="absolute inset-0"
        />
      </div>
      
      <AnimatePresence>
        {(!isOnline || showRetryButton) && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-600/80 to-red-600/80 p-2 text-center text-white backdrop-blur-sm"
          >
            {!isOnline ? (
              <p className="text-sm font-medium">Connection lost. Waiting to reconnect...</p>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm font-medium">Connection restored. Cooking paused.</p>
                <button 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium hover:bg-white/30"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" /> 
                      <span>Resuming...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw size={12} /> 
                      <span>Resume cooking</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="relative z-10 mx-auto grid h-full max-w-6xl grid-cols-1 items-center px-4 py-8 lg:grid-cols-2 lg:gap-8">
        <div className="flex flex-col items-center justify-center">
          <LampContainer>
            <div className="relative">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="complete"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="relative"
                  >
                    <div className="relative flex h-56 w-56 items-center justify-center rounded-full">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-green-400/20 blur-md" />
                      <CheckCircle size={80} className="text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-green-500/10"
                      />
                      <Sparkles className="absolute inset-0" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cooking"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative h-56 w-56"
                  >
                    <div className="group absolute inset-0 flex items-center justify-center rounded-full">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-700/20 to-purple-500/20 backdrop-blur-sm" />
                      
                      <motion.div
                        animate={{ 
                          boxShadow: [
                            `0 0 ${20 + cookingProgress/5}px ${cookingProgress/10}px rgba(168, 85, 247, 0.${30 + cookingProgress/5})`,
                            `0 0 ${10 + cookingProgress/5}px ${cookingProgress/15}px rgba(168, 85, 247, 0.${20 + cookingProgress/5})`,
                            `0 0 ${20 + cookingProgress/5}px ${cookingProgress/10}px rgba(168, 85, 247, 0.${30 + cookingProgress/5})`
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 rounded-full"
                      />
                      
                      <div className="absolute inset-0 overflow-hidden rounded-full">
                        <FireParticles 
                          quantity={cookingProgress < 5 ? 5 : Math.min(50, Math.floor(cookingProgress / 2.5))} 
                          intensity={cookingProgress / 100}
                          localEffect={true}
                        />
                      </div>
                      
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-purple-500/30 border-t-purple-500"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 rounded-full border-2 border-purple-400/20 border-b-purple-400"
                      />
                      
                      <motion.div
                        animate={{
                          y: [0, -5, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ChefHat 
                          size={80} 
                          className="relative z-10 text-purple-400 drop-shadow-glow-purple filter" 
                        />
                      </motion.div>
                      
                      <motion.div
                        animate={{ 
                          opacity: [0.3, 0.8, 0.3],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-purple-500/10 blur-md"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </LampContainer>
          
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="completed-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <motion.h1 
                  className="mb-2 text-3xl font-bold tracking-tight"
                  animate={{ color: ['rgb(168, 85, 247)', 'rgb(139, 92, 246)', 'rgb(168, 85, 247)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Cooking Complete!
                </motion.h1>
                
                <div className="max-w-md text-center text-gray-300">
                  {isProcessingQueue 
                    ? `${selectedRecipe.name} is ready! Processing next item in queue...`
                    : `Your ${selectedRecipe.name} is ready to enjoy!`}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cooking-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-center"
              >
                <h1 className="mb-2 text-2xl font-bold tracking-tight">{selectedRecipe.name}</h1>
                <div className="flex items-center justify-center gap-2 text-sm text-purple-300">
                  <Clock size={14} className="text-purple-400" />
                  <span>{formatTime(remainingTime)} remaining</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 grid grid-cols-3 gap-3"
            >
              {cookingParameters.map((param) => (
                <Tooltip key={param.name} content={param.description}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border border-white/10 bg-black/50 p-3 backdrop-blur-sm transition-all hover:border-purple-500/50",
                      activeParameter === param.name && "ring-2 ring-purple-500/50"
                    )}
                    onMouseEnter={() => setActiveParameter(param.name)}
                    onMouseLeave={() => setActiveParameter(null)}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      {param.icon}
                      <span>{param.name}</span>
                    </div>
                    <div className="text-center text-xl font-bold text-purple-300">
                      {param.getValue(cookingProgress)}
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: activeParameter === param.name ? 0.2 : 0 }}
                      className="absolute inset-0 -z-10 bg-purple-500"
                    />
                    
                    <motion.div
                      className="absolute inset-0 -z-10 hidden bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_60%)] opacity-0 group-hover:opacity-100"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                  </motion.div>
                </Tooltip>
              ))}
            </motion.div>
          )}
        </div>
        
        <div className="mt-8 flex h-full flex-col lg:mt-0">
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 overflow-hidden rounded-lg border border-yellow-500/20 bg-black/60 p-3 backdrop-blur-md"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-400" />
                  <div>
                    <h3 className="text-xs font-medium text-yellow-400">System Notification</h3>
                    <p className="text-xs text-yellow-300/80">
                      Parameter deviation detected. Auto-correcting cooking environment.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-xs">
              <span>Cooking Progress</span>
              <motion.span 
                className="font-mono font-bold"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {cookingProgress}%
              </motion.span>
            </div>
            
            <div className="h-2 overflow-hidden rounded-full bg-black/50 backdrop-blur-sm">
              <motion.div
                style={{ width: `${progressSpring.get()}%` }}
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
              >
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-full w-full bg-gradient-to-r from-transparent via-purple-300/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>
          
          <div className="mb-4 flex-grow overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
            <h3 className="mb-3 text-sm font-medium">Smart Cooking Process</h3>
            
            <div className="grid h-[calc(100%-2rem)] gap-2 overflow-y-auto pr-1">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: index <= cookingStep ? 1 : 0.4,
                    backgroundColor: index === cookingStep ? "rgba(168, 85, 247, 0.05)" : "rgba(0, 0, 0, 0)"
                  }}
                  whileHover={{ 
                    backgroundColor: "rgba(168, 85, 247, 0.1)",
                    scale: index <= cookingStep ? 1.01 : 1
                  }}
                  transition={{ 
                    delay: index * 0.1,
                    backgroundColor: { duration: 0.3 }
                  }}
                  className="relative flex items-center gap-3 rounded-lg border border-white/5 bg-black/50 p-2 backdrop-blur-sm"
                >
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors",
                    index < cookingStep ? "bg-green-500" : 
                    index === cookingStep ? "bg-purple-500" : 
                    "bg-white/10"
                  )}>
                    {index < cookingStep ? (
                      <CheckCircle size={12} />
                    ) : index === cookingStep ? (
                      <Loader className="animate-spin" size={12} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-sm">{step}</span>
                  
                  {index === cookingStep && (
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${cookingProgress}%` }}
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-purple-300"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            {remainingItems > 0 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="rounded-full bg-purple-500/20 px-3 py-1 text-xs backdrop-blur-sm"
              >
                <span className="font-medium">{remainingItems}</span> more in queue
              </motion.div>
            )}
            
            {!isComplete ? (
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "rgba(239, 68, 68, 0.7)" }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-1 rounded-full bg-red-500/50 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                onClick={handleForceStop}
              >
                <XCircle size={14} className="transition-transform group-hover:rotate-90" />
                <span>Cancel</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: "rgba(168, 85, 247, 0.7)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1 rounded-full bg-purple-500/50 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                onClick={() => navigate('/rating')}
              >
                <CheckCircle size={14} />
                <span>Finish</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};