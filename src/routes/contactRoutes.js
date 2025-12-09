const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

// GET contact page
router.get('/contact', contactController.getContact);

// POST message (only logged-in users)
router.post('/contact', isLoggedIn, contactController.postContact);

module.exports = router;
