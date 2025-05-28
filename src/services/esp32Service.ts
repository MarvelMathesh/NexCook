import { Recipe, Customization, Module } from '../types';

/**
 * ESP32Service - Handles hardware-level communication
 * Implements the ESP32 communication protocol:
 * - RECIPE:<recipe-id>; for recipe commands
 * - STATUS:<module>=<status>,...; for module status alerts
 * - MODULE:<module>=<amount>,...; for module level updates
 */
export class ESP32Service {
  private static instance: ESP32Service;
  private backendUrl: string;
  private isConnected: boolean = false;
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private commandListeners: ((commands: ESP32Command[]) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLLING_INTERVAL = 2000; // 2 seconds

  private constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    this.startPolling();
  }

  public static getInstance(): ESP32Service {
    if (!ESP32Service.instance) {
      ESP32Service.instance = new ESP32Service();
    }
    return ESP32Service.instance;
  }

  /**
   * Send recipe to ESP32 hardware
   */
  public async sendRecipe(
    recipe: Recipe,
    customization: Customization
  ): Promise<ESP32Response> {
    try {
      const response = await fetch(`${this.backendUrl}/api/cooking/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe, customization }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      this.isConnected = true;
      this.notifyConnectionListeners(true);
      
      return {
        success: true,
        message: data.message || 'Recipe sent successfully',
        recipeSent: data.recipeSent
      };
    } catch (error) {
      this.isConnected = false;
      this.notifyConnectionListeners(false);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send recipe to ESP32'
      };
    }
  }

  /**
   * Get latest commands from ESP32
   */
  public async getCommands(): Promise<ESP32Command[]> {
    try {
      const response = await fetch(`${this.backendUrl}/api/esp32/commands`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get commands');
      }

      if (!this.isConnected) {
        this.isConnected = true;
        this.notifyConnectionListeners(true);
        console.log('ESP32 backend connected');
      }
      
      return data.commands || [];
    } catch (error) {
      if (this.isConnected) {
        this.isConnected = false;
        this.notifyConnectionListeners(false);
        console.warn('ESP32 backend disconnected:', error instanceof Error ? error.message : 'Unknown error');
      }
      return [];
    }
  }

  /**
   * Mark commands as processed
   */
  public async clearCommands(commandIds?: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/esp32/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commandIds }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error clearing ESP32 commands:', error);
      return false;
    }
  }

  /**
   * Parse STATUS message from ESP32
   * Format: STATUS:spice-dispenser=1,water-dispenser=0,oil-dispenser=1;
   */
  public parseStatusMessage(statusMessage: string): ModuleStatusUpdate[] {
    if (!statusMessage.startsWith('STATUS:')) {
      return [];
    }
    
    const statusData = statusMessage.replace('STATUS:', '').replace(';', '');
    const statusPairs = statusData.split(',');
    
    return statusPairs
      .map(pair => {
        const [moduleId, statusValue] = pair.split('=');
        if (moduleId && statusValue !== undefined) {
          return {
            moduleId: moduleId.trim(),
            alert: statusValue.trim() === '0'
          };
        }
        return null;
      })
      .filter((item): item is ModuleStatusUpdate => item !== null);
  }

  /**
   * Parse MODULE message from ESP32
   * Format: MODULE:spice-dispenser=-10,water-dispenser=-300,oil-dispenser=-15;
   */
  public parseModuleMessage(moduleMessage: string): ModuleLevelUpdate[] {
    if (!moduleMessage.startsWith('MODULE:')) {
      return [];
    }
    
    const moduleData = moduleMessage.replace('MODULE:', '').replace(';', '');
    const modulePairs = moduleData.split(',');
    
    return modulePairs
      .map(pair => {
        const [moduleId, changeValue] = pair.split('=');
        if (moduleId && changeValue !== undefined) {
          const change = parseInt(changeValue.trim(), 10);
          if (!isNaN(change)) {
            return {
              moduleId: moduleId.trim(),
              change
            };
          }
        }
        return null;
      })
      .filter((item): item is ModuleLevelUpdate => item !== null);
  }

  /**
   * Start polling for ESP32 commands
   */
  private startPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    const poll = async () => {
      const commands = await this.getCommands();
      if (commands.length > 0) {
        this.notifyCommandListeners(commands);
      }
      // Restart polling with updated interval based on connection status
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = setInterval(poll, this.isConnected ? 2000 : 10000);
      }
    };

    this.pollingInterval = setInterval(poll, 2000);
  }

  /**
   * Stop polling for ESP32 commands
   */
  public stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Subscribe to connection status changes
   */
  public onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to new commands from ESP32
   */
  public onCommands(listener: (commands: ESP32Command[]) => void): () => void {
    this.commandListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.commandListeners.indexOf(listener);
      if (index > -1) {
        this.commandListeners.splice(index, 1);
      }
    };
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  private notifyCommandListeners(commands: ESP32Command[]): void {
    this.commandListeners.forEach(listener => listener(commands));
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopPolling();
    this.connectionListeners = [];
    this.commandListeners = [];
  }
}

// Types for ESP32 communication
export interface ESP32Response {
  success: boolean;
  message?: string;
  error?: string;
  recipeSent?: string;
}

export interface ESP32Command {
  message: string;
  timestamp: string;
  processed: boolean;
}

export interface ModuleStatusUpdate {
  moduleId: string;
  alert: boolean;
}

export interface ModuleLevelUpdate {
  moduleId: string;
  change: number;
}

// Export singleton instance
export const esp32Service = ESP32Service.getInstance();