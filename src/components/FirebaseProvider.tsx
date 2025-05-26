import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store";
import { firebaseService } from "../services/firebase";
import { AlertTriangle, Loader, RefreshCw } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { Button } from "./ui/Button";

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const fetchDataFromFirebase = useAppStore(state => state.fetchDataFromFirebase);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        console.log("Initializing Firebase connection...");
        
        // First check if we can connect to Firebase
        const systemStatus = await firebaseService.checkSystemStatus();
        if (!systemStatus.online) {
          throw new Error("Could not connect to Firebase. Please check your internet connection.");
        }
        
        // Initialize Firebase with default data if needed
        await firebaseService.initializeDatabase(
          useAppStore.getState().modules, 
          useAppStore.getState().recipes
        );
        
        // Then load data into Zustand
        await fetchDataFromFirebase();
        
        // Set up realtime listeners
        const unsubscribeModules = firebaseService.subscribeToModules((modules) => {
          if (modules.length > 0) {
            console.log("Modules updated from Firebase in real-time");
          }
        });
        
        const unsubscribeRecipes = firebaseService.subscribeToRecipes((recipes) => {
          if (recipes.length > 0) {
            console.log("Recipes updated from Firebase in real-time");
          }
        });
        
        console.log("Firebase initialized successfully");
        
        return () => {
          // Clean up listeners when component unmounts
          unsubscribeModules();
          unsubscribeRecipes();
          console.log("Firebase listeners cleaned up");
        };
      } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        setError(error instanceof Error ? error.message : "Failed to load application data");
      } finally {
        setIsLoading(false);
      }
    };

    initFirebase();
  }, [fetchDataFromFirebase]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    
    try {
      await fetchDataFromFirebase();
      setIsRetrying(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load application data");
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ 
              rotate: 360, 
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
            }}
            className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20"
          >
            <Loader size={40} className="text-primary" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"></div>
          </motion.div>
          
          <h2 className="mb-2 text-xl font-bold text-white">Loading NexCook</h2>
          <p className="text-center text-white/60">
            Connecting to your smart cooking hub
          </p>
        </motion.div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-md px-4"
          >
            <GlassPanel className="p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20"
              >
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </motion.div>
              
              <h2 className="mb-2 text-xl font-bold text-red-500">Connection Error</h2>
              <p className="mb-4 text-white/80">{error}</p>
              
              <Button
                onClick={handleRetry}
                variant="primary"
                disabled={isRetrying}
                leadingIcon={isRetrying ? <RefreshCw className="animate-spin" size={16} /> : undefined}
                className="mx-auto"
              >
                {isRetrying ? "Connecting..." : "Try Again"}
              </Button>
            </GlassPanel>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return <>{children}</>;
};