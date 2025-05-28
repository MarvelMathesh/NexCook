import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  AppState, 
  Recipe, 
  Module, 
  Customization, 
  CartItem, 
  CookingStatus,
  AppScreen,
  AppError
} from '../types';
import { esp32Service } from '../services/esp32Service';
import { moduleService } from '../services/moduleService';
import { recipeService } from '../services/recipeService';
import { firebaseService } from '../services/firebaseService';

/**
 * Clean Zustand Store - Single Source of Truth
 * Uses services for business logic, only manages UI state and data synchronization
 */
interface AppStore extends AppState {
  // Initialization
  isInitialized: boolean;
  initializeApp: () => Promise<void>;
  
  // Navigation Actions
  setCurrentScreen: (screen: AppScreen) => void;
  
  // Recipe Actions
  selectRecipe: (recipe: Recipe | null) => void;
  
  // Customization Actions
  updateCustomization: (field: keyof Customization, value: number) => void;
  resetCustomization: () => void;
  
  // Cart Actions
  addToCart: (recipeId: string, quantity: number, customization: Customization) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Cooking Actions
  startCooking: () => Promise<boolean>;
  stopCooking: () => void;
  
  // Module Actions
  refillModule: (moduleId: string) => Promise<boolean>;
  refillAllModules: () => Promise<boolean>;
  
  // Rating Actions
  setRating: (rating: number) => void;
  
  // Error Handling
  errors: AppError[];
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  
  // System Actions
  setOnlineStatus: (isOnline: boolean) => void;
  syncWithFirebase: () => Promise<void>;
}

const defaultCustomization: Customization = {
  salt: 50,
  spice: 50,
  water: 50,
  oil: 50,
  temperature: 50,
  grinding: 50,
  chopping: 50,
};

export const useAppStore = create<AppStore>()(subscribeWithSelector((set, get) => ({
  // Initial State
  isInitialized: false,
  currentScreen: 'home',
  modules: [],
  recipes: [],
  selectedRecipe: null,
  customization: defaultCustomization,
  cart: [],
  cookingQueue: {
    items: [],
    currentItem: 0,
    status: 'idle'
  },
  cookingProgress: 0,
  cookingStep: 0,
  ratingValue: 0,
  isOnline: navigator.onLine,
  errors: [],
  
  // Initialization
  initializeApp: async () => {
    try {
      // Set up service listeners BEFORE initialization to avoid race conditions
      setupServiceListeners(set, get);
      
      // Initialize services with error handling
      try {
        await firebaseService.initialize();
      } catch (error) {
        console.warn('Firebase initialization failed, continuing with local data:', error);
      }
      
      await moduleService.initialize();
      await recipeService.initialize();
      
      // Load initial data (listeners will handle updates)
      const modules = moduleService.getModules();
      const recipes = recipeService.getRecipes();
      
      set({ 
        modules,
        recipes,
        isInitialized: true 
      });
      
      // Sync with Firebase
      await get().syncWithFirebase();
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      get().addError({
        type: 'system',
        message: 'Failed to initialize application',
        details: error,
        resolved: false
      });
    }
  },
  
  // Navigation Actions
  setCurrentScreen: (screen: AppScreen) => {
    set({ currentScreen: screen });
  },
  
  // Recipe Actions
  selectRecipe: (recipe: Recipe | null) => {
    set({ selectedRecipe: recipe });
  },
  
  // Customization Actions
  updateCustomization: (field: keyof Customization, value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    set(state => ({
      customization: {
        ...state.customization,
        [field]: clampedValue
      }
    }));
  },
  
  resetCustomization: () => {
    set({ customization: defaultCustomization });
  },
  
  // Cart Actions
  addToCart: (recipeId: string, quantity: number, customization: Customization) => {
    const recipe = get().recipes.find(r => r.id === recipeId);
    if (!recipe) {
      get().addError({
        type: 'validation',
        message: `Recipe ${recipeId} not found`,
        resolved: false
      });
      return;
    }
    
    const cartItem: CartItem = {
      id: `${recipeId}-${Date.now()}`,
      recipeId,
      quantity: Math.max(1, quantity),
      customization: { ...customization },
      addedAt: new Date().toISOString()
    };
    
    set(state => ({
      cart: [...state.cart, cartItem]
    }));
    
    // Add to recipe service queue
    recipeService.addToQueue(recipeId, quantity, customization);
  },
  
  removeFromCart: (itemId: string) => {
    set(state => ({
      cart: state.cart.filter(item => item.id !== itemId)
    }));
    
    // Remove from recipe service queue
    recipeService.removeFromQueue(itemId);
  },
  
  updateCartItem: (itemId: string, quantity: number) => {
    const clampedQuantity = Math.max(1, quantity);
    set(state => ({
      cart: state.cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: clampedQuantity }
          : item
      )
    }));
  },
  
  clearCart: () => {
    set({ cart: [] });
    recipeService.clearQueue();
  },
  
  // Cooking Actions
  startCooking: async () => {
    try {
      const success = await recipeService.startQueue();
      if (!success) {
        get().addError({
          type: 'system',
          message: 'Failed to start cooking',
          resolved: false
        });
      }
      return success;
    } catch (error) {
      get().addError({
        type: 'system',
        message: 'Error starting cooking process',
        details: error,
        resolved: false
      });
      return false;
    }
  },
  
  stopCooking: () => {
    recipeService.stopCooking();
  },
  
  // Module Actions
  refillModule: async (moduleId: string) => {
    try {
      const success = await moduleService.refillModule(moduleId);
      if (!success) {
        get().addError({
          type: 'hardware',
          message: `Failed to refill module ${moduleId}`,
          resolved: false
        });
      }
      return success;
    } catch (error) {
      get().addError({
        type: 'hardware',
        message: `Error refilling module ${moduleId}`,
        details: error,
        resolved: false
      });
      return false;
    }
  },
  
  refillAllModules: async () => {
    try {
      const success = await moduleService.refillAllModules();
      if (!success) {
        get().addError({
          type: 'hardware',
          message: 'Failed to refill all modules',
          resolved: false
        });
      }
      return success;
    } catch (error) {
      get().addError({
        type: 'hardware',
        message: 'Error refilling modules',
        details: error,
        resolved: false
      });
      return false;
    }
  },
  
  // Rating Actions
  setRating: (rating: number) => {
    const clampedRating = Math.max(0, Math.min(5, rating));
    set({ ratingValue: clampedRating });
  },
  
  // Error Handling
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };
    
    set(state => ({
      errors: [...state.errors, newError]
    }));
  },
  
  removeError: (errorId: string) => {
    set(state => ({
      errors: state.errors.filter(error => error.id !== errorId)
    }));
  },
  
  clearErrors: () => {
    set({ errors: [] });
  },
  
  // System Actions
  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },
  
  syncWithFirebase: async () => {
    try {
      // Sync cart and customization to Firebase
      const state = get();
      firebaseService.updateAppState({
        cart: state.cart,
        customization: state.customization,
        cookingQueue: state.cookingQueue,
        lastSyncAt: new Date().toISOString()
      });
      
      set({ lastSyncAt: new Date().toISOString() });
    } catch (error) {
      console.error('Failed to sync with Firebase:', error);
      get().addError({
        type: 'network',
        message: 'Failed to sync data with cloud',
        details: error,
        resolved: false
      });
    }
  }
})));

/**
 * Set up listeners for service events
 */
function setupServiceListeners(
  set: (partial: Partial<AppStore>) => void,
  get: () => AppStore
) {
  // Module service listeners
  moduleService.onModulesChange((modules) => {
    set({ modules });
  });
  
  moduleService.onAlerts((alerts) => {
    alerts.forEach(alert => {
      get().addError({
        type: 'hardware',
        message: `Module ${alert.moduleName} is ${alert.status}`,
        details: alert,
        resolved: false
      });
    });
  });
  
  // Recipe service listeners
  recipeService.onRecipesChange((recipes) => {
    set({ recipes });
  });
  
  recipeService.onQueueChange((queue, currentIndex, status) => {
    set({
      cookingQueue: {
        items: queue.map(item => ({
          id: item.id,
          recipeId: item.recipe.id,
          quantity: item.quantity,
          customization: item.customization,
          addedAt: item.addedAt
        })),
        currentItem: currentIndex,
        status
      }
    });
  });
  
  recipeService.onProgressChange((progress, step, recipe) => {
    set({
      cookingProgress: progress,
      cookingStep: step,
      selectedRecipe: recipe
    });
  });
  
  recipeService.onCookingComplete((recipe, success) => {
    if (success) {
      // Navigate to rating screen
      set({ currentScreen: 'rating' });
    } else {
      get().addError({
        type: 'system',
        message: `Failed to complete recipe: ${recipe.name}`,
        resolved: false
      });
    }
  });
  
  // ESP32 service listeners
  esp32Service.onConnectionChange((connected) => {
    if (!connected) {
      get().addError({
        type: 'hardware',
        message: 'Lost connection to cooking hardware',
        resolved: false
      });
    }
  });
  
  // Online/offline listeners
  const handleOnline = () => get().setOnlineStatus(true);
  const handleOffline = () => get().setOnlineStatus(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
}

// Auto-sync with Firebase when cart or customization changes
useAppStore.subscribe(
  (state) => ({ cart: state.cart, customization: state.customization }),
  (current, previous) => {
    if (current.cart !== previous.cart || current.customization !== previous.customization) {
      // Debounce the sync to avoid too many calls
      setTimeout(() => {
        useAppStore.getState().syncWithFirebase();
      }, 1000);
    }
  },
  { equalityFn: (a, b) => a.cart === b.cart && a.customization === b.customization }
);