const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure Serial Port for UART communication with ESP32
// Use try-catch to handle graceful fallback when hardware is not available
let port;
let serialPortAvailable = false;

try {
  port = new SerialPort({ 
    path: process.env.SERIAL_PORT || '/dev/ttyUSB0', // Use environment variable with fallback
    baudRate: parseInt(process.env.BAUD_RATE || '115200'), // Use environment variable with fallback
    autoOpen: false // Don't open immediately to handle errors better
  });
  
  port.open((err) => {
    if (err) {
      console.error('Failed to open serial port:', err.message);
      serialPortAvailable = false;
    } else {
      console.log('Serial port opened successfully');
      serialPortAvailable = true;
    }
  });
  
  port.on('open', () => {
    console.log('Serial port opened successfully');
    serialPortAvailable = true;
  });
  
  port.on('error', (err) => {
    console.error('Serial port error:', err.message);
    serialPortAvailable = false;
  });
  
  port.on('close', () => {
    console.log('Serial port closed');
    serialPortAvailable = false;
  });
  
  // Add data handler to process ESP32 responses
  port.on('data', (data) => {
    try {
      const message = data.toString().trim();
      console.log('Received from ESP32:', message);
      
      // Process ESP32 responses as needed
      // This would typically include parsing status updates and error codes
    } catch (error) {
      console.error('Error processing data from ESP32:', error);
    }
  });
} catch (error) {
  console.error('Failed to initialize serial port:', error.message);
  console.log('Running in simulation mode (hardware not available)');
}

// Helper function to simulate serial port when hardware is not available
const simulateSerialCommunication = (message, callback) => {
  console.log('SIMULATION MODE - Sending to ESP32:', message);
  // Simulate a delay and successful response
  setTimeout(() => {
    callback(null);
  }, 500);
};

// API endpoint to handle cooking instructions
app.post('/api/cooking/start', (req, res) => {
  try {
    const { moduleUpdates } = req.body;
    
    if (!moduleUpdates || !Array.isArray(moduleUpdates)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request format. Expected moduleUpdates array.' 
      });
    }

    console.log('Received module updates:', moduleUpdates);
    
    // Validate module updates
    for (const update of moduleUpdates) {
      if (!update.id || typeof update.change !== 'number') {
        return res.status(400).json({
          success: false,
          error: `Invalid module update: ${JSON.stringify(update)}`
        });
      }
    }
    
    // Format data for ESP32
    // Format: MODULE:water=-300,spice=-10,ingredients=-150;
    let uartMessage = 'MODULE:';
    
    const updateParts = moduleUpdates.map(update => {
      return `${update.id}=${update.change}`;
    });
    
    uartMessage += updateParts.join(',') + ';';
    
    console.log('Sending to ESP32:', uartMessage);
    
    // Determine whether to use actual or simulated serial communication
    if (serialPortAvailable && port) {
      // Send data to ESP32 via UART
      port.write(uartMessage, (err) => {
        if (err) {
          console.error('Failed to write to serial port:', err.message);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed to communicate with cooking system.' 
          });
        }
        
        console.log('Data sent successfully to ESP32');
        res.json({ 
          success: true, 
          message: 'Cooking instructions sent to system',
          moduleStatuses: moduleUpdates.map(update => ({
            id: update.id,
            status: 'ok'
          }))
        });
      });
    } else {
      // Use simulated mode
      simulateSerialCommunication(uartMessage, (err) => {
        if (err) {
          console.error('Failed in simulation mode:', err.message);
          return res.status(500).json({ 
            success: false, 
            error: 'Failed in simulation mode.' 
          });
        }
        
        console.log('Simulation completed successfully');
        res.json({ 
          success: true, 
          message: 'Cooking instructions simulated (no hardware connected)',
          moduleStatuses: moduleUpdates.map(update => ({
            id: update.id,
            status: 'ok'
          }))
        });
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add status endpoint for connection checking
app.get('/api/status', (req, res) => {
  res.json({
    connected: serialPortAvailable,
    mode: serialPortAvailable ? 'hardware' : 'simulation',
    message: serialPortAvailable 
      ? 'Connected to ESP32 hardware' 
      : 'Running in simulation mode (no hardware connected)'
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`UART Service running on port ${PORT}`);
  console.log(`Mode: ${serialPortAvailable ? 'Hardware' : 'Simulation'}`);
});