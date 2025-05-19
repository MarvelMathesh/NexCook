import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Recipe, Module, CartItem, Customization } from '../types';
import { initialModules, initialRecipes } from './initialData';
import { firebaseService } from '../services/firebase';
import { uartService } from '../services/uartService';
import { useEffect } from 'react';

// Initialize Firebase with default data when the app starts
// We do this outside the store to ensure it happens only once
firebaseService.initializeDatabase(initialModules, initialRecipes);

export const useAppStore = create<AppState & {
  setCurrentScreen: (screen: AppState['currentScreen']) => void;
  selectRecipe: (recipe: Recipe | null) => void;
  updateModuleLevel: (moduleId: string, amount: number) => void;
  updateCustomization: (field: keyof AppState['customization'], value: number) => void;
  setCookingProgress: (progress: number) => void;
  setCookingStep: (step: number) => void;
  setRating: (rating: number) => void;
  resetCooking: () => void;
  startCooking: () => void;
  addToCart: (recipeId: string, quantity: number, customization: Customization) => void;
  removeFromCart: (index: number) => void;
  updateCartItem: (index: number, quantity: number) => void;
  clearCart: () => void;
  processNextQueueItem: () => void;
  startCookingQueue: () => void;
  fetchDataFromFirebase: () => Promise<void>;
}>((set, get) => ({
  currentScreen: 'home',
  selectedRecipe: null,
  modules: initialModules, // Will be overwritten by Firebase data
  recipes: initialRecipes, // Will be overwritten by Firebase data
  customization: {
    salt: 50,
    spice: 50,
    water: 50,
  },
  cookingProgress: 0,
  cookingStep: 0,
  ratingValue: 0,
  cart: [],
  cookingQueue: {
    items: [],
    currentItem: 0,
    status: 'idle'
  },

  // Function to fetch initial data from Firebase
  fetchDataFromFirebase: async () => {
    try {
      // Get modules, recipes, and app state from Firebase
      const modules = await firebaseService.getModules();
      const recipes = await firebaseService.getRecipes();
      const appState = await firebaseService.getAppState() as any;
      
      set({ 
        modules: modules.length > 0 ? modules : initialModules,
        recipes: recipes.length > 0 ? recipes : initialRecipes,
        cart: appState.cart || [],
        customization: appState.customization || {
          salt: 50,
          spice: 50,
          water: 50,
        },
        cookingQueue: appState.cookingQueue || {
          items: [],
          currentItem: 0,
          status: 'idle'
        }
      });
      
      // Set up real-time listeners
      firebaseService.subscribeToModules((updatedModules) => {
        if (updatedModules.length > 0) {
          set({ modules: updatedModules });
        }
      });
      
      firebaseService.subscribeToRecipes((updatedRecipes) => {
        if (updatedRecipes.length > 0) {
          set({ recipes: updatedRecipes });
        }
      });
      
      firebaseService.subscribeToAppState((state: any) => {
        if (state) {
          set({
            cart: state.cart || [],
            customization: state.customization || get().customization,
            cookingQueue: state.cookingQueue || get().cookingQueue
          });
        }
      });
      
      console.log("Data fetched from Firebase successfully");
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  },

  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  
  selectRecipe: (recipe) => {
    console.log("Selecting recipe:", recipe);
    set({ selectedRecipe: recipe });
  },
  
  updateModuleLevel: (moduleId, amount) => {
    set((state) => {
      const modules = state.modules.map((module) => {
        if (module.id === moduleId) {
          const newLevel = Math.max(0, Math.min(module.maxLevel, module.currentLevel - amount));
          const newStatus = newLevel <= module.threshold ? (newLevel === 0 ? 'critical' : 'warning') : 'normal';
          
          // Update module in Firebase (debounced)
          const updatedModule = {
            ...module,
            currentLevel: newLevel,
            status: newStatus,
          };
          
          firebaseService.updateModule(moduleId, updatedModule);
          
          return updatedModule;
        }
        return module;
      });
      
      return { modules };
    });
  },
  
  updateCustomization: (field, value) => {
    set((state) => {
      const newCustomization = {
        ...state.customization,
        [field]: value,
      };
      
      // Update customization in Firebase
      firebaseService.updateCustomization(newCustomization);
      
      return { customization: newCustomization };
    });
  },
  
  setCookingProgress: (progress) => set({ cookingProgress: progress }),
  
  setCookingStep: (step) => set({ cookingStep: step }),
  
  setRating: (rating) => set({ ratingValue: rating }),
  
  resetCooking: () => set((state) => {
    const newCookingQueue = {
      ...state.cookingQueue,
      status: 'idle' as const
    };
    
    // Update cooking queue in Firebase
    firebaseService.updateCookingQueue(newCookingQueue);
    
    return {
      cookingProgress: 0,
      cookingStep: 0,
      ratingValue: 0,
      cookingQueue: newCookingQueue
    };
  }),
  
  startCooking: () => set((state) => {
    // Check if any module is in critical state
    const hasCriticalModule = state.modules.some(module => module.status === "critical");
    
    // If any module is critical, prevent cooking and return current state
    if (hasCriticalModule) {
      // Could add a notification or alert here
      console.warn("Cannot start cooking: One or more modules are empty and need refilling");
      return state; // Return unchanged state
    }
    
    const updatedModules = [...state.modules];
    const moduleUpdates: {id: string, data: Partial<Module>}[] = [];
    const uartModuleUpdates: {id: string, change: number}[] = []; // For UART communication
    
    if (state.selectedRecipe) {
      state.selectedRecipe.ingredients.forEach(ingredient => {
        const moduleIndex = updatedModules.findIndex(m => m.id === ingredient.moduleId);
        if (moduleIndex >= 0) {
          const currentModule = updatedModules[moduleIndex];
          const newLevel = Math.max(0, currentModule.currentLevel - ingredient.quantity);
          const changeAmount = newLevel - currentModule.currentLevel; // This will be negative
          const newStatus = newLevel <= currentModule.threshold ? (newLevel === 0 ? 'critical' : 'warning') : 'normal';
          
          updatedModules[moduleIndex] = {
            ...currentModule,
            currentLevel: newLevel,
            status: newStatus,
          };
          
          // Collect updates for batch processing
          moduleUpdates.push({
            id: currentModule.id, 
            data: {
              currentLevel: newLevel,
              status: newStatus
            }
          });
          
          // Collect updates for UART communication
          uartModuleUpdates.push({
            id: currentModule.id,
            change: changeAmount // Negative value representing the reduction
          });
        }
      });
      
      // Batch update modules in Firebase for better performance
      if (moduleUpdates.length > 0) {
        firebaseService.updateModulesBatch(moduleUpdates);
      }
      
      // Send updates to ESP32 via UART
      if (uartModuleUpdates.length > 0) {
        uartService.sendModuleUpdates(uartModuleUpdates)
          .then(response => {
            if (response.success) {
              console.log("Successfully sent cooking instructions to ESP32:", response.message);
            } else {
              console.error("Failed to send cooking instructions to ESP32:", response.error);
            }
          })
          .catch(error => {
            console.error("Error sending cooking instructions to ESP32:", error);
          });
      }
      
      // Update the recipe's statistics
      const updatedRecipes = state.recipes.map(recipe => {
        if (recipe.id === state.selectedRecipe?.id) {
          const updatedRecipe = { 
            ...recipe, 
            timesCooked: recipe.timesCooked + 1 
          };
          
          // Update recipe in Firebase
          firebaseService.updateRecipe(recipe.id, { timesCooked: updatedRecipe.timesCooked });
          
          return updatedRecipe;
        }
        return recipe;
      });
      
      const newCookingQueue = {
        ...state.cookingQueue,
        status: 'cooking' as const
      };
      
      // Update cooking queue in Firebase
      firebaseService.updateCookingQueue(newCookingQueue);
      
      return {
        modules: updatedModules,
        recipes: updatedRecipes,
        currentScreen: 'cooking',
        cookingQueue: newCookingQueue
      };
    }
    
    const newCookingQueue = {
      ...state.cookingQueue,
      status: 'cooking' as const
    };
    
    // Update cooking queue in Firebase
    firebaseService.updateCookingQueue(newCookingQueue);
    
    return { 
      currentScreen: 'cooking',
      cookingQueue: newCookingQueue
    };
  }),
  
  addToCart: (recipeId, quantity, customization) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(item => item.recipeId === recipeId);
      let newCart;
      
      if (existingItemIndex !== -1) {
        // Update existing item
        newCart = [...state.cart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
      } else {
        // Add new item
        newCart = [...state.cart, { recipeId, quantity, customization }];
      }
      
      // Update cart in Firebase
      firebaseService.updateCart(newCart);
      
      return { 
        cart: newCart,
        currentScreen: existingItemIndex === -1 ? 'cart' : state.currentScreen
      };
    });
  },
  
  removeFromCart: (index) => {
    set((state) => {
      const newCart = state.cart.filter((_, i) => i !== index);
      
      // Update cart in Firebase
      firebaseService.updateCart(newCart);
      
      return { cart: newCart };
    });
  },
  
  updateCartItem: (index, quantity) => {
    set((state) => {
      const updatedCart = [...state.cart];
      if (updatedCart[index]) {
        updatedCart[index] = { ...updatedCart[index], quantity };
      }
      
      // Update cart in Firebase
      firebaseService.updateCart(updatedCart);
      
      return { cart: updatedCart };
    });
  },
  
  clearCart: () => {
    // Update cart in Firebase
    firebaseService.updateCart([]);
    
    set({ cart: [] });
  },
  
  processNextQueueItem: () => {
    const state = get();
    const queue = state.cookingQueue;
    
    // If we've completed all items, reset the queue
    if (queue.currentItem >= queue.items.length) {
      const newCookingQueue = {
        items: [],
        currentItem: 0,
        status: 'idle' as const
      };
      
      // Update cooking queue in Firebase
      firebaseService.updateCookingQueue(newCookingQueue);
      
      set({ cookingQueue: newCookingQueue });
      return;
    }
    
    // Process the current item
    const currentCartItem = queue.items[queue.currentItem];
    const recipe = state.recipes.find(r => r.id === currentCartItem.recipeId);
    
    if (recipe) {
      // Set the selected recipe and customization
      set({ 
        selectedRecipe: recipe,
        customization: currentCartItem.customization,
        cookingProgress: 0,
        cookingStep: 0
      });
      
      // Start cooking
      state.startCooking();
      
      // Move to the next item in the queue
      const newCookingQueue = {
        ...state.cookingQueue,
        currentItem: state.cookingQueue.currentItem + 1
      };
      
      // Update cooking queue in Firebase
      firebaseService.updateCookingQueue(newCookingQueue);
      
      set({ cookingQueue: newCookingQueue });
    }
  },
  
  startCookingQueue: () => {
    const state = get();
    
    const newCookingQueue = {
      items: [...state.cart],
      currentItem: 0,
      status: 'preparing' as const
    };
    
    // Update cooking queue in Firebase and clear cart
    firebaseService.updateCookingQueue(newCookingQueue);
    firebaseService.updateCart([]);
    
    set({
      cookingQueue: newCookingQueue,
      cart: [], // Clear the cart
      currentScreen: 'cooking'
    });
    
    // Process the first item
    setTimeout(() => {
      get().processNextQueueItem();
    }, 500);
  }
}));

// Create a hook to initialize Firebase data when the app loads
export const useFirebaseInit = () => {
  useEffect(() => {
    useAppStore.getState().fetchDataFromFirebase();
  }, []);
};