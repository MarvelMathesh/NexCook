import { Module } from '../types';
import { esp32Service, ModuleStatusUpdate, ModuleLevelUpdate } from './esp32Service';
import { firebaseService } from './firebaseService';

/**
 * ModuleService - Handles module state, thresholds, and alerts
 * Manages the synchronization between ESP32 hardware state and Firebase
 */
export class ModuleService {
  private static instance: ModuleService;
  private modules: Module[] = [];
  private moduleListeners: ((modules: Module[]) => void)[] = [];
  private alertListeners: ((alerts: ModuleAlert[]) => void)[] = [];
  private esp32Unsubscribe: (() => void) | null = null;
  private firebaseUnsubscribe: (() => void) | null = null;

  private constructor() {
    // ESP32 listeners will be initialized in initialize() method
  }

  public static getInstance(): ModuleService {
    if (!ModuleService.instance) {
      ModuleService.instance = new ModuleService();
    }
    return ModuleService.instance;
  }

  /**
   * Initialize the service with modules from Firebase
   */
  public async initialize(): Promise<void> {
    try {
      // Load modules from Firebase
      const firebaseModules = await firebaseService.getModules();
      this.modules = firebaseModules;
      this.notifyModuleListeners();

      // Subscribe to Firebase changes
      this.firebaseUnsubscribe = firebaseService.subscribeToModules((updatedModules) => {
        this.modules = updatedModules;
        this.notifyModuleListeners();
      });
    } catch (error) {
      console.warn('Failed to load modules from Firebase, using local data:', error);
      // Continue with empty modules array - ESP32 will populate them
      this.modules = [];
      this.notifyModuleListeners();
    }

    // Always initialize ESP32 listeners regardless of Firebase status
    this.initializeESP32Listeners();
  }

  /**
   * Get all modules
   */
  public getModules(): Module[] {
    return [...this.modules];
  }

  /**
   * Get a specific module by ID
   */
  public getModule(moduleId: string): Module | null {
    return this.modules.find(module => module.id === moduleId) || null;
  }

  /**
   * Subscribe to module alerts
   */
  public subscribeToAlerts(callback: (alerts: ModuleAlert[]) => void): () => void {
    this.alertListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertListeners.indexOf(callback);
      if (index > -1) {
        this.alertListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to module updates
   */
  public subscribeToModules(callback: (modules: Module[]) => void): () => void {
    this.moduleListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.moduleListeners.indexOf(callback);
      if (index > -1) {
        this.moduleListeners.splice(index, 1);
      }
    };
  }

  /**
   * Update module level (from UI or ESP32)
   */
  public async updateModuleLevel(moduleId: string, change: number): Promise<boolean> {
    const moduleIndex = this.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) {
      console.error(`Module ${moduleId} not found`);
      return false;
    }

    const module = this.modules[moduleIndex];
    const newLevel = Math.max(0, Math.min(module.maxLevel, module.currentLevel + change));
    
    // Update local state
    const updatedModule: Module = {
      ...module,
      currentLevel: newLevel,
      status: this.calculateModuleStatus(newLevel, module.threshold, module.maxLevel)
    };

    this.modules[moduleIndex] = updatedModule;
    
    try {
      // Sync to Firebase
      await firebaseService.updateModule(updatedModule);
      
      // Notify listeners
      this.notifyModuleListeners();
      
      // Check for alerts
      this.checkAndNotifyAlerts([updatedModule]);
      
      return true;
    } catch (error) {
      console.error(`Failed to update module ${moduleId}:`, error);
      return false;
    }
  }

  /**
   * Process status updates from ESP32
   */
  public async processStatusUpdates(statusUpdates: ModuleStatusUpdate[]): Promise<void> {
    const updatedModules: Module[] = [];
    
    for (const update of statusUpdates) {
      const moduleIndex = this.modules.findIndex(m => m.id === update.moduleId);
      if (moduleIndex !== -1) {
        const module = this.modules[moduleIndex];
        const newStatus = update.alert ? 'critical' : 'normal';
        
        if (module.status !== newStatus) {
          const updatedModule: Module = {
            ...module,
            status: newStatus
          };
          
          this.modules[moduleIndex] = updatedModule;
          updatedModules.push(updatedModule);
        }
      }
    }

    if (updatedModules.length > 0) {
      try {
        // Batch update to Firebase
        await Promise.all(
          updatedModules.map(module => firebaseService.updateModule(module))
        );
        
        // Notify listeners
        this.notifyModuleListeners();
        this.checkAndNotifyAlerts(updatedModules);
      } catch (error) {
        console.error('Failed to process status updates:', error);
      }
    }
  }

  /**
   * Process module level updates from ESP32
   */
  public async processLevelUpdates(levelUpdates: ModuleLevelUpdate[]): Promise<void> {
    const updatedModules: Module[] = [];
    
    for (const update of levelUpdates) {
      const moduleIndex = this.modules.findIndex(m => m.id === update.moduleId);
      if (moduleIndex !== -1) {
        const module = this.modules[moduleIndex];
        const newLevel = Math.max(0, Math.min(module.maxLevel, module.currentLevel + update.change));
        
        const updatedModule: Module = {
          ...module,
          currentLevel: newLevel,
          status: this.calculateModuleStatus(newLevel, module.threshold, module.maxLevel)
        };
        
        this.modules[moduleIndex] = updatedModule;
        updatedModules.push(updatedModule);
      }
    }

    if (updatedModules.length > 0) {
      try {
        // Batch update to Firebase
        await Promise.all(
          updatedModules.map(module => firebaseService.updateModule(module))
        );
        
        // Notify listeners
        this.notifyModuleListeners();
        this.checkAndNotifyAlerts(updatedModules);
      } catch (error) {
        console.error('Failed to process level updates:', error);
      }
    }
  }

  /**
   * Refill a module to maximum capacity
   */
  public async refillModule(moduleId: string): Promise<boolean> {
    const module = this.getModule(moduleId);
    if (!module) {
      return false;
    }

    const refillAmount = module.maxLevel - module.currentLevel;
    return await this.updateModuleLevel(moduleId, refillAmount);
  }

  /**
   * Refill all modules to maximum capacity
   */
  public async refillAllModules(): Promise<boolean> {
    try {
      const refillPromises = this.modules.map(module => {
        const refillAmount = module.maxLevel - module.currentLevel;
        return this.updateModuleLevel(module.id, refillAmount);
      });
      
      const results = await Promise.all(refillPromises);
      return results.every(result => result);
    } catch (error) {
      console.error('Failed to refill all modules:', error);
      return false;
    }
  }

  /**
   * Get modules that are in critical or warning state
   */
  public getAlertsModules(): Module[] {
    return this.modules.filter(module => 
      module.status === 'critical' || module.status === 'warning'
    );
  }

  /**
   * Subscribe to module changes
   */
  public onModulesChange(listener: (modules: Module[]) => void): () => void {
    this.moduleListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.moduleListeners.indexOf(listener);
      if (index > -1) {
        this.moduleListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to module alerts
   */
  public onAlerts(listener: (alerts: ModuleAlert[]) => void): () => void {
    this.alertListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertListeners.indexOf(listener);
      if (index > -1) {
        this.alertListeners.splice(index, 1);
      }
    };
  }

  /**
   * Calculate module status based on current level and threshold
   */
  private calculateModuleStatus(currentLevel: number, threshold: number, maxLevel: number): Module['status'] {
    if (currentLevel === 0) {
      return 'critical';
    } else if (currentLevel <= threshold) {
      return 'warning';
    } else {
      return 'normal';
    }
  }

  /**
   * Initialize ESP32 command listeners
   */
  private initializeESP32Listeners(): void {
    this.esp32Unsubscribe = esp32Service.onCommands(async (commands) => {
      const statusUpdates: ModuleStatusUpdate[] = [];
      const levelUpdates: ModuleLevelUpdate[] = [];
      
      for (const command of commands) {
        if (command.message.startsWith('STATUS:')) {
          const updates = esp32Service.parseStatusMessage(command.message);
          statusUpdates.push(...updates);
        } else if (command.message.startsWith('MODULE:')) {
          const updates = esp32Service.parseModuleMessage(command.message);
          levelUpdates.push(...updates);
        }
      }
      
      // Process updates
      if (statusUpdates.length > 0) {
        await this.processStatusUpdates(statusUpdates);
      }
      
      if (levelUpdates.length > 0) {
        await this.processLevelUpdates(levelUpdates);
      }
      
      // Clear processed commands
      await esp32Service.clearCommands();
    });
  }

  /**
   * Check for alerts and notify listeners
   */
  private checkAndNotifyAlerts(updatedModules: Module[]): void {
    const alerts: ModuleAlert[] = updatedModules
      .filter(module => module.status === 'critical' || module.status === 'warning')
      .map(module => ({
        moduleId: module.id,
        moduleName: module.name,
        status: module.status,
        currentLevel: module.currentLevel,
        threshold: module.threshold,
        maxLevel: module.maxLevel,
        unit: module.unit,
        timestamp: new Date().toISOString()
      }));
    
    if (alerts.length > 0) {
      this.notifyAlertListeners(alerts);
    }
  }

  private notifyModuleListeners(): void {
    this.moduleListeners.forEach(listener => listener([...this.modules]));
  }

  private notifyAlertListeners(alerts: ModuleAlert[]): void {
    this.alertListeners.forEach(listener => listener(alerts));
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.esp32Unsubscribe) {
      this.esp32Unsubscribe();
    }
    if (this.firebaseUnsubscribe) {
      this.firebaseUnsubscribe();
    }
    this.moduleListeners = [];
    this.alertListeners = [];
  }
}

// Types
export interface ModuleAlert {
  moduleId: string;
  moduleName: string;
  status: 'warning' | 'critical';
  currentLevel: number;
  threshold: number;
  maxLevel: number;
  unit: string;
  timestamp: string;
}

// Export singleton instance
export const moduleService = ModuleService.getInstance();