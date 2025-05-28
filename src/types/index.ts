export interface Module {
  id: string;
  name: string;
  currentLevel: number;
  maxLevel: number;
  threshold: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
  moduleType: 'dispenser' | 'processor' | 'heater' | 'cleaner';
  operationMode?: 'continuous' | 'batch' | 'timed';
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  cookingTime: number;
  ingredients: Ingredient[];
  steps: string[];
  imageUrl: string;
  rating: number;
  timesCooked: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  moduleId: string;
  processingSteps?: ProcessingStep[];
}

export interface ProcessingStep {
  moduleId: string;
  operation: string;
  duration?: number;
  temperature?: number;
  speed?: number;
  parameters?: Record<string, any>;
}

export interface Customization {
  salt: number;
  spice: number;
  water: number;
  oil: number;
  temperature: number;
  grinding: number;
  chopping: number;
}

export interface CartItem {
  recipeId: string;
  quantity: number;
  customization: Customization;
}

export type CookingStatus = 'idle' | 'preparing' | 'cooking' | 'complete' | 'failed';

export interface CookingQueue {
  items: CartItem[];
  currentItem: number;
  status: CookingStatus;
}

export type AppScreen = 
  | 'home' 
  | 'recipes' 
  | 'recipe-details' 
  | 'customize' 
  | 'cooking' 
  | 'rating'
  | 'cart';

export interface AppState {
  currentScreen: AppScreen;
  selectedRecipe: Recipe | null;
  modules: Module[];
  recipes: Recipe[];
  customization: Customization;
  cookingProgress: number;
  cookingStep: number;
  ratingValue: number;
  cart: CartItem[];
  cookingQueue: CookingQueue;
}