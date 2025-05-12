const express = require('express');
const router = express.Router();

// Webhook endpoint - always returns 200 regardless of input
router.post('/', (req, res) => {
  console.log('Webhook received at root endpoint:', JSON.stringify(req.body, null, 2));
  
  // Always return 200 success
  res.status(200).json({
    status: "success",
    message: "Webhook received successfully",
    timestamp: new Date().toISOString()
  });
});

// Specific named webhooks can be added here as needed
router.post('/order-status', (req, res) => {
  console.log('Order status webhook received:', JSON.stringify(req.body, null, 2));
  
  // Always return 200 success
  res.status(200).json({
    status: "success",
    message: "Order status webhook received successfully",
    timestamp: new Date().toISOString()
  });
});

router.post('/delivery-update', (req, res) => {
  console.log('Delivery update webhook received:', JSON.stringify(req.body, null, 2));
  
  // Always return 200 success
  res.status(200).json({
    status: "success",
    message: "Delivery update webhook received successfully",
    timestamp: new Date().toISOString()
  });
});

// Catch-all route for any webhook path
router.post('/*', (req, res) => {
  console.log('Webhook received at path:', req.path);
  console.log('Webhook body:', JSON.stringify(req.body, null, 2));
  
  // Always return 200 success
  res.status(200).json({
    status: "success",
    path: req.path,
    message: "Webhook received successfully",
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 