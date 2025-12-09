// src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add item (AJAX)
router.post('/add', cartController.addToCart);

// Update quantity (AJAX)
router.post('/update', cartController.updateQty);

// Remove item (DELETE recommended, but supporting POST too)
router.delete('/remove/:id', cartController.removeItem);
router.post('/remove', cartController.removeItem); // fallback for forms

// Cart page
router.get('/', cartController.getCart);

module.exports = router;
