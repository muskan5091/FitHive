// src/routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// Address form
router.get('/address', checkoutController.getCheckoutAddress);
router.post('/address', checkoutController.postCheckoutAddress);

// Payment page
router.get('/payment', checkoutController.getPaymentPage);

// Razorpay order creation (AJAX)
router.post('/razorpay', checkoutController.createRazorpayOrder);

// Verify payment
router.post('/verify', checkoutController.verifyPayment);

// Success page
router.get('/success', checkoutController.getPaymentSuccess);

// direct checkout route (optional)
router.post('/direct', checkoutController.directCheckout);

module.exports = router;
