// src/app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// --- MongoDB (optional; you already had it) ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fithive')
  .then(()=>console.log("Connected to MongoDB"))
  .catch(err=>console.error("MongoDB connection error:",err));

// --- Middleware ---
app.use(express.urlencoded({ extended:true }));
app.use(express.json());

// static assets
app.use('/assests', express.static(path.join(process.cwd(), 'src', 'assests')));
app.use('/css', express.static(path.join(process.cwd(), 'src', 'css')));
app.use('/js', express.static(path.join(process.cwd(), 'src', 'js')));
app.use(express.static(path.join(__dirname,'public')));

// view engine
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

// session
app.use(session({
    secret: process.env.SESSION_SECRET || 'fithiveSecret',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
  res.locals.cart = req.session.cart || [];
  res.locals.cartCount = res.locals.cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  res.locals.user = req.session.userId
    ? {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail
      }
    : null;
  next();
});

// --- Routes (order matters) ---
const pageRoutes = require('./routes/pageRoutes');         // site pages (home, shop, mens, womens...)
const productsRouter = require('./routes/productRoutes');

const authRoutes = require('./routes/authRoutes');         // optional
const profileRoutes = require('./routes/profileRoutes');   // /profile
const cartRoutes = require('./routes/cartRoutes');         // /cart
const checkoutRoutes = require('./routes/checkoutRoutes'); // optional
const orderRoutes = require('./routes/orderRoutes');       // optional
const contactRoutes = require('./routes/contactRoutes'); 
const customizeRoutes = require('./routes/customizeRoutes');
const wishlistRoutes = require("./routes/wishlistRoutes");
app.use("/profile/wishlist", wishlistRoutes);
const searchSuggest = require("./routes/searchSuggest");
app.use("/", searchSuggest);



app.use('/', pageRoutes);         // homepage & shop listing routes

app.use('/cart', require("./routes/cartRoutes"));         // cart routes
app.use('/profile', profileRoutes);
app.use(authRoutes);
app.use('/checkout', checkoutRoutes);
app.use(orderRoutes);
app.use(contactRoutes);
app.use('/api/customize', customizeRoutes);


// fallback 404 for anything else (render views/404.ejs)
app.use((req, res) => {
  res.status(404).render('404', { name: req.session.userName || null, url: req.originalUrl });
});

// start
app.listen(port, ()=>console.log(`Server running at http://localhost:${port}`));

