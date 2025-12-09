const { getProductById } = require('../helpers/productsData');

// ==========================
// ADD TO CART
// ==========================
exports.addToCart = (req, res) => {
  try {
    const body = req.body || {};

    // Normalize input
    const productId = body.id || body._id || body.productId;
    const qty = parseInt(body.qty || body.quantity || 1, 10) || 1;
    const color = body.color || body.formColor || '';
    const customizationData = body.customization || {};
    const isCustomized = Object.keys(customizationData).length > 0;

    // ✅ Disable size if product is customized
    const size = isCustomized ? null : (body.size || body.formSize || '');

    if (!productId)
      return res.status(400).json({ success: false, message: 'Product ID missing' });

    const product = getProductById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    if (!req.session.cart) req.session.cart = [];

    // ✅ Find same variant + customization
    const existing = req.session.cart.find(
      (item) =>
        String(item._id) === String(product.id || product._id) &&
        (item.size || '') === (size || '') &&
        (item.color || '') === (color || '') &&
        JSON.stringify(item.customization || {}) === JSON.stringify(customizationData || {})
    );

    if (existing) {
      existing.qty += qty;
    } else {
      req.session.cart.push({
        _id: product.id || product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        size,
        color,
        customized: isCustomized,
        customization: customizationData,
        qty,
      });
    }

    const totalCount = req.session.cart.reduce((s, i) => s + i.qty, 0);

    return res.json({
      success: true,
      message: 'Added to cart',
      count: totalCount,
      cart: req.session.cart,
    });
  } catch (err) {
    console.error('addToCart error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================
// UPDATE QTY
// ==========================
exports.updateQty = (req, res) => {
  try {
    const { id, qty } = req.body;
    if (!req.session.cart) req.session.cart = [];

    const item = req.session.cart.find(i => String(i._id) === String(id));
    if (item) item.qty = parseInt(qty, 10) || 1;

    const totalCount = req.session.cart.reduce((s, i) => s + i.qty, 0);
    return res.json({ success: true, count: totalCount, cart: req.session.cart });
  } catch (err) {
    console.error('updateQty error:', err);
    return res.status(500).json({ success: false });
  }
};

// ==========================
// REMOVE ITEM
// ==========================
exports.removeItem = (req, res) => {
  try {
    const id = req.params.id || req.body.id;
    if (!req.session.cart) req.session.cart = [];

    req.session.cart = req.session.cart.filter(i => String(i._id) !== String(id));

    const totalCount = req.session.cart.reduce((s, i) => s + i.qty, 0);
    return res.json({ success: true, count: totalCount, cart: req.session.cart });
  } catch (err) {
    console.error('removeItem error:', err);
    return res.status(500).json({ success: false });
  }
};

// ==========================
// GET CART
// ==========================
exports.getCart = (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);

  res.render('cart', {
    cart,
    total,
    name: req.session.userName,
    cartCount: res.locals.cartCount,
    user: res.locals.user,
  });
};
