/**
 * Enhanced service for communicating with the ESP32 via UART through our backend service
 * Includes improved error handling, retry logic, and real-time status updates
 */

// Define the module update payload
interface ModuleUpdate {
  id: string;
  change: number;
}

// Define response types
interface UartResponse {
  success: boolean;
  message?: string;
  error?: string;
  moduleStatuses?: Array<{
    id: string;
    status: 'ok' | 'error';
    errorCode?: number;
  }>;
}

// Define module operation payload
interface ModuleOperationData {
  moduleId: string;
  operationType: string;
  amount: number;
  duration?: number;
  temperature?: number;
  speed?: number;
}

// Service configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

export const uartService = {
  /**
   * Send module updates to the ESP32 via the backend service with retry logic
   * @param moduleUpdates Array of module updates with ID and change amount
   * @returns Promise with the response from the backend
   */
  async sendModuleUpdates(
    moduleUpdates: ModuleUpdate[],
    options = { retryCount: 0 }
  ): Promise<UartResponse> {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      // Validate input
      if (!moduleUpdates || !Array.isArray(moduleUpdates) || moduleUpdates.length === 0) {
        throw new Error("Invalid module updates: Empty or invalid array");
      }
      
      for (const update of moduleUpdates) {
        if (!update.id || typeof update.change !== 'number') {
          throw new Error(`Invalid module update: ${JSON.stringify(update)}`);
        }
      }
      
      console.log(`Sending module updates to UART service (Attempt ${options.retryCount + 1}/${MAX_RETRIES + 1})`, moduleUpdates);
      
      // Set up request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${backendUrl}/api/cooking/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moduleUpdates }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('Error sending module updates to ESP32:', error);
      
      // Implement retry logic for transient errors
      if (
        options.retryCount < MAX_RETRIES && 
        (error instanceof Error && 
         (error.name === 'AbortError' || 
          error.message.includes('network') ||
          error.message.includes('timeout')))
      ) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        
        return new Promise((resolve) => {
          setTimeout(async () => {
            const result = await this.sendModuleUpdates(moduleUpdates, {
              retryCount: options.retryCount + 1
            });
            resolve(result);
          }, RETRY_DELAY);
        });
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send data to cooking system' 
      };
    }
  },
  
  /**
   * Check the status of the UART service and ESP32 connection
   * @returns Promise with the status information
   */
  async checkStatus(): Promise<{ connected: boolean; message: string }> {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${backendUrl}/api/status`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      return {
        connected: data.connected,
        message: data.message || 'Connected to ESP32'
      };
    } catch (error) {
      console.error('Error checking UART service status:', error);
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Failed to connect to UART service'
      };
    }
  },
  
  /**
   * Send specific module operation to the ESP32
   * @param operationData The operation details to send
   * @returns Promise with the response from the backend
   */
  async sendModuleOperation(operationData: ModuleOperationData): Promise<UartResponse> {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      console.log('Sending module operation to ESP32:', operationData);
      
      // Set up request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for operations
      
      const response = await fetch(`${backendUrl}/api/module/operation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operationData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('Error sending module operation to ESP32:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send operation to cooking system' 
      };
    }
  },
};

// Add event handlers for monitoring connection status
window.addEventListener('online', () => {
  console.log('Network online. UART service will resume normal operation.');
});

window.addEventListener('offline', () => {
  console.log('Network offline. UART service will queue operations for later.');
});