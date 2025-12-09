const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

// 🏠 Home
router.get('/', pageController.getHome);

// 🏬 Shop
router.get('/shop', isLoggedIn, pageController.getShop);

// 👕 Men
router.get('/mens', isLoggedIn, pageController.getMens);
router.get("/man_outwears", pageController.getMensOutwears);


// 👚 Women
router.get('/womens', isLoggedIn, pageController.getWomens);
router.get("/woman_bottoms", pageController.getWomensBottomwear);

// 🌟 Featured
router.get('/featured', pageController.getFeatured);

// 🧢 Product Details
router.get('/product/:id', pageController.getProduct);

// 🧢 Accessories
router.get("/accessories", pageController.getAccessories);

// ℹ️ Static Pages
router.get('/about', pageController.getAbout);
router.get('/privacy', pageController.getPrivacy);
router.get('/terms', pageController.getTerms);

module.exports = router;
