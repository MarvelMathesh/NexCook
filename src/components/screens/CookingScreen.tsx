import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ChefHat, Loader } from "lucide-react";
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
  const { 
    selectedRecipe, 
    cookingProgress, 
    setCookingProgress, 
    cookingStep, 
    setCookingStep, 
    setCurrentScreen,
    cookingQueue,
    processNextQueueItem
  } = useAppStore();
  const [isComplete, setIsComplete] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Force a complete reset of state when component mounts
  useEffect(() => {
    setCookingProgress(0);
    setCookingStep(0);
    setIsComplete(false);
    
    // Calculate a shorter duration for the demo
    const totalDuration = selectedRecipe ? (selectedRecipe.cookingTime * 1000) / 3 : 5000;
    const stepInterval = totalDuration / steps.length;
    const progressInterval = totalDuration / 100;
    
    // Progress timer updates the progress bar
    const progressTimer = setInterval(() => {
      setCookingProgress(prev => {
        const newValue = prev + 1;
        return newValue <= 100 ? newValue : 100;
      });
    }, progressInterval);
    
    // We'll use a separate array of timeouts for each step to ensure they all run
    const stepTimeouts: NodeJS.Timeout[] = [];
    
    // Schedule each step to happen at the appropriate time
    for (let i = 0; i < steps.length; i++) {
      const timeout = setTimeout(() => {
        setCookingStep(i);
      }, i * stepInterval);
      
      stepTimeouts.push(timeout);
    }
    
    // Completion timer
    const completionTimer = setTimeout(() => {
      setIsComplete(true);
      // After completion, either process next item or go to rating
      setTimeout(() => {
        if (cookingQueue.items.length > 0 && cookingQueue.currentItem < cookingQueue.items.length) {
          setIsProcessingQueue(true);
          processNextQueueItem();
        } else {
          setCurrentScreen('rating');
        }
      }, 2000);
    }, totalDuration);
    
    // Clean up all timers on unmount
    return () => {
      clearInterval(progressTimer);
      stepTimeouts.forEach(timeout => clearTimeout(timeout));
      clearTimeout(completionTimer);
    };
  }, [selectedRecipe, setCookingProgress, setCookingStep, setCurrentScreen, cookingQueue, processNextQueueItem]);

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
          className="mb-8 text-gray-300"
        >
          {isComplete 
            ? isProcessingQueue 
              ? `${selectedRecipe.name} is ready! Processing next item in queue...`
              : `Your ${selectedRecipe.name} is ready to enjoy!`
            : `Preparing ${selectedRecipe.name}. Please wait...`}
        </motion.p>

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
              initial={{ width: "0%" }}
              animate={{ width: `${cookingProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300"
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