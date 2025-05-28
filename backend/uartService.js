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

// API endpoint to send recipe to ESP32
app.post('/api/cooking/start', (req, res) => {
  try {
    const { recipe, customization } = req.body;
    
    if (!recipe || !recipe.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request format. Expected recipe object.' 
      });
    }    console.log('Sending recipe to ESP32:', recipe.id);
    console.log('Customization:', customization);
    
    // Send recipe selection to ESP32 (simplified format)
    const recipeMessage = `RECIPE:${recipe.id};`;
    
    console.log('Sending to ESP32:', recipeMessage);
    
    port.write(recipeMessage, (err) => {
      if (err) {
        console.error('Failed to write recipe to serial port:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to send recipe to cooking system.' });
      }
      
      console.log('Recipe sent successfully to ESP32:', recipeMessage);
      res.json({ 
        success: true, 
        message: 'Recipe sent to ESP32. Waiting for commands...',
        recipeSent: recipeMessage
      });
    });  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Store ESP32 commands for frontend to retrieve
let esp32Commands = [];

// Listen for ESP32 responses
port.on('data', (data) => {
  const message = data.toString().trim();
  console.log('Received from ESP32:', message);
  
  // Store the command for frontend to retrieve
  esp32Commands.push({
    message: message,
    timestamp: new Date().toISOString(),
    processed: false
  });
  
  // Keep only last 20 commands to prevent memory issues
  if (esp32Commands.length > 20) {
    esp32Commands = esp32Commands.slice(-20);
  }
});

// API endpoint to get ESP32 commands
app.get('/api/esp32/commands', (req, res) => {
  // Return only unprocessed commands
  const unprocessedCommands = esp32Commands.filter(cmd => !cmd.processed);
  
  res.json({
    success: true,
    commands: unprocessedCommands
  });
});

// API endpoint to mark ESP32 commands as processed
app.post('/api/esp32/clear', (req, res) => {
  const { commandIds } = req.body;
  
  if (commandIds && Array.isArray(commandIds)) {
    // Mark specific commands as processed
    esp32Commands.forEach(cmd => {
      if (commandIds.includes(cmd.timestamp)) {
        cmd.processed = true;
      }
    });
  } else {
    // Mark all commands as processed
    esp32Commands.forEach(cmd => cmd.processed = true);
  }
  
  res.json({ success: true, message: 'Commands marked as processed' });
});

// Emergency stop endpoint
app.post('/api/cooking/emergency-stop', (req, res) => {
  try {
    const emergencyMessage = 'EMERGENCY:stop;';
    
    console.log('Sending emergency stop to ESP32:', emergencyMessage);
    
    port.write(emergencyMessage, (err) => {
      if (err) {
        console.error('Failed to write emergency stop to serial port:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to send emergency stop command.' });
      }
      
      console.log('Emergency stop sent successfully to ESP32');
      res.json({ success: true, message: 'Emergency stop command sent to system' });
    });
  } catch (error) {
    console.error('Error processing emergency stop request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`UART Service running on port ${PORT}`);
});
