const fs = require("fs");
const path = require("path");

// ✅ Load homepage products (for index)
const productsPath = path.join(__dirname, "../data/products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));

// ✅ Shop page — loads shopProducts.json only
exports.getAllProducts = (req, res) => {
  try {
    const shopPath = path.join(__dirname, "../data/shopProducts.json");
    const shopProducts = JSON.parse(fs.readFileSync(shopPath, "utf8"));

    res.render("shop", {
      products: shopProducts,
      name: req.session?.userName || null
    });
  } catch (err) {
    console.error("❌ Failed to load shop products:", err);
    res.render("shop", { products: [], name: req.session?.userName || null });
  }
};

// ✅ Individual product page
exports.getProduct = (req, res) => {
  try {
    const id = req.params.id;
    const shopPath = path.join(__dirname, "../data/shopProducts.json");
    const shopProducts = JSON.parse(fs.readFileSync(shopPath, "utf8"));
    const product = shopProducts.find(p => p.id === id);

    if (!product)
      return res.status(404).render("404", { message: "Product not found" });

    res.render("product", {
      product,
      name: req.session?.userName || null
    });
  } catch (err) {
    console.error("❌ Error loading product:", err);
    res.status(500).render("404", { message: "Server error" });
  }
};

// ✅ Direct checkout from product page
exports.directCheckout = (req, res) => {
  const productId = req.body.id;
  const shopPath = path.join(__dirname, "../data/shopProducts.json");
  const shopProducts = JSON.parse(fs.readFileSync(shopPath, "utf8"));
  const product = shopProducts.find(p => String(p.id) === String(productId));

  if (!product)
    return res.status(404).json({ success: false, message: "Product not found" });

  req.session.cart = [
    {
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      image: product.image
    }
  ];

  res.redirect("/checkout");
};
