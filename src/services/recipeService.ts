import { Recipe, Customization, CartItem, CookingStatus } from '../types';
import { esp32Service } from './esp32Service';
import { firebaseService } from './firebaseService';
import { moduleService } from './moduleService';

/**
 * RecipeService - Manages recipe selection, mapping, and flow control
 * Handles the cooking workflow and queue management
 */
export class RecipeService {
  private static instance: RecipeService;
  private recipes: Recipe[] = [];
  private currentRecipe: Recipe | null = null;
  private cookingQueue: CookingQueueItem[] = [];
  private currentQueueIndex: number = 0;
  private cookingStatus: CookingStatus = 'idle';
  private cookingProgress: number = 0;
  private cookingStep: number = 0;
  
  private recipeListeners: ((recipes: Recipe[]) => void)[] = [];
  private queueListeners: ((queue: CookingQueueItem[], currentIndex: number, status: CookingStatus) => void)[] = [];
  private progressListeners: ((progress: number, step: number, recipe: Recipe | null) => void)[] = [];
  private completionListeners: ((recipe: Recipe, success: boolean) => void)[] = [];
  private firebaseUnsubscribe: (() => void) | null = null;
  
  private cookingTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): RecipeService {
    if (!RecipeService.instance) {
      RecipeService.instance = new RecipeService();
    }
    return RecipeService.instance;
  }

  /**
   * Initialize the service with recipes from Firebase
   */
  public async initialize(): Promise<void> {
    try {
      // Load recipes from Firebase
      const firebaseRecipes = await firebaseService.getRecipes();
      this.recipes = firebaseRecipes;
      this.notifyRecipeListeners();

      // Subscribe to Firebase changes
      this.firebaseUnsubscribe = firebaseService.subscribeToRecipes((updatedRecipes) => {
        this.recipes = updatedRecipes;
        this.notifyRecipeListeners();
      });
    } catch (error) {
      console.warn('Failed to load recipes from Firebase, using local data:', error);
      // Continue with empty recipes array - can be populated later
      this.recipes = [];
      this.notifyRecipeListeners();
    }
  }

  /**
   * Get all recipes
   */
  public getRecipes(): Recipe[] {
    return [...this.recipes];
  }

  /**
   * Get a specific recipe by ID
   */
  public getRecipe(recipeId: string): Recipe | null {
    return this.recipes.find(recipe => recipe.id === recipeId) || null;
  }

  /**
   * Get recipes by category
   */
  public getRecipesByCategory(category: string): Recipe[] {
    return this.recipes.filter(recipe => recipe.category === category);
  }

  /**
   * Search recipes by name or description
   */
  public searchRecipes(query: string): Recipe[] {
    const lowercaseQuery = query.toLowerCase();
    return this.recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(lowercaseQuery) ||
      recipe.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Add recipe to cooking queue
   */
  public addToQueue(recipeId: string, quantity: number, customization: Customization): boolean {
    const recipe = this.getRecipe(recipeId);
    if (!recipe) {
      console.error(`Recipe ${recipeId} not found`);
      return false;
    }

    // Check if required modules are available
    const requiredModules = this.getRequiredModules(recipe);
    const unavailableModules = this.checkModuleAvailability(requiredModules);
    
    if (unavailableModules.length > 0) {
      console.warn('Some required modules are not available:', unavailableModules);
      // Still add to queue but mark as pending
    }

    const queueItem: CookingQueueItem = {
      id: `${recipeId}-${Date.now()}`,
      recipe,
      quantity,
      customization,
      status: 'pending',
      addedAt: new Date().toISOString(),
      requiredModules,
      unavailableModules
    };

    this.cookingQueue.push(queueItem);
    this.notifyQueueListeners();
    
    return true;
  }

  /**
   * Remove item from cooking queue
   */
  public removeFromQueue(itemId: string): boolean {
    const index = this.cookingQueue.findIndex(item => item.id === itemId);
    if (index === -1) {
      return false;
    }

    this.cookingQueue.splice(index, 1);
    
    // Adjust current index if necessary
    if (index < this.currentQueueIndex) {
      this.currentQueueIndex--;
    } else if (index === this.currentQueueIndex && this.cookingStatus === 'cooking') {
      // If we're removing the currently cooking item, stop cooking
      this.stopCooking();
    }

    this.notifyQueueListeners();
    return true;
  }

  /**
   * Clear the entire cooking queue
   */
  public clearQueue(): void {
    if (this.cookingStatus === 'cooking') {
      this.stopCooking();
    }
    
    this.cookingQueue = [];
    this.currentQueueIndex = 0;
    this.notifyQueueListeners();
  }

  /**
   * Start cooking the queue
   */
  public async startQueue(): Promise<boolean> {
    if (this.cookingQueue.length === 0) {
      console.warn('No items in cooking queue');
      return false;
    }

    if (this.cookingStatus === 'cooking') {
      console.warn('Already cooking');
      return false;
    }

    this.cookingStatus = 'preparing';
    this.currentQueueIndex = 0;
    this.notifyQueueListeners();

    return await this.processNextQueueItem();
  }

  /**
   * Process the next item in the queue
   */
  public async processNextQueueItem(): Promise<boolean> {
    if (this.currentQueueIndex >= this.cookingQueue.length) {
      // Queue completed
      this.cookingStatus = 'complete';
      this.notifyQueueListeners();
      return true;
    }

    const currentItem = this.cookingQueue[this.currentQueueIndex];
    if (!currentItem) {
      return false;
    }

    // Check module availability again
    const unavailableModules = this.checkModuleAvailability(currentItem.requiredModules);
    if (unavailableModules.length > 0) {
      currentItem.status = 'failed';
      currentItem.unavailableModules = unavailableModules;
      this.notifyCompletionListeners(currentItem.recipe, false);
      
      // Move to next item
      this.currentQueueIndex++;
      return await this.processNextQueueItem();
    }

    // Start cooking this item
    return await this.startCookingItem(currentItem);
  }

  /**
   * Start cooking a specific queue item
   */
  private async startCookingItem(item: CookingQueueItem): Promise<boolean> {
    try {
      this.currentRecipe = item.recipe;
      this.cookingStatus = 'cooking';
      this.cookingProgress = 0;
      this.cookingStep = 0;
      
      item.status = 'cooking';
      item.startedAt = new Date().toISOString();
      
      this.notifyQueueListeners();
      this.notifyProgressListeners();

      // Send recipe to ESP32
      const response = await esp32Service.sendRecipe(item.recipe, item.customization);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to send recipe to ESP32');
      }

      // Start cooking simulation/monitoring
      this.startCookingTimer(item);
      
      return true;
    } catch (error) {
      console.error('Failed to start cooking item:', error);
      item.status = 'failed';
      item.error = error instanceof Error ? error.message : 'Unknown error';
      
      this.notifyCompletionListeners(item.recipe, false);
      
      // Move to next item
      this.currentQueueIndex++;
      return await this.processNextQueueItem();
    }
  }

  /**
   * Start the cooking timer for progress tracking
   */
  private startCookingTimer(item: CookingQueueItem): void {
    const totalTime = item.recipe.cookingTime * 60 * 1000; // Convert to milliseconds
    const stepTime = totalTime / item.recipe.steps.length;
    const progressInterval = 1000; // Update every second
    
    let elapsed = 0;
    
    this.cookingTimer = setInterval(() => {
      elapsed += progressInterval;
      
      this.cookingProgress = Math.min(100, (elapsed / totalTime) * 100);
      this.cookingStep = Math.min(item.recipe.steps.length - 1, Math.floor(elapsed / stepTime));
      
      this.notifyProgressListeners();
      
      // Check if cooking is complete
      if (elapsed >= totalTime) {
        this.completeCookingItem(item);
      }
    }, progressInterval);
  }

  /**
   * Complete cooking for current item
   */
  private async completeCookingItem(item: CookingQueueItem): Promise<void> {
    if (this.cookingTimer) {
      clearInterval(this.cookingTimer);
      this.cookingTimer = null;
    }

    item.status = 'completed';
    item.completedAt = new Date().toISOString();
    
    this.cookingProgress = 100;
    this.cookingStep = item.recipe.steps.length - 1;
    
    // Update recipe statistics
    await this.updateRecipeStatistics(item.recipe.id);
    
    this.notifyProgressListeners();
    this.notifyCompletionListeners(item.recipe, true);
    
    // Move to next item after a brief delay
    setTimeout(async () => {
      this.currentQueueIndex++;
      await this.processNextQueueItem();
    }, 2000);
  }

  /**
   * Stop cooking (emergency stop)
   */
  public stopCooking(): void {
    if (this.cookingTimer) {
      clearInterval(this.cookingTimer);
      this.cookingTimer = null;
    }

    if (this.currentQueueIndex < this.cookingQueue.length) {
      const currentItem = this.cookingQueue[this.currentQueueIndex];
      if (currentItem) {
        currentItem.status = 'failed';
        currentItem.error = 'Cooking stopped by user';
      }
    }

    this.cookingStatus = 'idle';
    this.currentRecipe = null;
    this.cookingProgress = 0;
    this.cookingStep = 0;
    
    this.notifyQueueListeners();
    this.notifyProgressListeners();
  }

  /**
   * Get required modules for a recipe
   */
  private getRequiredModules(recipe: Recipe): string[] {
    const moduleIds = new Set<string>();
    
    recipe.ingredients.forEach(ingredient => {
      moduleIds.add(ingredient.moduleId);
      
      // Add processing modules if specified
      ingredient.processingSteps?.forEach(step => {
        moduleIds.add(step.moduleId);
      });
    });
    
    return Array.from(moduleIds);
  }

  /**
   * Check module availability for required modules
   */
  private checkModuleAvailability(requiredModuleIds: string[]): string[] {
    const unavailableModules: string[] = [];
    
    requiredModuleIds.forEach(moduleId => {
      const module = moduleService.getModule(moduleId);
      if (!module || module.status === 'critical') {
        unavailableModules.push(moduleId);
      }
    });
    
    return unavailableModules;
  }

  /**
   * Update recipe statistics (times cooked)
   */
  private async updateRecipeStatistics(recipeId: string): Promise<void> {
    try {
      const recipe = this.getRecipe(recipeId);
      if (recipe) {
        const updatedRecipe: Recipe = {
          ...recipe,
          timesCooked: recipe.timesCooked + 1
        };
        
        await firebaseService.updateRecipe(updatedRecipe);
        
        // Update local state
        const index = this.recipes.findIndex(r => r.id === recipeId);
        if (index !== -1) {
          this.recipes[index] = updatedRecipe;
          this.notifyRecipeListeners();
        }
      }
    } catch (error) {
      console.error('Failed to update recipe statistics:', error);
    }
  }

  /**
   * Get current cooking state
   */
  public getCookingState(): CookingState {
    return {
      status: this.cookingStatus,
      currentRecipe: this.currentRecipe,
      progress: this.cookingProgress,
      step: this.cookingStep,
      queue: [...this.cookingQueue],
      currentQueueIndex: this.currentQueueIndex
    };
  }

  // Event listeners
  public onRecipesChange(listener: (recipes: Recipe[]) => void): () => void {
    this.recipeListeners.push(listener);
    return () => {
      const index = this.recipeListeners.indexOf(listener);
      if (index > -1) this.recipeListeners.splice(index, 1);
    };
  }

  public onQueueChange(listener: (queue: CookingQueueItem[], currentIndex: number, status: CookingStatus) => void): () => void {
    this.queueListeners.push(listener);
    return () => {
      const index = this.queueListeners.indexOf(listener);
      if (index > -1) this.queueListeners.splice(index, 1);
    };
  }

  public onProgressChange(listener: (progress: number, step: number, recipe: Recipe | null) => void): () => void {
    this.progressListeners.push(listener);
    return () => {
      const index = this.progressListeners.indexOf(listener);
      if (index > -1) this.progressListeners.splice(index, 1);
    };
  }

  public onCookingComplete(listener: (recipe: Recipe, success: boolean) => void): () => void {
    this.completionListeners.push(listener);
    return () => {
      const index = this.completionListeners.indexOf(listener);
      if (index > -1) this.completionListeners.splice(index, 1);
    };
  }

  private notifyRecipeListeners(): void {
    this.recipeListeners.forEach(listener => listener([...this.recipes]));
  }

  private notifyQueueListeners(): void {
    this.queueListeners.forEach(listener => 
      listener([...this.cookingQueue], this.currentQueueIndex, this.cookingStatus)
    );
  }

  private notifyProgressListeners(): void {
    this.progressListeners.forEach(listener => 
      listener(this.cookingProgress, this.cookingStep, this.currentRecipe)
    );
  }

  private notifyCompletionListeners(recipe: Recipe, success: boolean): void {
    this.completionListeners.forEach(listener => listener(recipe, success));
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopCooking();
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }
    this.recipeListeners = [];
    this.queueListeners = [];
    this.progressListeners = [];
    this.completionListeners = [];
  }
}

// Types
export interface CookingQueueItem {
  id: string;
  recipe: Recipe;
  quantity: number;
  customization: Customization;
  status: 'pending' | 'cooking' | 'completed' | 'failed';
  addedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  requiredModules: string[];
  unavailableModules: string[];
}

export interface CookingState {
  status: CookingStatus;
  currentRecipe: Recipe | null;
  progress: number;
  step: number;
  queue: CookingQueueItem[];
  currentQueueIndex: number;
}

// Export singleton instance
export const recipeService = RecipeService.getInstance();