const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ordersPath = path.join(__dirname, '../data/orders.json');
const foodItemsPath = path.join(__dirname, '../data/foodItems.json');

// Get all orders
router.get('/', (req, res) => {
  try {
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    res.json(orders);
  } catch (error) {
    console.error('Error reading orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create a new order
router.post('/', (req, res) => {
  try {
    const { items, customerName, address } = req.body;
    
    if (!items || !items.length || !customerName) {
      return res.status(400).json({ error: 'Order items and customer name are required' });
    }
    
    const foodItems = JSON.parse(fs.readFileSync(foodItemsPath, 'utf8'));
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    // Validate items
    for (const orderItem of items) {
      const foodItem = foodItems.find(f => f.id === orderItem.id);
      if (!foodItem) {
        return res.status(400).json({ error: `Food item with id ${orderItem.id} not found` });
      }
    }
    
    // Calculate total
    let total = 0;
    const itemsWithDetails = items.map(orderItem => {
      const foodItem = foodItems.find(f => f.id === orderItem.id);
      const itemTotal = foodItem.price * orderItem.quantity;
      total += itemTotal;
      
      return {
        id: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        quantity: orderItem.quantity,
        itemTotal
      };
    });
    
    // Create new order
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      customerName,
      address: address || '',
      items: itemsWithDetails,
      total,
      status: 'pending',
      date: new Date().toISOString()
    };
    
    orders.push(newOrder);
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;