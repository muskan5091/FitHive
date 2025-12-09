const express = require("express");
const router = express.Router();

// Add to wishlist
router.post("/add", (req, res) => {
  const { id, name, price, img } = req.body;
  if (!id || !name) {
    return res.json({ success: false, message: "Invalid product data" });
  }

  if (!req.session.wishlist) req.session.wishlist = [];

  // Check if already in wishlist
  const exists = req.session.wishlist.find(item => item.id === id);
  if (exists) {
    return res.json({ success: false, message: "Already in wishlist" });
  }

  req.session.wishlist.push({ id, title: name, price, img });
  res.json({ success: true, count: req.session.wishlist.length });
});

// Remove one
router.post("/remove", (req, res) => {
  const { id } = req.body;
  if (!req.session.wishlist) req.session.wishlist = [];
  req.session.wishlist = req.session.wishlist.filter(item => item.id !== id);
  res.redirect("/profile/wishlist");
});

// Clear all
router.post("/clear", (req, res) => {
  req.session.wishlist = [];
  res.redirect("/profile/wishlist");
});

// Wishlist page
router.get("/", (req, res) => {
  res.render("wishlist", { wishlist: req.session.wishlist || [] });
});

module.exports = router;
