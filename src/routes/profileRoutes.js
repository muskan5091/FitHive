const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

/* ---------------- PROFILE ROUTES ---------------- */

// 🧍 View profile
router.get('/', isLoggedIn, pageController.getProfile);

// ✏️ Edit profile (form view)
router.get('/edit', isLoggedIn, pageController.getProfileEdit);

// 💾 Update profile (form submit)
router.post('/edit', isLoggedIn, pageController.postProfileEdit);

/* ---------------- WISHLIST ROUTES ---------------- */

// ❤️ View wishlist
router.get('/wishlist', isLoggedIn, pageController.getWishlist);

// ➕ Add to wishlist
router.post('/wishlist/add', isLoggedIn, pageController.postWishlistAdd);

// ❌ Remove one item from wishlist
router.post('/wishlist/remove', isLoggedIn, pageController.postWishlistRemove);

// 🗑️ Clear all wishlist items
router.post('/wishlist/clear', isLoggedIn, pageController.postWishlistClear);

module.exports = router;
