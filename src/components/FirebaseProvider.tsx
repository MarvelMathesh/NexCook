import React, { useEffect, useState } from "react";
import { useAppStore } from "../store";
import { firebaseService } from "../services/firebase";

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchDataFromFirebase = useAppStore(state => state.fetchDataFromFirebase);

  useEffect(() => {
    const initFirebase = async () => {      try {
        console.log("Initializing Firebase connection...");
        
        // FORCE UPDATE: Update Firebase with new 10-module system
        const { modules, recipes } = useAppStore.getState();
        console.log("Force updating Firebase with new 10-module system...");
        await firebaseService.forceUpdateDatabase(modules, recipes);
        
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
        setError("Failed to load application data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    initFirebase();
  }, [fetchDataFromFirebase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-lg">Loading NexCook...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-red-500/20 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-red-500">Connection Error</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
