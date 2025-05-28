import { Recipe, Customization } from '../types';

/**
 * Service for communicating with ESP32 via UART
 * Sends recipe to ESP32, receives STATUS and MODULE commands back
 */
export const uartService = {
  /**
   * Send recipe selection to ESP32
   */
  async sendRecipe(
    recipe: Recipe,
    customization: Customization
  ): Promise<{ success: boolean; message?: string; error?: string; recipeSent?: string }> {
    try {
      const backendUrl = 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/cooking/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          recipe,
          customization
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('Error sending recipe to ESP32:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send recipe to cooking system' 
      };
    }
  },
  /**
   * Get latest commands from ESP32 (STATUS and MODULE)
   */
  async getESP32Commands(): Promise<{ 
    success: boolean; 
    commands?: Array<{ message: string; timestamp: string; processed: boolean }>; 
    error?: string
  }> {
    try {
      const backendUrl = 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/esp32/commands`);
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting ESP32 commands:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get ESP32 commands' 
      };
    }
  },

  /**
   * Mark ESP32 commands as processed
   */
  async clearESP32Commands(commandIds?: string[]): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const backendUrl = 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/esp32/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commandIds }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing ESP32 commands:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear ESP32 commands' 
      };
    }
  },

  /**
   * Parse STATUS message from ESP32
   */
  parseStatusMessage(statusMessage: string): { id: string; alert: boolean }[] {
    if (!statusMessage.startsWith('STATUS:')) return [];
    
    const statusData = statusMessage.replace('STATUS:', '').replace(';', '');
    const moduleParts = statusData.split(',');
    
    return moduleParts.map(part => {
      const [id, status] = part.split('=');
      return {
        id: id.trim(),
        alert: status === '0' // 0 = alert, 1 = no alert
      };
    });
  },

  /**
   * Parse MODULE message from ESP32
   */
  parseModuleMessage(moduleMessage: string): { id: string; change: number }[] {
    if (!moduleMessage.startsWith('MODULE:')) return [];
    
    const moduleData = moduleMessage.replace('MODULE:', '').replace(';', '');
    const moduleParts = moduleData.split(',');
    
    return moduleParts.map(part => {
      const [id, change] = part.split('=');
      return {
        id: id.trim(),
        change: parseInt(change, 10)
      };
    });
  },

  /**
   * Send emergency stop command to ESP32
   * @returns Promise with the response from the backend
   */
  async emergencyStop(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const backendUrl = 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/cooking/emergency-stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending emergency stop to ESP32:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send emergency stop command' 
      };
    }
  }
};
