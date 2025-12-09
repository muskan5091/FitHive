
// Add this to /js/script.js or just before </body>
document.addEventListener('DOMContentLoaded', () => {
  // Helper: navigate to href
  const go = (href) => { if (!href) return; window.location.href = href; };

  // SALE CARDS: clicking the card navigates to the related link
  document.querySelectorAll('.sale__card').forEach(card => {
    // find anchor in card (either direct <a> or the <a> wrapping the button)
    let anchor = card.querySelector('a');
    // fallback: check button's closest anchor
    const btn = card.querySelector('.sale__btn, button');
    if (!anchor && btn) anchor = btn.closest('a');

    // fallback: data-href attribute on card
    const href = (anchor && anchor.getAttribute('href')) || card.dataset.href || null;
    if (!href) return;

    card.style.cursor = 'pointer';

    // Click on card (but ignore clicks that are already on links or buttons)
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return; // let native <a>/<button> work
      go(href);
    });

    // If the button is not wrapped in an <a>, ensure it navigates
    if (btn && !btn.closest('a')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        go(href);
      });
    }
  });

  // MUST-HAVE CARDS: clicking the card navigates to the product link
  document.querySelectorAll('.musthave__card').forEach(card => {
    // product link in your template: <a class="product-link" href="...">
    const productLink = card.querySelector('.product-link');
    const href = (productLink && productLink.getAttribute('href')) || card.dataset.href || null;
    if (!href) return;

    card.style.cursor = 'pointer';

    card.addEventListener('click', (e) => {
      // ignore if click was on a link/button (so default behavior remains)
      if (e.target.closest('a') || e.target.closest('button')) return;
      go(href);
    });
  });
});



// ==========================
// CUSTOMIZATION MODAL HANDLER (GLOBAL)
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("customizationModal");
  if (!modal) return; // Safety for pages without modal

  const closeBtn = modal.querySelector(".custom-close");
  const form = modal.querySelector("#customizationForm");
  const productNameElem = modal.querySelector("#customProductName");
  const productIdElem = modal.querySelector("#customProductId");
  const productTypeElem = modal.querySelector("#customProductType");

  const upperFields = modal.querySelector("#upperBodyFields");
  const lowerFields = modal.querySelector("#lowerBodyFields");
  const coordFields = modal.querySelector("#coordFields");

  // ✅ Open modal on any Customize icon click
  document.querySelectorAll(".customize-badge").forEach(btn => {
    btn.style.cursor = "pointer"; // ensure clickable
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      const productName = btn.dataset.productName || "Product";
      const productId = btn.dataset.productId || "";
      const productType = btn.dataset.productType?.toLowerCase() || "upper";

      productNameElem.textContent = productName;
      productIdElem.value = productId;
      productTypeElem.value = productType;

      // Toggle fields
      [upperFields, lowerFields, coordFields].forEach(f => f.classList.add("hidden"));
      if (productType === "upper") upperFields.classList.remove("hidden");
      else if (productType === "lower") lowerFields.classList.remove("hidden");
      else if (productType === "coord") coordFields.classList.remove("hidden");

      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  // ✅ Close modal
  closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    form.reset();
  }

  // ✅ Save Customization
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.productId) return alert("Missing product ID!");

    const saveBtn = form.querySelector("button[type='submit']");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      // Simulate save to localStorage or API
      localStorage.setItem("custom_" + data.productId, JSON.stringify(data));

      alert("Customization saved successfully!");
      closeModal();
    } catch (err) {
      console.error("Customization Error:", err);
      alert("Something went wrong while saving customization.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Customization";
    }
  });
});
