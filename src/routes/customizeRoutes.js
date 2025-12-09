// src/routes/customizeRoutes.js
const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { productId, length, waist, sleeve, note } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, message: "Product not found." });
  }

  // Example: store in session temporarily (later, DB)
  if (!req.session.customizations) req.session.customizations = [];
  req.session.customizations.push({ productId, length, waist, sleeve, note });

  console.log("Customization Saved:", req.body);
  res.json({ success: true, message: "Customization saved successfully!" });
});

module.exports = router;
