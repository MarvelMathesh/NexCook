const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure Serial Port for UART communication with ESP32
const port = new SerialPort({ 
  path: '/dev/ttyUSB0', // Use '/dev/ttyS0' for GPIO serial port
  baudRate: 115200 
});

port.on('open', () => {
  console.log('Serial port opened successfully');
});

port.on('error', (err) => {
  console.error('Serial port error:', err.message);
});

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
    
    // Format data for ESP32
    // Format: MODULE:water=-300,spice=-10,ingredients=-150;
    let uartMessage = 'MODULE:';
    
    const updateParts = moduleUpdates.map(update => {
      return `${update.id}=${update.change}`;
    });
    
    uartMessage += updateParts.join(',') + ';';
    
    console.log('Sending to ESP32:', uartMessage);
    
    // Send data to ESP32 via UART
    port.write(uartMessage, (err) => {
      if (err) {
        console.error('Failed to write to serial port:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to communicate with cooking system.' });
      }
      
      console.log('Data sent successfully to ESP32');
      res.json({ success: true, message: 'Cooking instructions sent to system' });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`UART Service running on port ${PORT}`);
});
