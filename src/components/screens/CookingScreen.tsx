import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChefHat, Loader, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";

const steps = [
  "Preparing ingredients",
  "Measuring components",
  "Heating system",
  "Adding ingredients",
  "Cooking",
  "Finalizing dish"
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
  
  // Use refs to store timers so we can clear them when forcing stop
  const timersRef = useRef<{
    timerInterval: NodeJS.Timeout | null;
    stepTimeouts: NodeJS.Timeout[];
    completionTimer: NodeJS.Timeout | null;
  }>({
    timerInterval: null,
    stepTimeouts: [],
    completionTimer: null
  });
  
  // Start time ref to calculate progress accurately
  const startTimeRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);

  // Force a complete reset of state when component mounts
  useEffect(() => {
    setCookingProgress(0);
    setCookingStep(0);
    setIsComplete(false);
    
    // Use the actual cooking time from the recipe (converting minutes to milliseconds)
    // For demo purposes, we'll divide by 6 to make it faster, but still proportional to recipe time
    const totalDuration = selectedRecipe ? (selectedRecipe.cookingTime * 1000 * 60) / 6 : 5000;
    totalDurationRef.current = totalDuration;
    
    // Set initial remaining time (in seconds)
    setRemainingTime(Math.floor(totalDuration / 1000));
    
    // Set start time
    startTimeRef.current = Date.now();
    
    const stepInterval = totalDuration / steps.length;
    
    // Update progress and remaining time every 100ms for smoother updates
    const timerInterval = setInterval(() => {
      // Calculate elapsed and remaining time
      const elapsedMs = Date.now() - startTimeRef.current;
      const remainingSecs = Math.max(0, Math.ceil((totalDuration - elapsedMs) / 1000));
      
      // Calculate progress percentage
      const progressPercent = Math.min(Math.floor((elapsedMs / totalDuration) * 100), 100);
      
      setRemainingTime(remainingSecs);
      setCookingProgress(progressPercent);
    }, 100);
    
    timersRef.current.timerInterval = timerInterval;
    
    // Schedule each step to happen at the appropriate time
    const stepTimeouts: NodeJS.Timeout[] = [];
    for (let i = 0; i < steps.length; i++) {
      const timeout = setTimeout(() => {
        setCookingStep(i);
      }, i * stepInterval);
      
      stepTimeouts.push(timeout);
    }
    timersRef.current.stepTimeouts = stepTimeouts;
    
    // Completion timer
    const completionTimer = setTimeout(() => {
      setIsComplete(true);
      setRemainingTime(0);
      setCookingProgress(100);
      
      // After completion, either process next item or go to rating
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
    
    // Clean up all timers on unmount
    return () => {
      clearAllTimers();
    };
  }, [selectedRecipe, setCookingProgress, setCookingStep, navigate, cookingQueue, processNextQueueItem]);

  // Function to clear all active timers
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
  };

  // Handle force stop
  const handleForceStop = () => {
    clearAllTimers();
    resetCooking();
    navigate('/recipes');
  };

  // Format remaining time as MM:SS
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
    <div className="min-h-screen w-full bg-gradient-to-b from-black to-purple-950 px-4 py-16 text-white">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8 rounded-full bg-purple-700/20 p-8"
        >
          {isComplete ? (
            <CheckCircle size={80} className="text-green-400" />
          ) : (
            <div className="relative">
              <ChefHat size={80} className="text-purple-400" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent"
              />
            </div>
          )}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-3xl font-bold"
        >
          {isComplete ? "Cooking Complete!" : "Cooking in Progress"}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-gray-300"
        >
          {isComplete 
            ? isProcessingQueue 
              ? `${selectedRecipe.name} is ready! Processing next item in queue...`
              : `Your ${selectedRecipe.name} is ready to enjoy!`
            : `Preparing ${selectedRecipe.name}. Please wait...`}
        </motion.p>

        {!isComplete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 flex items-center justify-center gap-2 rounded-full bg-purple-900/30 px-4 py-2"
            >
              <Clock size={16} className="text-purple-300" />
              <span className="font-medium text-white">{formatTime(remainingTime)}</span>
              <span className="text-sm text-gray-300">remaining</span>
            </motion.div>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-6 flex items-center gap-2 rounded-full bg-red-500/70 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              onClick={handleForceStop}
            >
              <XCircle size={16} />
              <span>Cancel Cooking</span>
            </motion.button>
          </>
        )}

        {remainingItems > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 rounded-full bg-purple-900/30 px-4 py-2 text-sm"
          >
            {remainingItems} more {remainingItems === 1 ? "item" : "items"} in queue
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 w-full"
        >
          <div className="mb-2 flex justify-between text-sm">
            <span>Progress</span>
            <span>{cookingProgress}%</span>
          </div>
          
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              style={{ width: `${cookingProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300"
              transition={{ type: "spring", damping: 10 }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <h3 className="mb-4 text-left text-lg font-medium">Cooking Steps</h3>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: index <= cookingStep ? 1 : 0.3 
                }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  index < cookingStep
                    ? "bg-green-500"
                    : index === cookingStep
                    ? "bg-purple-500"
                    : "bg-white/10"
                }`}>
                  {index < cookingStep ? (
                    <CheckCircle size={16} />
                  ) : index === cookingStep ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={index <= cookingStep ? "font-medium" : "text-gray-400"}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};