const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get all orders
router.get('/', (req, res) => {
  db.getAllOrders((err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(orders);
  });
});

// Get a specific order by orderCode
router.get('/:orderCode', (req, res) => {
  const orderCode = parseInt(req.params.orderCode);
  
  if (isNaN(orderCode)) {
    return res.status(400).json({ error: 'Order code must be a number' });
  }
  
  db.getOrderByCode(orderCode, (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  });
});

// New POST endpoint for getting order details in a humanized way
router.post('/get-order-details', (req, res) => {
  const { call_id, arguments: args } = req.body;
  
  // Log the call ID
  if (call_id) {
    console.log(`Processing get-order-details request with call_id: ${call_id}`);
  }
  
  // Check if arguments exist
  if (!args) {
    return res.status(400).json({ 
      error: 'Missing arguments object in request body.' 
    });
  }
  
  const orderCode = parseInt(args.order_code);
  
  // Validate order code is a number
  if (isNaN(orderCode)) {
    return res.status(400).json({ error: 'Order code must be a number' });
  }
  
  // Get the order
  db.getOrderByCode(orderCode, (err, order) => {
    if (err) {
      return res.status(500).json({ 
        call_id: call_id || "default_call_id",
        result: {
          success: false,
          error: err.message
        }
      });
    }
    
    if (!order) {
      return res.status(404).json({ 
        call_id: call_id || "default_call_id",
        result: {
          success: false,
          error: 'Order not found',
          humanResponse: `I'm sorry, I couldn't find any order with the code ${orderCode}. Could you please verify the order number?`
        }
      });
    }
    
    // Calculate remaining quantity and percentage
    const remainingQty = (order.ordrqy - order.ticketedQty).toFixed(2);
    const deliveredPercentage = Math.round((order.ticketedQty / order.ordrqy) * 100);
    
    // Format dates for better readability
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Create human-friendly status descriptions
    let statusDescription;
    if (order.cancel === 1) {
      statusDescription = "has been canceled";
    } else if (order.orderStatus.toLowerCase() === 'normal') {
      statusDescription = "is progressing normally";
    } else {
      statusDescription = "is currently delayed";
    }
    
    // Create delivery status narrative
    let deliveryNarrative;
    if (order.deliverystatus.toLowerCase().includes('transit')) {
      deliveryNarrative = `Your delivery is currently in transit from ${order.supplyQuarryList_Name} to ${order.delvad}.`;
    } else if (order.deliverystatus.toLowerCase().includes('delivered')) {
      deliveryNarrative = `Your material has been delivered to ${order.delvad}.`;
    } else if (order.deliverystatus.toLowerCase().includes('scheduled')) {
      deliveryNarrative = `Your delivery is scheduled and will be dispatched from ${order.supplyQuarryList_Name} to ${order.delvad} soon.`;
    } else {
      deliveryNarrative = `Your order is awaiting dispatch from ${order.supplyQuarryList_Name} to ${order.delvad}.`;
    }
    
    // Build conversational response
    const conversationalResponse = `Your order ${order.orderCode} for ${order.customerName} at the ${order.projectName} project ${statusDescription}. This order is for ${order.ordrqy.toFixed(2)} cubic meters of ${order.prddes1}. So far, ${order.ticketedQty.toFixed(2)} cubic meters (${deliveredPercentage}%) have been delivered, with ${remainingQty} cubic meters remaining. ${deliveryNarrative}`;
    
    // Create alternate phrasings for variety
    const alternativePhrasings = [
      `I found order ${order.orderCode} for the ${order.projectName} project. This is for ${order.ordrqy.toFixed(2)} cubic meters of ${order.prddes1}. Currently, ${deliveredPercentage}% has been delivered (${order.ticketedQty.toFixed(2)} cubic meters), with ${remainingQty} cubic meters remaining. The order ${statusDescription} and ${order.deliverystatus.toLowerCase()}.`,
      
      `For the ${order.projectName} project, order ${order.orderCode} ${statusDescription}. You ordered ${order.ordrqy.toFixed(2)} cubic meters of ${order.prddes1}, and we've delivered ${order.ticketedQty.toFixed(2)} cubic meters so far. That's ${deliveredPercentage}% complete with ${remainingQty} cubic meters still to come. ${deliveryNarrative}`,
      
      `The ${order.projectName} order (${order.orderCode}) is ${order.deliverystatus.toLowerCase()} and ${statusDescription}. Of the ${order.ordrqy.toFixed(2)} cubic meters of ${order.prddes1} ordered, ${order.ticketedQty.toFixed(2)} cubic meters have been delivered, leaving ${remainingQty} cubic meters remaining. The materials are being supplied from ${order.supplyQuarryList_Name}.`
    ];
    
    // Create response with multiple versions for the LLM to choose from
    res.json({
      call_id: call_id || "default_call_id",
      result: {
        success: true,
        order: {
          orderCode: order.orderCode,
          customer: order.customerName,
          project: order.projectName,
          product: order.prddes1,
          orderedQuantity: order.ordrqy,
          deliveredQuantity: order.ticketedQty,
          remainingQuantity: remainingQty,
          deliveryStatus: order.deliverystatus,
          orderStatus: order.orderStatus
        },
        humanResponse: {
          primary: conversationalResponse,
          alternatives: alternativePhrasings
        }
      }
    });
  });
});

// Webhook endpoint - always returns 200
router.post('/webhooks', (req, res) => {
  console.log('Webhook received:', req.body);
  
  // Always return 200 success
  res.status(200).json({
    status: "success",
    message: "Webhook received successfully"
  });
});

// Edit order endpoint - add or remove quantity (using PUT - for backward compatibility)
router.put('/edit-order', (req, res) => {
  const orderCode = parseInt(req.body.order_code);
  const { request_type, quantity } = req.body;
  
  // Validate order code is a number
  if (isNaN(orderCode)) {
    return res.status(400).json({ error: 'Order code must be a number' });
  }
  
  // Validate request parameters
  if (!orderCode || !request_type || !quantity) {
    return res.status(400).json({ 
      error: 'Missing required parameters. Please provide order_code, request_type, and quantity.' 
    });
  }
  
  // Validate request_type
  if (request_type !== 'add_quantity' && request_type !== 'remove_quantity') {
    return res.status(400).json({ 
      error: 'Invalid request_type. Valid options are: add_quantity, remove_quantity.' 
    });
  }
  
  // Validate quantity is a number
  const parsedQuantity = parseFloat(quantity);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive number.' });
  }
  
  // Update the order quantity
  db.updateOrderQuantity(orderCode, request_type, parsedQuantity, (err, updatedOrder) => {
    if (err) {
      if (err.message === 'Order not found') {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      message: `Order ${orderCode} has been updated successfully.`,
      order: updatedOrder
    });
  });
});

// New Edit order endpoint - add or remove quantity (using POST with new format)
router.post('/edit-order', (req, res) => {
  const { call_id, arguments: args } = req.body;
  
  // Log the call ID (not used now but prepared for future)
  if (call_id) {
    console.log(`Processing request with call_id: ${call_id}`);
  }
  
  // Check if arguments exist
  if (!args) {
    return res.status(400).json({ 
      error: 'Missing arguments object in request body.' 
    });
  }
  
  const orderCode = parseInt(args.order_code);
  const { request_type, quantity } = args;
  
  // Validate order code is a number
  if (isNaN(orderCode)) {
    return res.status(400).json({ error: 'Order code must be a number' });
  }
  
  // Validate request parameters
  if (!orderCode || !request_type || !quantity) {
    return res.status(400).json({ 
      error: 'Missing required parameters. Please provide order_code, request_type, and quantity in arguments.' 
    });
  }
  
  // Validate request_type
  if (request_type !== 'add_quantity' && request_type !== 'remove_quantity') {
    return res.status(400).json({ 
      error: 'Invalid request_type. Valid options are: add_quantity, remove_quantity.' 
    });
  }
  
  // Validate quantity is a number
  const parsedQuantity = parseFloat(quantity);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive number.' });
  }
  
  // Update the order quantity
  db.updateOrderQuantity(orderCode, request_type, parsedQuantity, (err, updatedOrder) => {
    if (err) {
      if (err.message === 'Order not found') {
        return res.status(404).json({ error: 'Order not found' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      call_id: call_id || "default_call_id",
      result: {
        message: `Order ${orderCode} has been updated successfully.`,
        order: updatedOrder
      }
    });
  });
});

module.exports = router; 