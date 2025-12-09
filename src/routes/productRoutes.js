// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { getProductById, getAllProducts } = require('../helpers/productsData');

// Product listing (shop) — adjust if you already have this in pageRoutes
router.get('/all', (req, res) => {
  const products = getAllProducts();
  res.render('shop', { products, name: req.session.userName });
});

// Single product page (/:id)
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const product = getProductById(id);
  if (!product) {
    return res.status(404).render('productNotFound', { name: req.session.userName });
  }
  res.render('product', { product, name: req.session.userName });
});

// Direct checkout from product page (if needed)
router.post('/direct', (req, res) => {
  const { id } = req.body;
  const product = getProductById(id);
  if (!product) return res.status(404).send('Product not found');

  req.session.cart = [{
    _id: product.id || product._id,
    name: product.name,
    price: product.price,
    qty: 1,
    image: product.image,
    customization: {}
  }];

  res.redirect('/checkout/address');
});

module.exports = router;
