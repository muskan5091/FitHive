// Show the notification popup only once per session
window.onload = function () {
    if (!sessionStorage.getItem('notificationShown')) {
        const notificationModal = new bootstrap.Modal(document.getElementById('notification-popup'));
        notificationModal.show();
        sessionStorage.setItem('notificationShown', 'true');
    }
};

// Function to handle subscription
function subscribe() {
    alert('You have subscribed for notifications!');
    const notificationModal = bootstrap.Modal.getInstance(document.getElementById('notification-popup'));
    notificationModal.hide();
}

// Function to decline notifications
function declineNotifications() {
    const notificationModal = bootstrap.Modal.getInstance(document.getElementById('notification-popup'));
    notificationModal.hide();
}

// Global cart object to store items
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to add items to the cart
function addToCartWithQuantity(itemName, itemPrice, quantityInputId) {
    const quantity = parseInt(document.getElementById(quantityInputId).value);

    if (quantity > 0) {
        // Check if item already exists in the cart
        const existingProduct = cart.find(item => item.name === itemName);

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ name: itemName, price: itemPrice, quantity: quantity });
        }

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update cart count and display confirmation
        updateCartCount();
        showAddToCartMessage(itemName, quantity);
    } else {
        alert("Please select a valid quantity.");
    }
}

// Function to display a message when an item is added to the cart
function showAddToCartMessage(itemName, quantity) {
    alert(`${quantity} x ${itemName} has been added to your cart.`);
}

// Function to update cart item count in the header
function updateCartCount() {
    const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const cartItemCountElement = document.getElementById('cart-item-count');

    if (cartItemCountElement) {
        cartItemCountElement.textContent = cartItemCount;
        cartItemCountElement.style.display = cartItemCount > 0 ? 'inline-block' : 'none';
    } else {
        console.log('Cart item count element not found.');
    }
}

// Function to load cart items and display them
function loadCartItems() {
    const itemsList = document.getElementById("items-list");
    itemsList.innerHTML = ''; // Clear existing items

    if (cart.length === 0) {
        itemsList.innerHTML = "Your cart is empty.";
        return;
    }

    let totalBeforeTax = 0;
    cart.forEach((item, index) => {
        const itemString = `${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`;
        const itemDiv = document.createElement("div");
        itemDiv.innerHTML = `${itemString} <button onclick="removeFromCart(${index})">Remove</button>`;
        itemsList.appendChild(itemDiv);

        totalBeforeTax += item.price * item.quantity;
    });

    updateTotals(totalBeforeTax);
}

// Function to update totals
function updateTotals(totalBeforeTax) {
    const shipping = 40;
    const estimatedTax = totalBeforeTax * 0.10;
    const orderTotal = totalBeforeTax + shipping + estimatedTax;

    document.getElementById("shipping").innerText = `₹${shipping.toFixed(2)}`;
    document.getElementById("total-before-tax").innerText = `₹${totalBeforeTax.toFixed(2)}`;
    document.getElementById("estimated-tax").innerText = `₹${estimatedTax.toFixed(2)}`;
    document.getElementById("order-total").innerText = `₹${orderTotal.toFixed(2)}`;
}

// Function to generate a PDF of the order summary
function generatePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Order Summary", 10, 10);
    doc.setFontSize(12);

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone-number").value;
    const address = document.getElementById("address").value;
    const paymentMethod = document.getElementById("payment").value;

    doc.text(`Name: ${name}`, 10, 30);
    doc.text(`Phone: ${phone}`, 10, 40);
    doc.text(`Address: ${address}`, 10, 50);
    doc.text(`Payment Method: ${paymentMethod}`, 10, 60);

    let yPosition = 70;
    doc.text("Items", 10, yPosition);
    doc.text("Price", 70, yPosition);
    doc.text("Quantity", 120, yPosition);
    doc.text("Subtotal", 160, yPosition);
    yPosition += 10;

    cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        doc.text(item.name, 10, yPosition);
        doc.text(item.price.toFixed(2), 70, yPosition);
        doc.text(item.quantity.toString(), 120, yPosition);
        doc.text(itemSubtotal.toFixed(2), 160, yPosition);
        yPosition += 10;
    });

    const totalBeforeTax = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const estimatedTax = totalBeforeTax * 0.10;
    const orderTotal = totalBeforeTax + estimatedTax;

    doc.text(`Total before tax: ₹${totalBeforeTax.toFixed(2)}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Estimated tax (10%): ₹${estimatedTax.toFixed(2)}`, 10, yPosition);
    yPosition += 10;
    doc.text(`Order total: ₹${orderTotal.toFixed(2)}`, 10, yPosition);

    doc.save('order_summary.pdf');
}

// Function to remove an item from the cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
}

// Load cart items on page load
document.addEventListener("DOMContentLoaded", () => {
    loadCartItems();
});