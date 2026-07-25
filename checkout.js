document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMBER = "971527717243";

  const catalog = [
    { name: "Classic Smash Burger", price: 11.99, category: "Burgers", image: "images/classic smash.jpg" },
    { name: "Fire Cheese Burger", price: 13.99, category: "Burgers", image: "images/Fire cheese.jpg" },
    { name: "Crispy Chicken Burger", price: 10.5, category: "Burgers", image: "images/chicken burger.jpg" },
    { name: "Spicy Chicken Wrap", price: 9.99, category: "Wraps", image: "images/spicy wrap.jpg" },
    { name: "Beef Shawarma Wrap", price: 10.99, category: "Wraps", image: "images/beef Wrap.jpg" },
    { name: "Tasty Power Bowl", price: 12.99, category: "Salads", image: "images/power bowl.jpg" },
    { name: "Buffalo Hot Wings", price: 12.5, category: "Poutine", image: "images/hot wings.jpg" },
    { name: "Lotus Milkshake", price: 7.5, category: "Drinks", image: "images/Lotus Biscoff Milkshakes.jpg" },
    { name: "Fresh Citrus Juice", price: 5.99, category: "Drinks", image: "images/Fresh  juices.jpg" },
  ];

  const categoryOrder = ["Poutine", "Burgers", "Wraps", "Salads", "Drinks"];

  const categoryWrap = document.getElementById("checkout-categories");
  const productWrap = document.getElementById("checkout-products");
  const cartWrap = document.getElementById("checkout-cart");
  const subtotalEl = document.getElementById("subtotal-amount");
  const deliveryFeeEl = document.getElementById("delivery-fee");
  const taxEl = document.getElementById("tax-amount");
  const totalEl = document.getElementById("total-amount");
  const summaryItemsEl = document.getElementById("summary-items");
  const summaryDeliveryEl = document.getElementById("summary-delivery");
  const summaryTaxEl = document.getElementById("summary-tax");
  const summaryTotalEl = document.getElementById("summary-total");
  const checkoutStatus = document.getElementById("checkout-status");
  const addressEl = document.getElementById("delivery-address");
  const deliveryTimeEl = document.getElementById("delivery-time");
  const placeOrderBtn = document.getElementById("place-order-btn");

  const params = new URLSearchParams(window.location.search);
  const preselected = params.get("item");

  let activeCategory = "Poutine";
  let mode = "delivery";
  const cart = new Map();

  if (preselected) {
    const selectedItem = catalog.find((item) => item.name.toLowerCase() === preselected.toLowerCase());
    if (selectedItem) {
      cart.set(selectedItem.name, 1);
      activeCategory = selectedItem.category;
    }
  }

  function money(value) {
    return `$${value.toFixed(2)}`;
  }

  function itemByName(name) {
    return catalog.find((item) => item.name === name);
  }

  function renderCategories() {
    categoryWrap.innerHTML = "";
    categoryOrder.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cat-btn${activeCategory === cat ? " is-active" : ""}`;
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        renderCategories();
        renderProducts();
      });
      categoryWrap.appendChild(btn);
    });
  }

  function addToCart(name) {
    const qty = cart.get(name) || 0;
    cart.set(name, qty + 1);
    renderCart();
  }

  function updateQty(name, delta) {
    const current = cart.get(name) || 0;
    const next = current + delta;
    if (next <= 0) {
      cart.delete(name);
    } else {
      cart.set(name, next);
    }
    renderCart();
  }

  function renderProducts() {
    const filtered = catalog.filter((item) => item.category === activeCategory);
    productWrap.innerHTML = "";

    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cover-image" />
        <h3>${item.name}</h3>
        <div class="product-row">
          <strong>${money(item.price)}</strong>
          <button type="button" class="add-btn">+</button>
        </div>
      `;
      card.querySelector(".add-btn").addEventListener("click", () => addToCart(item.name));
      productWrap.appendChild(card);
    });
  }

  function cartEntries() {
    return Array.from(cart.entries()).map(([name, qty]) => ({ item: itemByName(name), qty })).filter((entry) => entry.item);
  }

  function totals() {
    const subtotal = cartEntries().reduce((sum, entry) => sum + entry.item.price * entry.qty, 0);
    const deliveryFee = mode === "delivery" && subtotal > 0 ? 2.99 : 0;
    const tax = subtotal * 0.12;
    const total = subtotal + deliveryFee + tax;
    const totalItems = cartEntries().reduce((sum, entry) => sum + entry.qty, 0);
    return { subtotal, deliveryFee, tax, total, totalItems };
  }

  function renderCart() {
    const entries = cartEntries();
    cartWrap.innerHTML = "";

    if (entries.length === 0) {
      cartWrap.innerHTML = '<p class="empty-cart">No items selected yet. Pick meals from the left panel.</p>';
    } else {
      entries.forEach((entry) => {
        const row = document.createElement("article");
        row.className = "cart-item";
        row.innerHTML = `
          <img src="${entry.item.image}" alt="${entry.item.name}" class="cover-image" />
          <div class="cart-item-copy">
            <h3>${entry.item.name}</h3>
            <p>${money(entry.item.price)}</p>
          </div>
          <div class="qty-actions">
            <button type="button" class="qty-btn minus">-</button>
            <span>${entry.qty}</span>
            <button type="button" class="qty-btn plus">+</button>
          </div>
        `;

        row.querySelector(".minus").addEventListener("click", () => updateQty(entry.item.name, -1));
        row.querySelector(".plus").addEventListener("click", () => updateQty(entry.item.name, 1));
        cartWrap.appendChild(row);
      });
    }

    const t = totals();
    subtotalEl.textContent = money(t.subtotal);
    deliveryFeeEl.textContent = money(t.deliveryFee);
    taxEl.textContent = money(t.tax);
    totalEl.textContent = money(t.total);
    summaryItemsEl.textContent = String(t.totalItems);
    summaryDeliveryEl.textContent = money(t.deliveryFee);
    summaryTaxEl.textContent = money(t.tax);
    summaryTotalEl.textContent = money(t.total);
  }

  function selectedPayment() {
    const checked = document.querySelector('input[name="pay-method"]:checked');
    return checked ? checked.value : "Card";
  }

  function placeOrder() {
    const entries = cartEntries();
    if (entries.length === 0) {
      checkoutStatus.textContent = "Add at least one item before placing order.";
      checkoutStatus.classList.add("error");
      return;
    }

    const t = totals();
    const itemsLine = entries.map((entry) => `${entry.item.name} x${entry.qty}`).join("\n");

    const message = [
      "Hi Tasty Bites,",
      "",
      "Checkout order request:",
      itemsLine,
      "",
      `Mode: ${mode}`,
      `Address: ${addressEl.value.trim() || "Not provided"}`,
      `Time: ${deliveryTimeEl.value.trim() || "Not provided"}`,
      `Payment: ${selectedPayment()}`,
      `Subtotal: ${money(t.subtotal)}`,
      `Delivery Fee: ${money(t.deliveryFee)}`,
      `Tax: ${money(t.tax)}`,
      `Total: ${money(t.total)}`,
    ].join("\n");

    checkoutStatus.textContent = "Opening WhatsApp to confirm this checkout order...";
    checkoutStatus.classList.remove("error");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  }

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach((item) => item.classList.remove("is-active"));
      btn.classList.add("is-active");
      mode = btn.dataset.mode || "delivery";
      renderCart();
    });
  });

  placeOrderBtn.addEventListener("click", placeOrder);

  renderCategories();
  renderProducts();
  renderCart();
});
