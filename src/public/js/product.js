document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // IMAGE SLIDER
  // ==========================
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? "block" : "none";
    });
  }

  prevBtn?.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });

  nextBtn?.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });

  showSlide(currentSlide);

  // ==========================
  // ADD TO CART
  // ==========================
  const form = document.getElementById("addToCartForm");
  const sizeSelect = document.getElementById("sizeSelect");
  const colorSelect = document.getElementById("colorSelect");
  const quantityInput = document.getElementById("quantity");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector(".add-to-cart");
    const productId = btn.dataset.productId;
    const size = sizeSelect?.disabled ? null : (sizeSelect?.value || null);
    const color = colorSelect?.value || null;
    const quantity = parseInt(quantityInput?.value) || 1;

    if (!productId) return alert("Product not found!");

    btn.disabled = true;
    btn.innerHTML = "Adding...";

    try {
      const res = await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: productId, size, color, qty: quantity }),
      });

      const data = await res.json();
      if (data.success) {
        btn.innerHTML = "Added!";
        if (typeof updateCartCount === "function") updateCartCount(data.count);
        setTimeout(() => {
          btn.innerHTML = '<i class="fa fa-cart-plus"></i> Add to Cart';
        }, 1500);
      } else {
        alert(data.message || "Error adding to cart!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart!");
    } finally {
      btn.disabled = false;
    }
  });

  // ==========================
  // CUSTOMIZATION MODAL
  // ==========================
  const modal = document.getElementById("customizationModal");
  const closeModalBtn = document.querySelector(".custom-close");
  const formCustom = document.getElementById("customizationForm");
  const productNameSpan = document.getElementById("customProductName");
  const productIdInput = document.getElementById("customProductId");
  const productTypeInput = document.getElementById("customProductType");
  const upperBodyFields = document.getElementById("upperBodyFields");
  const lowerBodyFields = document.getElementById("lowerBodyFields");
  const coordFields = document.getElementById("coordFields");

  // ✅ Open modal when customize icon clicked
  document.querySelectorAll(".customize-badge").forEach((badge) => {
    badge.addEventListener("click", () => {
      const productName = badge.dataset.productName;
      const productId = badge.dataset.productId;
      const productType = badge.dataset.productType || "upper";

      if (!productId) return alert("Missing product ID!");

      // Fill modal data
      productNameSpan.textContent = productName;
      productIdInput.value = productId;
      productTypeInput.value = productType;

      // Show relevant fields
      upperBodyFields.classList.add("hidden");
      lowerBodyFields.classList.add("hidden");
      coordFields?.classList.add("hidden");
      if (productType === "upper") upperBodyFields.classList.remove("hidden");
      if (productType === "lower") lowerBodyFields.classList.remove("hidden");
      if (productType === "coord") coordFields?.classList.remove("hidden");

      // Show modal
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";

      // Disable normal size dropdown when customizing
      if (sizeSelect) {
        sizeSelect.disabled = true;
        sizeSelect.style.opacity = "0.6";
        sizeSelect.title = "Size not applicable for customized products";
      }
    });
  });

  // ✅ Close modal
  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    formCustom?.reset();

    // Re-enable size dropdown
    if (sizeSelect) {
      sizeSelect.disabled = false;
      sizeSelect.style.opacity = "1";
      sizeSelect.title = "";
    }
  }

  closeModalBtn?.addEventListener("click", closeModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ==========================
  // TOAST HELPER (used by wishlist + customization)
  // ==========================
  let toastTimeout;
  function showToast(message, type = "success") {
    let toast = document.getElementById("globalToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.className = "toast-message";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.remove("success", "warning");
    toast.classList.add(type);
    toast.classList.add("show");

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  // ✅ Save Customization (updated)
  formCustom?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(formCustom).entries());
    const saveBtn = formCustom.querySelector("button[type='submit']");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const productId = data.productId;
      const customization = { ...data };
      delete customization.productId;

      const payload = {
        _id: productId,
        customized: true,
        customization,
        qty: 1,
      };

      const res = await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        // 🔥 Same vibe as Add to Cart
        saveBtn.textContent = "Added!";
        if (typeof updateCartCount === "function") updateCartCount(result.count);
        showToast("Customized product added to cart", "success");

        setTimeout(() => {
          closeModal();
          saveBtn.textContent = "Save Customization";
        }, 1500);
      } else {
        alert(result.message || " Failed to add customized product.");
        saveBtn.textContent = "Save Customization";
      }
    } catch (err) {
      console.error(err);
      alert("Network error!");
      saveBtn.textContent = "Save Customization";
    } finally {
      saveBtn.disabled = false;
    }
  });

  // ==========================
  // WISHLIST LOGIC + TOAST
  // ==========================
  const wishlistBtn = document.querySelector(".wishlist-btn");

  wishlistBtn?.addEventListener("click", async () => {
    const id = wishlistBtn.dataset.productId;
    const name = wishlistBtn.dataset.productName;
    const price = wishlistBtn.dataset.productPrice;
    const img = wishlistBtn.dataset.productImage;

    if (!id) return;

    // Same style as Add to Cart
    const originalHtml = wishlistBtn.innerHTML;
    wishlistBtn.disabled = true;
    wishlistBtn.textContent = "Adding...";

    try {
      const res = await fetch("/profile/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, price, img }),
      });
      const data = await res.json();
      const msg = (data.message || "").toLowerCase();

      if (data.success) {
        // 1️⃣ FIRST TIME: Added
        wishlistBtn.classList.add("added");
        wishlistBtn.textContent = "Added!";
        showToast("Added to wishlist", "success");

        setTimeout(() => {
          wishlistBtn.innerHTML =
            '<i class="fa fa-heart" style="color:red"></i>';
          wishlistBtn.disabled = false;
        }, 1500);
      } else if (msg.includes("already") && msg.includes("wishlist")) {
        // 2️⃣ NEXT TIMES: Already in wishlist
        wishlistBtn.classList.add("added");
        wishlistBtn.innerHTML =
          '<i class="fa fa-heart" style="color:red"></i>';
        wishlistBtn.disabled = false;
        showToast("Already in wishlist", "warning");
      } else {
        wishlistBtn.disabled = false;
        wishlistBtn.innerHTML = originalHtml;
        alert(data.message || "⚠️ Failed to add to wishlist.");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      wishlistBtn.disabled = false;
      wishlistBtn.innerHTML = originalHtml;
      alert("❌ Something went wrong!");
    }
  });
});
