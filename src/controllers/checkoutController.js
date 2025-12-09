// src/controllers/checkoutController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');


const productsPath = path.join(__dirname, '..', 'data', 'products.json');
function loadProducts(){ try{ return JSON.parse(fs.readFileSync(productsPath,'utf8')); }catch(e){return [];} }
function getProductById(id){ return loadProducts().find(p=>String(p.id)===String(id)||String(p._id)===String(id)) || null; }

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

exports.redirectToAddress = (req,res)=> {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect('/cart');
  res.redirect('/checkout/address');
};

exports.getCheckoutAddress = (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect('/cart');

  const subtotal = cart.reduce((s,i)=>s + (i.price||0) * (i.qty||1), 0);
  res.render('checkout_address', { cart, subtotal, name: req.session.userName, error: null });
};

exports.postCheckoutAddress = (req, res) => {
  const { fullname, email, phone, address1, address2, city, state, zip, country } = req.body;
  if (!fullname || !email || !phone || !address1 || !city || !state || !zip || !country) {
    const cart = req.session.cart || [];
    const subtotal = cart.reduce((s,i)=>s + (i.price||0) * (i.qty||1), 0);
    return res.render('checkout_address', { cart, subtotal, name: req.session.userName, error: 'Please fill all required fields.' });
  }
  req.session.shippingAddress = { fullname, email, phone, address1, address2, city, state, zip, country };
  res.redirect('/checkout/payment');
};

exports.getPaymentPage = (req, res) => {
  const cart = req.session.cart || [];
  if (!cart.length) return res.redirect('/cart');
  if (!req.session.shippingAddress) return res.redirect('/checkout/address');

  const subtotal = cart.reduce((s,i)=>s + (i.price||0) * (i.qty||1), 0);
  const platformFee = parseFloat((subtotal * 0.03).toFixed(2));
  const shippingCharge = subtotal >= 899 ? 0 : 50;
  const totalAmount = subtotal + platformFee + shippingCharge;

  res.render('checkout_payment', {
    cart,
    subtotal,
    platformFee,
    shippingCharge,
    totalAmount,
    name: req.session.userName,
    address: req.session.shippingAddress,
    razorpayKey: process.env.RAZORPAY_KEY_ID || ''
  });
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (!cart.length) return res.status(400).json({ error: 'Cart empty' });
    const subtotal = cart.reduce((s,i)=>s + (i.price||0) * (i.qty||1), 0);
    const platformFee = parseFloat((subtotal * 0.03).toFixed(2));
    const shippingCharge = subtotal >= 899 ? 0 : 50;
    const totalAmountPaise = Math.round((subtotal + platformFee + shippingCharge) * 100);

    const order = await razorpay.orders.create({
      amount: totalAmountPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });

    res.json(order);
  } catch (err) {
    console.error('createRazorpayOrder error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.log("❌ Payment signature verification failed");
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ✅ Payment verified successfully
    const cart = req.session.cart || [];
    const address = req.session.shippingAddress || {};
    const userId = req.session.userId;
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    // ✅ Save order in MongoDB
    const newOrder = new Order({
      userId,
      items: cart,
      totalAmount,
      address,
      paymentMethod: "Razorpay",
      status: "paid",
      createdAt: new Date()
    });

    await newOrder.save();
    console.log(`✅ Order saved successfully for ${req.session.userName}`);

    // Clear cart and shipping info
    req.session.cart = [];
    delete req.session.shippingAddress;

    // Store info temporarily for success page
    req.session.lastOrder = {
      id: newOrder._id,
      payment_id: razorpay_payment_id,
      amount: totalAmount,
      date: new Date(),
    };

    return res.json({ success: true });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getPaymentSuccess = async (req, res) => {
  try {
    const lastOrderId = req.session.lastOrder?.id;

    // 🧩 If order was saved in DB, fetch it from Mongo
    const order = lastOrderId
      ? await Order.findOne({ _id: lastOrderId }).lean()
      : null;

    if (!order) {
      console.warn("⚠️ No recent order found in session or DB.");
      return res.redirect('/');
    }

    res.render("checkout_success", {
      user: { name: req.session.userName || order.address?.fullname || "Customer" },
      orderId: order._id,
      cart: order.items || [],
      address: order.address || {},
      total: order.totalAmount || 0
    });

    // Optional: clean up session
    delete req.session.lastOrder;

  } catch (err) {
    console.error("Error rendering success page:", err);
    res.status(500).send("Error displaying order success page.");
  }
};



exports.directCheckout = (req, res) => {
  const { productId } = req.body;
  const product = getProductById(productId);
  if (!product) return res.redirect('/');

  req.session.cart = [{
    _id: product.id || product._id,
    name: product.name,
    price: product.price,
    qty: 1,
    image: product.image,
    customization: {}
  }];

  res.redirect('/checkout/address');
};


// ==============================
// ✅ Cart Update & Remove Handlers
// ==============================
exports.removeCartItem = (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Missing product ID' });

    if (!req.session.cart) req.session.cart = [];
    req.session.cart = req.session.cart.filter(item => String(item.id) !== String(id) && String(item._id) !== String(id));

    return res.json({ success: true, count: req.session.cart.length });
  } catch (err) {
    console.error('❌ Error removing item:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCartItem = (req, res) => {
  try {
    const { id, qty } = req.body;
    if (!id || !qty) return res.status(400).json({ success: false, message: 'Missing ID or quantity' });

    if (!req.session.cart) req.session.cart = [];
    const item = req.session.cart.find(i => String(i.id) === String(id) || String(i._id) === String(id));
    if (item) item.qty = qty;

    return res.json({ success: true, cart: req.session.cart });
  } catch (err) {
    console.error('❌ Error updating cart:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
