// src/helpers/productsData.js
const fs = require("fs");
const path = require("path");

// ✅ List all possible product data files
const productFiles = [
  "products.json",       // homepage products
  "shopProducts.json",   // shop page products
  "mensProducts.json",   // men's page
  "womensProducts.json",  // women's page (future-proof)
  "man_outwears.json",
  "woman_bottoms.json",
  "accessories.json",
  "featured.json"
];

// ✅ Safe loader for any JSON file
function loadFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      return JSON.parse(raw);
    } else {
      console.warn("⚠️ File not found:", filePath);
      return [];
    }
  } catch (err) {
    console.error("❌ Error loading file:", filePath, err.message);
    return [];
  }
}

// ✅ Load and merge all products from all sources
function loadAllProducts() {
  const allProducts = [];
  for (const file of productFiles) {
    const filePath = path.join(__dirname, "..", "data", file);
    const products = loadFile(filePath);
    allProducts.push(...products);
  }
  return allProducts;
}

// ✅ Fetch product by ID (supports all files)
function getProductById(id) {
  if (!id) return null;
  const target = String(id).trim().toLowerCase();

  const allProducts = loadAllProducts();
  const found = allProducts.find(
    (p) =>
      String(p.id).toLowerCase() === target ||
      String(p._id).toLowerCase() === target ||
      (p.slug && String(p.slug).toLowerCase() === target)
  );

  if (!found) console.warn(`⚠️ Product not found for ID: ${id}`);
  else console.log(`✅ Found product "${found.name}" (${id})`);

  return found || null;
}

module.exports = {
  getProductById,
  getAllProducts: loadAllProducts
};
