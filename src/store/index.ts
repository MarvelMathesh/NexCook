import { create } from 'zustand';
import { AppState, Recipe, Customization } from '../types';
import { initialModules, initialRecipes } from './initialData';
import { firebaseService } from '../services/firebase';
import { uartService } from '../services/uartService';

// Initialize Firebase with default data when the app starts
// We do this outside the store to ensure it happens only once
console.log("Initializing with updated modules:", initialModules.length, "recipes:", initialRecipes.length);
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
  applyStatusUpdates: (statusUpdates: { id: string; alert: boolean }[]) => void;
  applyModuleCommands: (moduleCommands: { id: string; change: number }[]) => void;
}>((set, get) => ({
    currentScreen: 'home',
  selectedRecipe: null,
  modules: initialModules, // Will be overwritten by Firebase data
  recipes: initialRecipes, // Will be overwritten by Firebase data
  customization: {
    salt: 50,
    spice: 50,
    water: 50,
    oil: 50,
    temperature: 50,
    grinding: 50,
    chopping: 50,
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
        cart: appState.cart || [],        customization: appState.customization || {
          salt: 50,
          spice: 50,
          water: 50,
          oil: 50,
          temperature: 50,
          grinding: 50,
          chopping: 50,
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
      const modules = state.modules.map((module) => {        if (module.id === moduleId) {
          const newLevel = Math.max(0, Math.min(module.maxLevel, module.currentLevel - amount));
          const newStatus: 'normal' | 'warning' | 'critical' = newLevel <= module.threshold ? (newLevel === 0 ? 'critical' : 'warning') : 'normal';
          
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

    if (!state.selectedRecipe) {
      console.warn("Cannot start cooking: No recipe selected");
      return state;
    }

    // Send recipe to ESP32 and start polling for commands
    uartService.sendRecipe(state.selectedRecipe, state.customization)
      .then(response => {
        if (response.success) {
          console.log("Successfully sent recipe to ESP32:", response.message);
          
          // Start polling for ESP32 commands
          const pollInterval = setInterval(async () => {
            try {
              const commandsResponse = await uartService.getESP32Commands();
              
              if (commandsResponse.success && commandsResponse.commands && commandsResponse.commands.length > 0) {
                const processedCommands: string[] = [];
                
                commandsResponse.commands.forEach(command => {
                  console.log("Processing ESP32 command:", command.message);
                  
                  if (command.message.startsWith('STATUS:')) {
                    // Parse and apply status updates
                    const statusUpdates = uartService.parseStatusMessage(command.message);
                    get().applyStatusUpdates(statusUpdates);
                  } else if (command.message.startsWith('MODULE:')) {
                    // Parse and apply module commands
                    const moduleCommands = uartService.parseModuleMessage(command.message);
                    get().applyModuleCommands(moduleCommands);
                  }
                  
                  processedCommands.push(command.timestamp);
                });
                
                // Mark commands as processed
                if (processedCommands.length > 0) {
                  await uartService.clearESP32Commands(processedCommands);
                }
              }
            } catch (error) {
              console.error("Error polling ESP32 commands:", error);
            }
          }, 1000); // Poll every second
          
          // Store poll interval for cleanup (you might want to add this to state)
          // Clear interval when cooking is complete or stopped
          setTimeout(() => {
            clearInterval(pollInterval);
          }, (state.selectedRecipe?.cookingTime || 5) * 60 * 1000); // Stop polling after cooking time
          
        } else {
          console.error("Failed to send recipe to ESP32:", response.error);
        }
      })
      .catch(error => {
        console.error("Error sending recipe to ESP32:", error);
      });

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
      recipes: updatedRecipes,
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

  // Handle status updates from ESP32
  applyStatusUpdates: (statusUpdates) => {
    set((state) => {
      const modules = state.modules.map((module) => {
        const update = statusUpdates.find((s) => s.id === module.id);
        if (update) {
          return {
            ...module,
            alert: update.alert,
          };
        }
        return module;
      });
      
      return { modules };
    });
  },
  
  // Handle module commands from ESP32
  applyModuleCommands: (moduleCommands) => {
    set((state) => {
      const modules = state.modules.map((module) => {
        const command = moduleCommands.find((c) => c.id === module.id);
        if (command) {
          const newLevel = Math.max(0, Math.min(module.maxLevel, module.currentLevel + command.change));
          const newStatus: 'normal' | 'warning' | 'critical' = newLevel <= module.threshold ? (newLevel === 0 ? 'critical' : 'warning') : 'normal';
          
          // Update module in Firebase (debounced)
          const updatedModule = {
            ...module,
            currentLevel: newLevel,
            status: newStatus,
          };
          
          firebaseService.updateModule(module.id, updatedModule);
          
          return updatedModule;
        }
        return module;
      });
      
      return { modules };
    });
  },
}));