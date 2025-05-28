// Core Entity Types
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
  lastUpdated?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  cookingTime: number; // in minutes
  ingredients: Ingredient[];
  steps: string[];
  imageUrl: string;
  rating: number;
  timesCooked: number;
  lastUpdated?: string;
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
  duration?: number; // in seconds
  temperature?: number; // in celsius
  speed?: number; // percentage
  parameters?: Record<string, any>;
}

// User Interaction Types
export interface Customization {
  salt: number; // 0-100 percentage
  spice: number; // 0-100 percentage
  water: number; // 0-100 percentage
  oil: number; // 0-100 percentage
  temperature: number; // 0-100 percentage
  grinding: number; // 0-100 percentage
  chopping: number; // 0-100 percentage
}

export interface CartItem {
  id: string;
  recipeId: string;
  quantity: number;
  customization: Customization;
  addedAt: string;
}

// Cooking System Types
export type CookingStatus = 'idle' | 'preparing' | 'cooking' | 'complete' | 'failed';

export interface CookingQueue {
  items: CartItem[];
  currentItem: number;
  status: CookingStatus;
}

export interface CookingProgress {
  recipeId: string;
  recipeName: string;
  progress: number; // 0-100 percentage
  currentStep: number;
  totalSteps: number;
  estimatedTimeRemaining: number; // in seconds
  startedAt: string;
  status: CookingStatus;
}

// Navigation Types
export type AppScreen = 
  | 'home' 
  | 'recipes' 
  | 'recipe-details' 
  | 'customize' 
  | 'cooking' 
  | 'rating'
  | 'cart';

// State Management Types
export interface AppState {
  // Navigation
  currentScreen: AppScreen;
  
  // Core Data
  modules: Module[];
  recipes: Recipe[];
  
  // User State
  selectedRecipe: Recipe | null;
  customization: Customization;
  cart: CartItem[];
  
  // Cooking State
  cookingQueue: CookingQueue;
  cookingProgress: number;
  cookingStep: number;
  
  // UI State
  ratingValue: number;
  
  // System State
  isOnline: boolean;
  lastSyncAt?: string;
}

// Service Communication Types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ESP32Command {
  id: string;
  type: 'STATUS' | 'MODULE' | 'RECIPE_ACK' | 'ERROR';
  message: string;
  timestamp: string;
  processed: boolean;
}

export interface ModuleStatusUpdate {
  moduleId: string;
  alert: boolean;
  timestamp: string;
}

export interface ModuleLevelUpdate {
  moduleId: string;
  change: number; // positive for addition, negative for consumption
  timestamp: string;
}

// Error Handling Types
export interface AppError {
  id: string;
  type: 'network' | 'hardware' | 'validation' | 'system';
  message: string;
  details?: any;
  timestamp: string;
  resolved: boolean;
}

// Event Types
export interface SystemEvent {
  id: string;
  type: 'module_alert' | 'recipe_complete' | 'cooking_start' | 'cooking_stop' | 'error';
  data: any;
  timestamp: string;
}

// Configuration Types
export interface AppConfig {
  esp32: {
    backendUrl: string;
    pollingInterval: number;
    connectionTimeout: number;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  ui: {
    theme: 'dark' | 'light';
    animations: boolean;
    notifications: boolean;
  };
}

// Validation Types
export interface ValidationRule {
  field: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp: string;
}

export interface UsageStatistics {
  recipesCooked: number;
  favoriteRecipes: string[];
  averageCookingTime: number;
  moduleUsage: Record<string, number>;
  lastActiveAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchFilters {
  category?: string;
  cookingTime?: {
    min?: number;
    max?: number;
  };
  difficulty?: 'easy' | 'medium' | 'hard';
  rating?: {
    min?: number;
  };
  ingredients?: string[];
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: AppError;
}

// Hook Return Types
export interface UseAsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  spacing: Record<string, string>;
  typography: Record<string, any>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
}

// Export commonly used type unions
export type ModuleStatus = Module['status'];
export type ModuleType = Module['moduleType'];
export type OperationMode = NonNullable<Module['operationMode']>;
export type RecipeCategory = Recipe['category'];
export type SystemEventType = SystemEvent['type'];
export type ErrorType = AppError['type'];