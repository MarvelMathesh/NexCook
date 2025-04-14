import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Recipe, Module, CartItem, Customization } from '../types';
import { initialModules } from './initialData';
import { initialRecipes } from './initialData';

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
}>()(
  persist(
    (set, get) => ({
      currentScreen: 'home',
      selectedRecipe: null,
      modules: initialModules,
      recipes: initialRecipes,
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

      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      
      selectRecipe: (recipe) => {
        console.log("Selecting recipe:", recipe);
        set({ selectedRecipe: recipe });
      },
      
      updateModuleLevel: (moduleId, amount) => set((state) => ({
        modules: state.modules.map((module) => {
          if (module.id === moduleId) {
            const newLevel = Math.max(0, Math.min(module.maxLevel, module.currentLevel - amount));
            return {
              ...module,
              currentLevel: newLevel,
              status: newLevel <= module.threshold ? 'warning' : 'normal',
            };
          }
          return module;
        }),
      })),
      
      updateCustomization: (field, value) => set((state) => ({
        customization: {
          ...state.customization,
          [field]: value,
        },
      })),
      
      setCookingProgress: (progress) => set({ cookingProgress: progress }),
      
      setCookingStep: (step) => set({ cookingStep: step }),
      
      setRating: (rating) => set({ ratingValue: rating }),
      
      resetCooking: () => set({
        cookingProgress: 0,
        cookingStep: 0,
        ratingValue: 0,
        cookingQueue: {
          ...get().cookingQueue,
          status: 'idle'
        }
      }),
      
      startCooking: () => set((state) => {
        // Simulate using ingredients from each module
        const updatedModules = [...state.modules];
        
        if (state.selectedRecipe) {
          state.selectedRecipe.ingredients.forEach(ingredient => {
            const moduleIndex = updatedModules.findIndex(m => m.id === ingredient.moduleId);
            if (moduleIndex >= 0) {
              updatedModules[moduleIndex] = {
                ...updatedModules[moduleIndex],
                currentLevel: Math.max(0, updatedModules[moduleIndex].currentLevel - ingredient.quantity),
              };

              // Update status based on new level
              if (updatedModules[moduleIndex].currentLevel <= updatedModules[moduleIndex].threshold) {
                updatedModules[moduleIndex].status = 'warning';
              }
              if (updatedModules[moduleIndex].currentLevel === 0) {
                updatedModules[moduleIndex].status = 'critical';
              }
            }
          });
          
          // Update the recipe's statistics
          const updatedRecipes = state.recipes.map(recipe => 
            recipe.id === state.selectedRecipe.id 
              ? { ...recipe, timesCooked: recipe.timesCooked + 1 } 
              : recipe
          );
          
          return {
            modules: updatedModules,
            recipes: updatedRecipes,
            currentScreen: 'cooking',
            cookingQueue: {
              ...state.cookingQueue,
              status: 'cooking'
            }
          };
        }
        
        return { 
          currentScreen: 'cooking',
          cookingQueue: {
            ...state.cookingQueue,
            status: 'cooking'
          }
        };
      }),

      addToCart: (recipeId, quantity, customization) => {
        set((state) => {
          const existingItemIndex = state.cart.findIndex(item => item.recipeId === recipeId);
          
          if (existingItemIndex !== -1) {
            // Update existing item
            const updatedCart = [...state.cart];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + quantity
            };
            return { cart: updatedCart };
          } else {
            // Add new item
            return { 
              cart: [...state.cart, { recipeId, quantity, customization }],
              currentScreen: 'cart'
            };
          }
        });
      },

      removeFromCart: (index) => {
        set((state) => ({
          cart: state.cart.filter((_, i) => i !== index)
        }));
      },

      updateCartItem: (index, quantity) => {
        set((state) => {
          const updatedCart = [...state.cart];
          if (updatedCart[index]) {
            updatedCart[index] = { ...updatedCart[index], quantity };
          }
          return { cart: updatedCart };
        });
      },

      clearCart: () => set({ cart: [] }),

      processNextQueueItem: () => {
        const state = get();
        const queue = state.cookingQueue;
        
        // If we've completed all items, reset the queue
        if (queue.currentItem >= queue.items.length) {
          set({
            cookingQueue: {
              items: [],
              currentItem: 0,
              status: 'idle'
            }
          });
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
          set(state => ({
            cookingQueue: {
              ...state.cookingQueue,
              currentItem: state.cookingQueue.currentItem + 1
            }
          }));
        }
      },

      startCookingQueue: () => {
        const state = get();
        
        // Initialize the cooking queue with items from the cart
        set({
          cookingQueue: {
            items: [...state.cart],
            currentItem: 0,
            status: 'preparing'
          },
          cart: [], // Clear the cart
          currentScreen: 'cooking'
        });
        
        // Process the first item
        setTimeout(() => {
          get().processNextQueueItem();
        }, 500);
      }
    }),
    {
      name: 'nexcook-storage',
      partialize: (state) => ({
        modules: state.modules,
        recipes: state.recipes,
        cart: state.cart
      }),
    }
  )
);