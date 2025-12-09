// src/controllers/customizeController.js
const { getProductById } = require("../helpers/productsData");

exports.saveCustomization = (req, res) => {
  try {
    const { productId, productType, chest, sleeveLength, waist, length, fit, notes } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "❌ Product not found!" });
    }

    console.log("🧵 Customization received:", { productId, waist, length, sleeveLength, notes });

    if (!req.session.customizations) req.session.customizations = [];

    const customization = {
      productId,
      productType,
      chest,
      sleeveLength,
      waist,
      length,
      fit,
      notes,
      customized: true,
      date: new Date(),
    };

    req.session.customizations.push(customization);

    const product = getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "❌ Product not found in catalog" });
    }

    if (!req.session.cart) req.session.cart = [];
    req.session.cart.push({
      _id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
      customized: true,
      customization,
    });

    res.json({ success: true, message: "✅ Customization saved & added to cart!" });
  } catch (err) {
    console.error("Customization save error:", err);
    res.status(500).json({ success: false, message: "⚠️ Failed to save customization." });
  }
};
