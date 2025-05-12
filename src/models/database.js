const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, '../../orders.db');
const db = new sqlite3.Database(dbPath);

// Initialize database with tables and sample data
function initializeDatabase() {
  // Drop existing orders table if it exists
  db.run("DROP TABLE IF EXISTS orders", (err) => {
    if (err) {
      console.error('Error dropping table:', err);
      return;
    }
    
    // Create orders table with orderCode as INTEGER
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT,
        projectName TEXT,
        prjcod TEXT,
        quote TEXT,
        orderCode INTEGER UNIQUE,
        orderDate TEXT,
        ordrqy REAL,
        ticketedQty REAL,
        prddes1 TEXT,
        prodcd1 TEXT,
        orderStatus TEXT,
        delvad TEXT,
        deliverystatus TEXT,
        loadqy1 REAL,
        trkcod TEXT,
        startTime TEXT,
        liveTrackingUrl TEXT,
        supplyQuarryList_location TEXT,
        supplyQuarryList_Name TEXT,
        cancel INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }
      
      // Insert sample data
      const sampleOrders = [
        {
          customerName: 'Ulan Mobile #1 NSW Concrete',
          projectName: '10 TOOLE RD',
          prjcod: '56001236',
          quote: '56001236',
          orderCode: 7051,
          orderDate: '2024-11-12',
          ordrqy: 500.0,
          ticketedQty: 174.23,
          prddes1: '20/14mm BLENDED AGGREGATE',
          prodcd1: 'AGGBL2014',
          orderStatus: 'Normal',
          delvad: 'Lot 10 Toole Road',
          deliverystatus: 'In Transit',
          loadqy1: 34.02,
          trkcod: '1563',
          startTime: '2024-11-12 14:09:31',
          liveTrackingUrl: 'https://tmo-qa.web.app/#/track-my-order?orderCode=1E2703841CBB595321500C66C5A842D5&orderDate=7D96B8EBD44943C83AED751569EA9921',
          supplyQuarryList_location: '5355',
          supplyQuarryList_Name: 'Dubbo Quarry',
          cancel: 0
        },
        {
          customerName: 'Hunter Civil Group',
          projectName: 'BRIDGE ST RECONSTRUCTION',
          prjcod: '56004567',
          quote: '56004567',
          orderCode: 7093,
          orderDate: '2024-12-03',
          ordrqy: 750.0,
          ticketedQty: 410.00,
          prddes1: '25 MPa STANDARD CONCRETE',
          prodcd1: 'CONC25MPA',
          orderStatus: 'Normal',
          delvad: '105 Bridge St, Maitland',
          deliverystatus: 'Delivered',
          loadqy1: 40.00,
          trkcod: '1580',
          startTime: '2024-12-03 09:45:00',
          liveTrackingUrl: 'https://tmo-qa.web.app/#/track-my-order?orderCode=1E2703841CBB595321500C66C5A842D5&orderDate=7D96B8EBD44943C83AED751569EA9921',
          supplyQuarryList_location: '5380',
          supplyQuarryList_Name: 'Maitland Batching Plant',
          cancel: 0
        },
        {
          customerName: 'ACT Road & Rail',
          projectName: 'AIRPORT LOGISTICS HUB',
          prjcod: '56007891',
          quote: '56007891',
          orderCode: 7150,
          orderDate: '2025-01-17',
          ordrqy: 620.0,
          ticketedQty: 295.50,
          prddes1: '32 MPa PUMP MIX',
          prodcd1: 'CONC32PMP',
          orderStatus: 'Delayed',
          delvad: '24 Runway Dr, Canberra',
          deliverystatus: 'Awaiting Dispatch',
          loadqy1: 38.50,
          trkcod: '1563',
          startTime: '2025-01-17 13:15:12',
          liveTrackingUrl: 'https://tmo-qa.web.app/#/track-my-order?orderCode=1E2703841CBB595321500C66C5A842D5&orderDate=7D96B8EBD44943C83AED751569EA9921',
          supplyQuarryList_location: '5399',
          supplyQuarryList_Name: 'Fyshwick Concrete Plant',
          cancel: 0
        },
        {
          customerName: 'Sydney Metro Construction',
          projectName: 'GEORGE ST PLAZA',
          prjcod: '56002489',
          quote: '56002489',
          orderCode: 7215,
          orderDate: '2025-02-05',
          ordrqy: 880.0,
          ticketedQty: 320.75,
          prddes1: '40 MPa HIGH STRENGTH',
          prodcd1: 'CONC40HSM',
          orderStatus: 'Normal',
          delvad: '320 George St, Sydney',
          deliverystatus: 'In Transit',
          loadqy1: 42.50,
          trkcod: '1592',
          startTime: '2025-02-05 08:30:25',
          liveTrackingUrl: 'https://tmo-qa.web.app/#/track-my-order?orderCode=1E2703841CBB595321500C66C5A842D5&orderDate=7D96B8EBD44943C83AED751569EA9921',
          supplyQuarryList_location: '5372',
          supplyQuarryList_Name: 'Alexandria Plant',
          cancel: 0
        },
        {
          customerName: 'Brisbane Development Corp',
          projectName: 'QUEEN ST TOWERS',
          prjcod: '56008932',
          quote: '56008932',
          orderCode: 7318,
          orderDate: '2025-03-12',
          ordrqy: 1250.0,
          ticketedQty: 0.0,
          prddes1: '50 MPa STRUCTURAL MIX',
          prodcd1: 'CONC50STR',
          orderStatus: 'Normal',
          delvad: '45 Queen St, Brisbane',
          deliverystatus: 'Scheduled',
          loadqy1: 0.0,
          trkcod: '',
          startTime: '2025-03-12 10:00:00',
          liveTrackingUrl: 'https://tmo-qa.web.app/#/track-my-order?orderCode=1E2703841CBB595321500C66C5A842D5&orderDate=7D96B8EBD44943C83AED751569EA9921',
          supplyQuarryList_location: '5412',
          supplyQuarryList_Name: 'Brisbane Central Plant',
          cancel: 0
        }
      ];

      // Insert each sample order
      const stmt = db.prepare(`
        INSERT INTO orders (
          customerName, projectName, prjcod, quote, orderCode, orderDate, 
          ordrqy, ticketedQty, prddes1, prodcd1, orderStatus, delvad, 
          deliverystatus, loadqy1, trkcod, startTime, liveTrackingUrl, 
          supplyQuarryList_location, supplyQuarryList_Name, cancel
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleOrders.forEach(order => {
        stmt.run([
          order.customerName, order.projectName, order.prjcod, order.quote, 
          order.orderCode, order.orderDate, order.ordrqy, order.ticketedQty, 
          order.prddes1, order.prodcd1, order.orderStatus, order.delvad,
          order.deliverystatus, order.loadqy1, order.trkcod, order.startTime, 
          order.liveTrackingUrl, order.supplyQuarryList_location, 
          order.supplyQuarryList_Name, order.cancel
        ]);
      });

      stmt.finalize();
      console.log('Sample data inserted with numeric order codes');
    });
  });
}

// Get all orders
function getAllOrders(callback) {
  db.all("SELECT * FROM orders", callback);
}

// Get order by orderCode
function getOrderByCode(orderCode, callback) {
  db.get("SELECT * FROM orders WHERE orderCode = ?", [orderCode], callback);
}

// Update order quantity
function updateOrderQuantity(orderCode, requestType, quantity, callback) {
  // First get the current order
  getOrderByCode(orderCode, (err, order) => {
    if (err) {
      return callback(err);
    }
    
    if (!order) {
      return callback(new Error('Order not found'));
    }
    
    let newQuantity;
    
    if (requestType === 'add_quantity') {
      newQuantity = order.ordrqy + parseFloat(quantity);
    } else if (requestType === 'remove_quantity') {
      newQuantity = Math.max(0, order.ordrqy - parseFloat(quantity));
    } else {
      return callback(new Error('Invalid request type'));
    }
    
    // Update the order quantity
    db.run(
      "UPDATE orders SET ordrqy = ? WHERE orderCode = ?",
      [newQuantity, orderCode],
      function(err) {
        if (err) {
          return callback(err);
        }
        
        // Get the updated order
        getOrderByCode(orderCode, callback);
      }
    );
  });
}

module.exports = {
  db,
  initializeDatabase,
  getAllOrders,
  getOrderByCode,
  updateOrderQuantity
}; 