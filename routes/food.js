const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const foodItemsPath = path.join(__dirname, '../data/foodItems.json');

// Get all food items
router.get('/', (req, res) => {
  try {
    const foodItems = JSON.parse(fs.readFileSync(foodItemsPath, 'utf8'));
    res.json(foodItems);
  } catch (error) {
    console.error('Error reading food items:', error);
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// Get a specific food item
router.get('/:id', (req, res) => {
  try {
    const foodItems = JSON.parse(fs.readFileSync(foodItemsPath, 'utf8'));
    const item = foodItems.find(item => item.id === parseInt(req.params.id));
    
    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error reading food item:', error);
    res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

module.exports = router;