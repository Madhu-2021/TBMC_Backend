const express = require('express');
const router = express.Router();
const { generateResponse } = require('../model/falcon');

// Track ongoing requests
let pendingRequests = {};

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Generate a unique ID for this request
  const requestId = Date.now().toString();
  console.log(`[${requestId}] Processing request: ${message}`);

  // Store this request in pending requests
  pendingRequests[requestId] = { message, startTime: Date.now() };

  // Set timeout for long-running requests (60 seconds)
  const timeout = setTimeout(() => {
    if (pendingRequests[requestId]) {
      console.log(`[${requestId}] Request timed out after 600 seconds`);
      delete pendingRequests[requestId];
      if (!res.headersSent) {
        res.status(504).json({ error: 'Request timed out. The model is taking too long to respond.' });
      }
    }
  }, 600000); // 60 second timeout

  try {
    const response = await generateResponse(message);

    // Log request completion duration before clearing pending requests
    const duration = Date.now() - pendingRequests[requestId].startTime;
    console.log(`[${requestId}] Request completed in ${duration}ms`);
    console.log(`[${requestId}] Response: ${response}`);

    // Clear timeout and remove from pending
    clearTimeout(timeout);
    delete pendingRequests[requestId];

    if (!res.headersSent) {
      res.json({ response });
    }
  } catch (error) {
    // Clear timeout and remove from pending
    clearTimeout(timeout);
    delete pendingRequests[requestId];

    console.error(`[${requestId}] Error:`, error);

    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    }
  }
});

module.exports = router;
