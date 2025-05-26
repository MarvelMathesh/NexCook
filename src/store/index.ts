import { create } from 'zustand';
import { AppState, Recipe, Module, ModuleOperation, Customization } from '../types';
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
  performModuleOperation: (moduleId: string, operationType: string, amount: number, duration?: number) => void;
  getModuleWarnings: () => Array<{
    moduleId: string;
    moduleName: string;
    type: 'critical' | 'warning' | 'maintenance';
    message: string;
    priority: number;
  }>;
  performMaintenanceRefill: () => void;
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
  },  // Function to fetch initial data from Firebase
  fetchDataFromFirebase: async () => {
    try {
      // Get modules, recipes, and app state from Firebase
      const modules = await firebaseService.getModules();
      const recipes = await firebaseService.getRecipes();
      const appState = await firebaseService.getAppState() as any;
      
      console.log("Firebase modules count:", modules.length);
      console.log("Initial modules count:", initialModules.length);
        // If Firebase has fewer modules than expected, reinitialize with complete set
      if (modules.length < initialModules.length) {
        console.log("Firebase has incomplete module set, reinitializing...");
        await firebaseService.forceReinitializeModules(initialModules);
        // Use initial modules immediately
        set({ 
          modules: initialModules,
          recipes: recipes.length > 0 ? recipes : initialRecipes,
          cart: appState?.cart || [],
          customization: appState?.customization || {
            salt: 50,
            spice: 50,
            water: 50,
          },
          cookingQueue: appState?.cookingQueue || {
            items: [],
            currentItem: 0,
            status: 'idle'
          }
        });
      } else {
        // Use Firebase modules if complete, ensure proper typing
        const typedModules: Module[] = modules.map(module => ({
          ...module,
          status: module.status as 'normal' | 'warning' | 'critical'
        }));
        
        set({ 
          modules: modules.length > 0 ? typedModules : initialModules,
          recipes: recipes.length > 0 ? recipes : initialRecipes,
          cart: appState?.cart || [],
          customization: appState?.customization || {
            salt: 50,
            spice: 50,
            water: 50,
          },
          cookingQueue: appState?.cookingQueue || {
            items: [],
            currentItem: 0,
            status: 'idle'
          }
        });
      }
      
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
  },
  // Enhanced module operation functions for specific module types
  performModuleOperation: (moduleId: string, operationType: string, amount: number, duration?: number) => {
    set((state) => {
      const modules = state.modules.map((module) => {
        if (module.id === moduleId) {
          let newLevel = module.currentLevel;
          let operationData: any = { type: operationType, amount, timestamp: Date.now() };
          
          // Handle different operation types
          switch (operationType) {
            case 'dispense':
              newLevel = Math.max(0, module.currentLevel - amount);
              operationData.operation = `Dispensed ${amount} ${module.unit}`;
              break;
            case 'grinding':
              newLevel = Math.max(0, module.currentLevel - amount);
              operationData.operation = `Ground ${amount} ${module.unit}`;
              operationData.duration = duration || 30; // Default 30 seconds
              break;
            case 'chopping':
              newLevel = Math.max(0, module.currentLevel - amount);
              operationData.operation = `Chopped ${amount} ${module.unit}`;
              operationData.duration = duration || 45; // Default 45 seconds
              break;
            case 'heating':
              operationData.operation = `Heating for ${duration || 60} seconds`;
              operationData.duration = duration || 60;
              operationData.temperature = amount; // Amount represents temperature
              break;
            case 'steaming':
              newLevel = Math.max(0, module.currentLevel - amount);
              operationData.operation = `Steaming with ${amount} ${module.unit}`;
              operationData.duration = duration || 120;
              break;
            case 'stirring':
              operationData.operation = `Stirring for ${duration || 30} seconds`;
              operationData.duration = duration || 30;
              operationData.speed = amount; // Amount represents stirring speed
              break;
            case 'cleaning':
              operationData.operation = `Cleaning cycle - ${duration || 180} seconds`;
              operationData.duration = duration || 180;
              break;
            default:
              newLevel = Math.max(0, module.currentLevel - amount);
              operationData.operation = `Operation: ${operationType}`;
          }
          
          const newStatus: 'normal' | 'warning' | 'critical' = newLevel <= module.threshold ? (newLevel === 0 ? 'critical' : 'warning') : 'normal';
          
          const updatedModule = {
            ...module,
            currentLevel: newLevel,
            status: newStatus,
            lastOperation: operationData,
          };
          
          // Update module in Firebase
          firebaseService.updateModule(moduleId, updatedModule);
          
          // Send operation to ESP32 via UART
          uartService.sendModuleOperation({
            moduleId,
            operationType,
            amount,
            duration: operationData.duration,
            temperature: operationData.temperature,
            speed: operationData.speed
          }).catch((error: any) => {
            console.error("Error sending module operation to ESP32:", error);
          });
          
          return updatedModule;
        }
        return module;
      });
      
      return { modules };
    });
  },

  // Enhanced warning system with detailed notifications
  getModuleWarnings: () => {
    const state = get();
    const warnings: Array<{
      moduleId: string;
      moduleName: string;
      type: 'critical' | 'warning' | 'maintenance';
      message: string;
      priority: number;
    }> = [];

    state.modules.forEach(module => {
      // Critical level warnings
      if (module.status === 'critical') {
        warnings.push({
          moduleId: module.id,
          moduleName: module.name,
          type: 'critical',
          message: `${module.name} is empty and needs immediate refill`,
          priority: 1
        });
      }
      
      // Low level warnings
      else if (module.status === 'warning') {
        warnings.push({
          moduleId: module.id,
          moduleName: module.name,
          type: 'warning',
          message: `${module.name} is running low (${module.currentLevel}/${module.maxLevel} ${module.unit})`,
          priority: 2
        });
      }
      
      // Maintenance warnings for specific module types
      if (['grinding', 'chopping', 'heating'].includes(module.id)) {
        const lastMaintenance = module.lastOperation?.timestamp || 0;
        const hoursSinceLastOperation = (Date.now() - lastMaintenance) / (1000 * 60 * 60);
        
        if (hoursSinceLastOperation > 24) { // 24 hours without maintenance
          warnings.push({
            moduleId: module.id,
            moduleName: module.name,
            type: 'maintenance',
            message: `${module.name} may need maintenance check`,
            priority: 3
          });
        }
      }
    });

    return warnings.sort((a, b) => a.priority - b.priority);
  },

  // Batch refill function for maintenance
  performMaintenanceRefill: () => {
    const state = get();
    const moduleUpdates: {id: string, data: Partial<Module>}[] = [];
    
    const updatedModules = state.modules.map(module => {
      if (module.status === 'critical' || module.status === 'warning') {
        const lastOperation = {
          type: 'refill',
          timestamp: Date.now(),
          operation: `Maintenance refill to ${module.maxLevel} ${module.unit}`,
          amount: module.maxLevel - module.currentLevel
        };
        
        const updatedModule = {
          ...module,
          currentLevel: module.maxLevel,
          status: 'normal' as const,
          lastOperation
        };
        
        moduleUpdates.push({
          id: module.id,
          data: {
            currentLevel: module.maxLevel,
            status: 'normal',
            lastOperation
          }
        });
        
        return updatedModule;
      }
      return module;
    });
    
    // Batch update modules in Firebase
    if (moduleUpdates.length > 0) {
      firebaseService.updateModulesBatch(moduleUpdates);
    }
    
    set({ modules: updatedModules });
  },

  // ...existing code...
}));

// Create a hook to initialize Firebase data when the app loads
export const useFirebaseInit = () => {
  useEffect(() => {
    useAppStore.getState().fetchDataFromFirebase();
  }, []);
};