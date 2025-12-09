// src/controllers/orderController.js
const Order = require('../models/Order');

// ✅ Place new order when user checks out
exports.placeOrder = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const cart = req.session.cart || [];
    if (cart.length === 0) {
      return res.redirect('/cart');
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // You can pull these from your checkout form
    const { address, paymentMethod } = req.body;

    const newOrder = new Order({
      userId: req.session.userId,
      items: cart,
      totalAmount,
      address: address || { line1: "No address provided" },
      paymentMethod: paymentMethod || "COD",
      status: "paid", // or 'created' if using real payment gateway
      createdAt: new Date()
    });

    await newOrder.save();

    // Empty the cart
    req.session.cart = [];

    // Redirect to order confirmation or My Orders
    res.redirect('/my-orders');
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).render('404', {
      name: req.session.userName || null,
      message: "Something went wrong while placing your order"
    });
  }
};

// ✅ Get all orders of logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.render('Order', { name: req.session.userName, orders: orders || [] });
  } catch (err) {
    console.error(err);
    res.render('Order', { name: req.session.userName, orders: [] });
  }
};


// ✅ Track Order Page
exports.trackOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, userId: req.session.userId });

    if (!order) {
      return res.status(404).render("404", {
        name: req.session.userName || null,
        message: "Order not found",
      });
    }

    // Simulated tracking info (you can connect to real API later)
    const trackingSteps = [
      { stage: "Order Placed", date: order.createdAt, completed: true },
      { stage: "Packed", date: null, completed: order.status === "packed" || order.status === "shipped" || order.status === "delivered" },
      { stage: "Shipped", date: null, completed: order.status === "shipped" || order.status === "delivered" },
      { stage: "Out for Delivery", date: null, completed: order.status === "delivered" },
      { stage: "Delivered", date: null, completed: order.status === "delivered" },
    ];

    res.render("track_order", {
      name: req.session.userName,
      order,
      trackingSteps,
    });
  } catch (err) {
    console.error("❌ Error loading order tracking:", err);
    res.status(500).render("404", { name: req.session.userName, message: "Server error while tracking order" });
  }
};

