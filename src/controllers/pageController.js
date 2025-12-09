// src/controllers/pageController.js
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

/* =============================
   🏠 HOME PAGE
============================= */
exports.getHome = (req, res) => {
  try {
    const productsPath = path.join(__dirname, "..", "data", "products.json");
    const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
    res.render("index", {
      name: req.session?.userName || null,
      products
    });
  } catch (err) {
    console.error("❌ Error loading homepage products:", err.message);
    res.render("index", { name: req.session?.userName || null, products: [] });
  }
};

/* =============================
   🏬 SHOP PAGE
============================= */
exports.getShop = (req, res) => {
  try {
    const shopProductsPath = path.join(__dirname, "..", "data", "shopProducts.json");
    const products = JSON.parse(fs.readFileSync(shopProductsPath, "utf8"));
    res.render("shop", {
      name: req.session?.userName || null,
      products
    });
  } catch (err) {
    console.error("❌ Error loading shopProducts.json:", err.message);
    res.render("shop", { name: req.session?.userName || null, products: [] });
  }
};

/* =============================
   👕 MEN’S PAGE
============================= */
exports.getMens = (req, res) => {
  try {
    const mensPath = path.join(__dirname, "..", "data", "mensProducts.json");
    const products = JSON.parse(fs.readFileSync(mensPath, "utf8"));

    const mensTopwear = products.filter(p => p.type === "upper");
    const mensBottomwear = products.filter(p => p.type === "lower");
    const mensFootwear = products.filter(p => p.type === "footwear");
    const mensAccessories = products.filter(p => p.type === "accessories");

    res.render("mens", {
      name: req.session?.userName || null,
      mensTopwear,
      mensBottomwear,
      mensFootwear,
      mensAccessories
    });
  } catch (err) {
    console.error("❌ Error loading mensProducts.json:", err.message);
    res.render("mens", {
      name: req.session?.userName || null,
      mensTopwear: [],
      mensBottomwear: [],
      mensFootwear: [],
      mensAccessories: []
    });
  }
};

exports.getMensOutwears = (req, res) => {
  try {
    const outwearsPath = path.join(__dirname, "..", "data", "man_outwears.json");
    const mensOutwears = JSON.parse(fs.readFileSync(outwearsPath, "utf8"));

    res.render("man_outwears", {
      name: req.session?.userName || null,
      mensOutwears
    });
  } catch (err) {
    console.error("❌ Error loading man_outwears.json:", err.message);
    res.render("man_outwears", {
      name: req.session?.userName || null,
      mensOutwears: []
    });
  }
};

/* =============================
   👚 WOMEN’S PAGE
============================= */
exports.getWomens = (req, res) => {
  try {
    const womensPath = path.join(__dirname, "..", "data", "womensProducts.json");
    const products = JSON.parse(fs.readFileSync(womensPath, "utf8"));

    const womensTopwear = products.filter(p => p.type === "upper");
    const womensBottomwear = products.filter(p => p.type === "lower");
    const womensFootwear = products.filter(p => p.type === "footwear");
    const womensAccessories = products.filter(p => p.type === "accessories");

    res.render("womens", {
      name: req.session?.userName || null,
      womensTopwear,
      womensBottomwear,
      womensFootwear,
      womensAccessories
    });
  } catch (err) {
    console.error("❌ Error loading womensProducts.json:", err.message);
    res.render("womens", {
      name: req.session?.userName || null,
      womensTopwear: [],
      womensBottomwear: [],
      womensFootwear: [],
      womensAccessories: []
    });
  }
};

exports.getWomensBottomwear = (req, res) => {
  try {
    const wearsPath = path.join(__dirname, "..", "data", "woman_bottoms.json");
    const womensBottomwear = JSON.parse(fs.readFileSync(wearsPath, "utf8"));

    res.render("woman_bottoms", {
      name: req.session?.userName || null,
      womensBottomwear
    });
  } catch (err) {
    console.error("❌ Error loading woman_bottoms.json:", err.message);
    res.render("woman_bottoms", {
      name: req.session?.userName || null,
      womensBottomwear: []
    });
  }
};

exports.getAccessories = (req, res) => {
  try {
    const accessoriesPath = path.join(__dirname, "..", "data", "accessories.json");
    const accessories = JSON.parse(fs.readFileSync(accessoriesPath, "utf8"));

    res.render("accessories", {
      name: req.session?.userName || null,
      accessories
    });
  } catch (err) {
    console.error("❌ Error loading accessories.json:", err.message);
    res.render("accessories", {
      name: req.session?.userName || null,
      accessories: []
    });
  }
};


/* =============================
   📦 INDIVIDUAL PRODUCT PAGE
============================= */
exports.getProduct = (req, res) => {
  try {
    const id = (req.params.id || "").trim().toLowerCase();

    const productFiles = [
      "products.json",
      "shopProducts.json",
      "mensProducts.json",
      "womensProducts.json",
      "man_outwears.json",
      "woman_bottoms.json",
      "accessories.json", 
      "featured.json"
    ];

    let product = null;

    for (const file of productFiles) {
      const possiblePaths = [
        path.join(__dirname, "..", "data", file),
        path.join(process.cwd(), "src", "data", file),
        path.join(process.cwd(), "data", file)
      ];

      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const found = data.find(p => p.id.toLowerCase() === id);
          if (found) {
            console.log(`✅ Found "${id}" in ${filePath}`);
            product = found;
            break;
          }
        }
      }

      if (product) break;
    }

    if (!product) {
      console.warn(`⚠️ Product not found for ID: ${id}`);
      return res.status(404).render("404", {
        message: "Product not found",
        name: req.session?.userName || null
      });
    }

    res.render("product", {
      product,
      name: req.session?.userName || null
    });

  } catch (err) {
    console.error("❌ Error loading product:", err);
    res.status(500).render("404", {
      message: "Server Error",
      name: req.session?.userName || null
    });
  }
};

/* =============================
   💳 DIRECT CHECKOUT
============================= */
exports.directCheckout = (req, res) => {
  try {
    const { id } = req.body;
    const shopPath = path.join(__dirname, "..", "data", "shopProducts.json");
    const products = JSON.parse(fs.readFileSync(shopPath, "utf8"));
    const product = products.find((p) => String(p.id) === String(id));

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
  } catch (err) {
    console.error("❌ Direct checkout error:", err);
    res.status(500).send("Internal Server Error");
  }
};

/* =============================
   📄 STATIC PAGES
============================= */
/* =============================
   🌟 FEATURED (Fusion) PAGE
============================= */
exports.getFeatured = (req, res) => {
  try {
    const featuredPath = path.join(__dirname, "..", "data", "featured.json");
    const products = JSON.parse(fs.readFileSync(featuredPath, "utf8"));

    res.render("featured", {
      name: req.session?.userName || null,
      title: "Fusion Collection — FitHive",
      products
    });
  } catch (err) {
    console.error("❌ Error loading featured.json:", err.message);
    res.render("featured", {
      name: req.session?.userName || null,
      title: "Fusion Collection — FitHive",
      products: []
    });
  }
};

exports.getAbout = (req, res) =>
  res.render("about", { name: req.session?.userName || null });
exports.getPrivacy = (req, res) =>
  res.render("privacy", { name: req.session?.userName || null });
exports.getTerms = (req, res) =>
  res.render("terms", { name: req.session?.userName || null });

/* =============================
   👤 PROFILE & EDIT
============================= */
exports.getProfile = (req, res) => {
  const user = {
    id: req.session.userId,
    name: req.session.userName,
    email: req.session.userEmail
  };
  res.render("profile", { name: req.session.userName, user, query: req.query });
};

exports.getProfileEdit = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).lean();
    if (!user) return res.redirect("/login");

    res.render("profile_edit", {
      name: req.session.userName,
      user,
      query: req.query
    });
  } catch (err) {
    console.error("❌ Error fetching user for edit:", err);
    res.redirect("/profile");
  }
};

exports.postProfileEdit = async (req, res) => {
  try {
    const { fullname, email } = req.body;
    if (!fullname || !email)
      return res.redirect("/profile/edit?error=Missing+name+or+email");

    const existing = await User.findOne({
      email,
      _id: { $ne: req.session.userId }
    });
    if (existing)
      return res.redirect("/profile/edit?error=Email+already+in+use");

    const updated = await User.findByIdAndUpdate(
      req.session.userId,
      { fullname, email },
      { new: true, runValidators: true }
    ).lean();

    if (!updated)
      return res.redirect("/profile/edit?error=Update+failed");

    req.session.userName = updated.fullname;
    req.session.userEmail = updated.email;

    res.redirect("/profile?success=1");
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.redirect("/profile/edit?error=Server+error");
  }
};

/* =============================
   💖 WISHLIST
============================= */
exports.getWishlist = (req, res) => {
  const wishlist = req.session.wishlist || [];
  res.render("wishlist", { name: req.session.userName, wishlist });
};

exports.postWishlistAdd = (req, res) => {
  const { id, title, price, img } = req.body;
  if (!id || !title) return res.status(400).send("Invalid item");
  req.session.wishlist = req.session.wishlist || [];
  if (!req.session.wishlist.find((i) => i.id === id))
    req.session.wishlist.push({ id, title, price, img });
  res.redirect("/wishlist");
};

exports.postWishlistRemove = (req, res) => {
  const { id } = req.body;
  req.session.wishlist = (req.session.wishlist || []).filter((i) => i.id !== id);
  res.redirect("/wishlist");
};

exports.postWishlistClear = (req, res) => {
  req.session.wishlist = [];
  res.redirect("/wishlist");
};
