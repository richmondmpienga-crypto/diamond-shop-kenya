
const SHOP_PHONE = "254706774720";

// Sample products. Replace prices with confirmed shop prices.
const products = [
  { id: 1, name: "Cooking Pot", price: 1500, icon: "🍲" },
  { id: 2, name: "Dinner Plates", price: 1200, icon: "🍽️" },
  { id: 3, name: "Water Glasses", price: 1000, icon: "🥛" },
  { id: 4, name: "Frying Pan", price: 1800, icon: "🍳" },
  { id: 5, name: "Kitchen Utensils", price: 500, icon: "🥄" },
  { id: 6, name: "Food Flask", price: 1600, icon: "🫖" }
];

let cart = [];

try {
  const saved = JSON.parse(localStorage.getItem("diamondCart") || "[]");
  if (Array.isArray(saved)) cart = saved;
} catch {
  cart = [];
}

function money(amount) {
  return "KSh " + amount.toLocaleString("en-KE");
}

function saveCart() {
  localStorage.setItem("diamondCart", JSON.stringify(cart));
}

function renderProducts() {
  const container = document.getElementById("productList");
  if (!container) return;

  container.innerHTML = products.map(product => `
    <div class="shop-product">
      <div class="product-icon">${product.icon}</div>
      <h3>${product.name}</h3>
      <p class="product-price">${money(product.price)}</p>
      <button onclick="addToCart(${product.id})">
        Add to Cart
      </button>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");
  if (!container || !totalElement) return;

  let total = 0;

  container.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";

    const subtotal = product.price * item.quantity;
    total += subtotal;

    return `
      <div class="cart-item">
        <span>${product.name} × ${item.quantity}</span>
        <strong>${money(subtotal)}</strong>
        <button onclick="removeFromCart(${item.id})">
          Remove
        </button>
      </div>
    `;
  }).join("") || "<p>Your cart is empty.</p>";

  totalElement.textContent = money(total);
}

function checkoutWhatsApp() {
  if (!cart.length) {
    alert("Please add products to your cart first.");
    return;
  }

  let total = 0;
  const lines = ["Hello Diamond Shop Kenya, I would like to order:"];

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;

    const subtotal = product.price * item.quantity;
    total += subtotal;
    lines.push(
      `${product.name} x ${item.quantity} - ${money(subtotal)}`
    );
  });

  lines.push(`Total: ${money(total)}`);
  lines.push("Please confirm availability and final prices.");

  window.open(
    `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`,
    "_blank",
    "noopener,noreferrer"
  );
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
});
