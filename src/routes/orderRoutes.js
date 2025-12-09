// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { isLoggedIn } = require("../middlewares/authMiddleware");

router.post("/place-order", isLoggedIn, orderController.placeOrder);
router.get("/my-orders", isLoggedIn, orderController.getMyOrders);

// ✅ NEW: Track order route
router.get("/track-order/:id", isLoggedIn, orderController.trackOrder);

module.exports = router;
