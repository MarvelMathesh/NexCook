/**
 * Service for communicating with the ESP32 via UART through our backend service
 */
export const uartService = {
  /**
   * Send module updates to the ESP32 via the backend service
   * @param moduleUpdates Array of module updates with ID and change amount
   * @returns Promise with the response from the backend
   */
  async sendModuleUpdates(moduleUpdates: { id: string; change: number }[]): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const backendUrl = 'http://localhost:3001';
      
      const response = await fetch(`${backendUrl}/api/cooking/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ moduleUpdates }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('Error sending module updates to ESP32:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send data to cooking system' 
      };
    }
  }
};
