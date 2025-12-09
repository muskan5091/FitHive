// routes/search.js (for example)
const express = require("express");
const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");

const router = express.Router();

const dataFolder = path.join(__dirname, "../data");

/* ======================================
   SIMPLE PAGE SHORTCUTS (NOT PRODUCTS)
   ====================================== */
const keywordRoutes = {
  // MEN
  men: "/mens",
  mens: "/mens",
  "men's": "/mens",

  // WOMEN
  women: "/womens",
  womens: "/womens",
  "women's": "/womens",

  // GENERIC
  shop: "/shop",
  all: "/shop",
  featured: "/featured",
  contact: "/contact",
  about: "/about",
};

const typeLabelMap = {
  upper: "Topwear",
  lower: "Bottomwear",
  footwear: "Footwear",
  accessories: "Accessories",
};

/* ======================================
   LOAD ALL PRODUCTS FROM /data/*.json
   ====================================== */
function loadAllProducts() {
  let allProducts = [];
  const files = fs.readdirSync(dataFolder);

  files.forEach((file) => {
    if (!file.endsWith(".json")) return;

    const fullPath = path.join(dataFolder, file);
    const raw = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    if (!Array.isArray(raw)) return;

    // infer gender from filename
    const lowerFile = file.toLowerCase();
    const gender = lowerFile.includes("women")
      ? "Women"
      : lowerFile.includes("men")
      ? "Men"
      : "";

    const fromFile = raw.map((p) => {
      const typeLabel = typeLabelMap[p.type] || "";
      const category = [gender, typeLabel].filter(Boolean).join(" • ");

      const id = p._id || p.id;
      const slug =
        p.id ||
        p._id ||
        p.slug ||
        p.name.toLowerCase().replace(/\s+/g, "-");

      return {
        id,
        name: p.name,
        slug,
        desc: p.desc || "",
        gender,
        type: p.type || "",
        category, // e.g. "Women • Footwear"
        url: `/product/${id}`,
      };
    });

    allProducts.push(...fromFile);
  });

  return allProducts;
}

const products = loadAllProducts();

/* ======================================
   CONFIGURE FUSE
   ====================================== */
const fuse = new Fuse(products, {
  includeScore: true,
  keys: [
    { name: "name", weight: 0.6 },
    { name: "desc", weight: 0.2 },
    { name: "category", weight: 0.2 },
  ],
  threshold: 0.35,
  minMatchCharLength: 2,
});

/* ======================================
   SEARCH SUGGEST API
   ====================================== */
router.get("/search/suggest", (req, res) => {
  const raw = (req.query.q || "").trim();
  if (!raw) return res.json({ suggestions: [] });

  const q = raw.toLowerCase();

  // 1️⃣ Page shortcuts (Men / Women / Shop / etc.)
  if (keywordRoutes[q]) {
    return res.json({
      suggestions: [
        {
          name: raw.toUpperCase(),
          category: "Page",
          url: keywordRoutes[q],
        },
      ],
    });
  }

  // 2️⃣ Detect gender words in query (for better realism)
  const tokens = q.split(/\s+/);
  let genderFilter = null;
  if (tokens.includes("women") || tokens.includes("women's")) {
    genderFilter = "Women";
  } else if (tokens.includes("men") || tokens.includes("men's") || tokens.includes("mens")) {
    genderFilter = "Men";
  }

  // 3️⃣ Fuzzy search products with Fuse
  let results = fuse.search(q);

  // Prefer matching gender if present in query
  if (genderFilter) {
    const filtered = results.filter((r) => r.item.gender === genderFilter);
    if (filtered.length > 0) {
      results = filtered;
    }
  }

  const suggestions = results.slice(0, 8).map((r) => ({
    name: r.item.name,                 // "Women's Running Shoes"
    url: r.item.url,                   // "/product/women-running-shoes"
    category: r.item.category || "",   // "Women • Footwear"
  }));

  return res.json({ suggestions });
});

module.exports = router;
