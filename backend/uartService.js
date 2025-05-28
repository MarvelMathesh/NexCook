const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const bodyParser = require('body-parser');

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configure Serial Port for UART communication with ESP32
console.log('Initializing serial port...');

const port = new SerialPort({ 
  path: 'COM3', // Windows COM port for ESP32
  baudRate: 115200 
});

port.on('open', () => {
  console.log('✅ Serial port opened successfully');
  console.log('Port details:', {
    path: port.path,
    baudRate: port.baudRate,
    isOpen: port.isOpen
  });
});

port.on('error', (err) => {
  console.error('❌ Serial port error:', err.message);
  
  if (err.message.includes('Access denied') || err.message.includes('Permission denied')) {
    console.log('💡 Permission issue - you may need to run with sudo or add user to dialout group');
  }
  
  if (err.message.includes('No such file or directory')) {
    console.log('💡 Port not found - check ESP32 connection and port path');
  }
});

// Store ESP32 commands for frontend to retrieve
let esp32Commands = [];

// Listen for ESP32 responses
let messageBuffer = '';

port.on('data', (data) => {
  const chunk = data.toString();
  messageBuffer += chunk;
  
  // Process complete messages ending with ';'
  while (messageBuffer.includes(';')) {
    const messageEnd = messageBuffer.indexOf(';');
    const completeMessage = messageBuffer.substring(0, messageEnd);
    messageBuffer = messageBuffer.substring(messageEnd + 1);    // Only process STATUS and MODULE commands
    if (completeMessage.startsWith('STATUS:') || 
        completeMessage.startsWith('MODULE:')) {
      
      console.log('📥 ESP32 Command:', completeMessage);
      
      // Store the command for frontend to retrieve
      esp32Commands.push({
        message: completeMessage,
        timestamp: new Date().toISOString(),
        processed: false
      });
      
      // Keep only last 10 commands to prevent memory issues
      if (esp32Commands.length > 10) {
        esp32Commands = esp32Commands.slice(-10);
      }
    }
  }
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
    console.log('Port state - isOpen:', port.isOpen);
    console.log('Buffer contents:', Buffer.from(recipeMessage));
    
    port.write(recipeMessage, (err) => {
      if (err) {
        console.error('Failed to write recipe to serial port:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to send recipe to cooking system.' });
      }
      
      console.log('Recipe sent successfully to ESP32:', recipeMessage);
      console.log('Bytes written:', Buffer.from(recipeMessage).length);
      
      res.json({ 
        success: true, 
        message: 'Recipe sent to ESP32. Waiting for commands...',
        recipeSent: recipeMessage
      });
    });} catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
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

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`UART Service running on port ${PORT}`);
});
