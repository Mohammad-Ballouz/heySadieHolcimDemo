const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./models/database');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Initialize database
db.initializeDatabase();

// Routes
const orderRoutes = require('./routes/orders');
const webhookRoutes = require('./routes/webhooks');

app.use('/api/orders', orderRoutes);
app.use('/webhooks', webhookRoutes);

// Root webhook endpoint for simplicity
app.post('/webhook', (req, res) => {
  console.log('Root webhook received:', JSON.stringify(req.body, null, 2));
  
  // Always return 200 success
  res.status(200).json({
    status: "success",
    message: "Webhook received successfully at root endpoint",
    timestamp: new Date().toISOString()
  });
});

// Home route - render the orders UI
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the app at http://localhost:${PORT}`);
  console.log(`Webhook endpoints available at:`);
  console.log(`- http://localhost:${PORT}/webhook (POST)`);
  console.log(`- http://localhost:${PORT}/webhooks (POST)`);
  console.log(`- http://localhost:${PORT}/webhooks/order-status (POST)`);
  console.log(`- http://localhost:${PORT}/webhooks/delivery-update (POST)`);
}); 