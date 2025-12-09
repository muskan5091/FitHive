document.addEventListener("DOMContentLoaded", () => {
  // Quantity change
  document.querySelectorAll(".plus-btn, .minus-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const itemEl = e.target.closest(".cart-item");
      const id = itemEl.dataset.id;
      const qtyEl = itemEl.querySelector(".qty");
      let qty = parseInt(qtyEl.textContent);

      if (e.target.classList.contains("plus-btn")) qty++;
      else if (qty > 1) qty--;

      qtyEl.textContent = qty;

      const res = await fetch("/cart/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, qty })
      });
      const data = await res.json();
      if (data.success) updateCartCount(data.count);
    });
  });

  // Remove item
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const itemEl = e.target.closest(".cart-item");
      const id = itemEl.dataset.id;

      const res = await fetch(`/cart/remove/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        itemEl.remove();
        updateCartCount(data.count);
        if (data.cart.length === 0) location.reload();
      }
    });
  });
});
