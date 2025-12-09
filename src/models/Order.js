const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      _id: { type: String, required: true },
      name: String,
      price: Number,
      qty: Number,
      size: String,
      color: String,
      image: String,           // ✅ added for product image
      customized: Boolean,     // ✅ added flag for customized item
      customization: Object    // ✅ added full customization details
    }
  ],
  totalAmount: Number,
  address: Object,
  paymentMethod: String,
  status: { type: String, default: "paid" }, // ✅ ensures visible on page
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
