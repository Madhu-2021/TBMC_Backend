const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import routes
const chatRoutes = require('./routes/chat');
const foodRoutes = require('./routes/food');
const orderRoutes = require('./routes/orders');

// Initialize data files if they don't exist
const dataPath = path.join(__dirname, 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
}

// Create food items data if it doesn't exist
const foodItemsPath = path.join(dataPath, 'foodItems.json');
if (!fs.existsSync(foodItemsPath)) {
  const sampleFoodItems = [
    { id: 1, name: 'Pizza Margherita', price: 9.99, description: 'Classic pizza with tomato and mozzarella' },
    { id: 2, name: 'Burger', price: 8.50, description: 'Beef burger with lettuce, tomato, and special sauce' },
    { id: 3, name: 'Caesar Salad', price: 7.99, description: 'Fresh salad with Caesar dressing and croutons' },
    { id: 4, name: 'Pasta Carbonara', price: 11.99, description: 'Creamy pasta with bacon and Parmesan' },
    { id: 5, name: 'Fish and Chips', price: 10.50, description: 'Fried fish with crispy chips' }
  ];
  fs.writeFileSync(foodItemsPath, JSON.stringify(sampleFoodItems, null, 2));
}

// Create orders data file if it doesn't exist
const ordersPath = path.join(dataPath, 'orders.json');
if (!fs.existsSync(ordersPath)) {
  fs.writeFileSync(ordersPath, JSON.stringify([], null, 2));
}

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});