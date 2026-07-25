/* ==========================================================================
   AHmazing Foods — Booking logic (prototype)
   - Cart-based: customer configures a meal, adds it to the order, and can
     add more before checking out.
   - Tiered rush fee: the fee charged PER MEAL drops as more meals are
     added to the same order, when delivery is requested within the rush
     window. Order size is capped — beyond the cap, customers are pointed
     to Catering or Trays & Platters instead.
   - Paystack + Google Calendar hooks are marked clearly below — they need
     live keys/a backend and are stubbed here so the flow is demonstrable.
   ========================================================================== */

const CATALOG = {
  soup: {
    label: "Soup",
    items: {
      "onugbu":  { name: "Onugbu Soup (Bitterleaf)", sizes: { "2L": 15000, "3L": 18000, "5L": 23000 } },
      "oha":     { name: "Oha Soup",                  sizes: { "2L": 15000, "3L": 18000, "5L": 23000 } },
      "okro":    { name: "Okro Soup",                 sizes: { "2L": 15000, "3L": 18000, "5L": 23000 } },
      "edikang": { name: "Edikang Ikong (Vegetable Soup)", sizes: { "2L": 15000, "3L": 18000, "5L": 23000 } },
      "egusi":   { name: "Egusi Soup",                sizes: { "2L": 15000, "3L": 18000, "5L": 23000 } },
      "banga":   { name: "Banga Soup (Ofe Akwu)",     sizes: { "2L": 15000, "3L": 18000, "5L": 23000 } },
      "eforiro": { name: "Efo-Riro",                  sizes: { "2L": 15000, "3L": 18000, "5L": 23000 } },
      "seafood": { name: "Seafood Okro (Fish, Shrimp, Prawns & Calamari)", sizes: { "5L": 35000 } }
    }
  },
  stew: {
    label: "Stew",
    items: {
      "tomato":  { name: "Classic Tomato Stew",  sizes: { "Medium": 14000, "Large": 24000 } },
      "ayamase": { name: "Ayamase (Ofada Stew)", sizes: { "Medium": 17000, "Large": 28000 } },
      "beef":    { name: "Peppered Beef Stew",   sizes: { "Medium": 15000, "Large": 25000 } },
      "chicken": { name: "Peppered Chicken Stew",sizes: { "Medium": 15000, "Large": 25000 } },
      "atadindin":{ name: "Ata Din-Din (Fried Pepper Stew)", sizes: { "Medium": 14500, "Large": 24500 } },
      "turkey":  { name: "Peppered Turkey Stew", sizes: { "Medium": 18000, "Large": 26500 } }
    }
  },
  breakfast: {
    label: "Breakfast",
    items: {
      "classic-nigerian": { name: "The Classic Nigerian — Akara (10pcs), Pap (1L), 2 Boiled Eggs", sizes: { "Standard": 22000 } },
      "hearty-plate":      { name: "The Hearty Plate — Yam & Plantain, Egg Stew (1L), Sausages, Choice of Juice", sizes: { "Standard": 22000 } },
      "sweet-start":       { name: "The Sweet Start — Oats (1L), Fresh Fruit Bowl, Choice of Juice", sizes: { "Standard": 25000 } },
      "protein-power":     { name: "The Protein Power — Moin-moin (2pcs), Akara (10pcs), Pap (1L), 2 Boiled Eggs", sizes: { "Standard": 25000 } }
    }
  }
};

const PROTEINS = {
  "none":    { name: "No extra protein", price: 0 },
  "beef":    { name: "Beef",             price: 3000 },
  "chicken": { name: "Chicken",          price: 3000 },
  "turkey":  { name: "Turkey",           price: 4000 },
  "croaker": { name: "Croaker",          price: 4000 },
  "tilapia": { name: "Tilapia",          price: 3000 },
  "catfish": { name: "Catfish",          price: 4000 },
  "snail":   { name: "Snail",            price: 15000 },
  "seafood": { name: "Mixed Seafood",    price: 10000 },
  "gizzard": { name: "Gizzard",          price: 4000 },
  "sausages":{ name: "Sausages",         price: 3000 }
};

// --- Rush premium rule -------------------------------------------------
// Within this many hours of the requested delivery time, a rush fee
// applies. The fee is charged PER MEAL, and the per-meal rate drops as
// more meals go into the same order. "Meals" = total quantity across
// every line in the cart. Beyond MAX_MEALS, the customer is directed to
// Catering / Trays & Platters instead of checking out here.
const RUSH_WINDOW_HOURS = 24;
const MAX_MEALS = 5;
const RUSH_TIERS = [
  { upTo: 1, perMeal: 20000 },
  { upTo: 2, perMeal: 15000 },
  { upTo: 3, perMeal: 13000 },
  { upTo: 4, perMeal: 12000 },
  { upTo: 5, perMeal: 10000 }
];

function rushRatePerMeal(mealCount) {
  const tier = RUSH_TIERS.find(t => mealCount <= t.upTo) || RUSH_TIERS[RUSH_TIERS.length - 1];
  return tier.perMeal;
}

const naira = (n) => "₦" + n.toLocaleString("en-NG");

let cart = [];

function populateCategory() {
  const catSelect = document.getElementById("category");
  const itemSelect = document.getElementById("item");
  itemSelect.innerHTML = "";
  const cat = CATALOG[catSelect.value];
  Object.entries(cat.items).forEach(([key, item]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = item.name;
    itemSelect.appendChild(opt);
  });
  populateSize();
}

function populateSize() {
  const catSelect = document.getElementById("category");
  const itemSelect = document.getElementById("item");
  const sizeSelect = document.getElementById("size");
  sizeSelect.innerHTML = "";
  const item = CATALOG[catSelect.value].items[itemSelect.value];
  Object.entries(item.sizes).forEach(([sizeKey, price]) => {
    const opt = document.createElement("option");
    opt.value = sizeKey;
    opt.textContent = `${sizeKey} — ${naira(price)}`;
    sizeSelect.appendChild(opt);
  });
  updateSummary();
}

function isRush(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const requested = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  const hoursUntil = (requested - now) / (1000 * 60 * 60);
  return hoursUntil >= 0 && hoursUntil < RUSH_WINDOW_HOURS;
}

// "Meals" for rush-fee tiering = number of DISTINCT dishes in the order,
// not total quantity/liters. Ordering 1L + 4L of the same soup is still
// one meal — it's one rush trip for the kitchen either way. Ordering
// Egusi (any amount) AND a different soup is two meals, charged
// separately, because that's two different dishes cooking at once.
function currentMealCount() {
  const distinctNames = new Set(cart.map(line => line.name));
  return distinctNames.size;
}

function addToCart() {
  const catKey = document.getElementById("category").value;
  const itemKey = document.getElementById("item").value;
  const sizeKey = document.getElementById("size").value;
  const qty = Math.max(1, parseInt(document.getElementById("qty").value || "1", 10));
  const proteinKey = document.getElementById("protein").value;

  const item = CATALOG[catKey].items[itemKey];
  const protein = PROTEINS[proteinKey];
  const unitPrice = item.sizes[sizeKey] || 0;

  const isNewDish = !cart.some(line => line.name === item.name);
  const wouldBeMealCount = currentMealCount() + (isNewDish ? 1 : 0);
  if (wouldBeMealCount > MAX_MEALS) {
    alert(`This order already has the maximum of ${MAX_MEALS} different meals for a single booking. For bigger orders, check out Catering or Trays & Platters — they're built for larger groups.`);
    return;
  }

  cart.push({
    name: item.name,
    size: sizeKey,
    qty: qty,
    unitPrice: unitPrice,
    proteinName: protein.name,
    proteinPrice: protein.price
  });

  document.getElementById("qty").value = 1;
  renderCart();
  updateSummary();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
  updateSummary();
}

function renderCart() {
  const container = document.getElementById("cart-lines");
  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">No meals added yet — configure one on the left and hit "Add to Order."</div>';
    return;
  }
  cart.forEach((line, i) => {
    const lineTotal = (line.unitPrice + line.proteinPrice) * line.qty;
    const row = document.createElement("div");
    row.className = "cart-line";
    row.innerHTML = `
      <div class="cart-line-info">
        <span class="cart-line-name">${line.name} (${line.size}) x${line.qty}</span>
        <span class="cart-line-sub">${line.proteinName}${line.proteinPrice ? " · +" + naira(line.proteinPrice) + "/unit" : ""}</span>
      </div>
      <span class="cart-line-price">${naira(lineTotal)}</span>
      <button type="button" class="cart-line-remove" data-index="${i}" aria-label="Remove">×</button>
    `;
    container.appendChild(row);
  });
  container.querySelectorAll(".cart-line-remove").forEach(btn => {
    btn.addEventListener("click", () => removeFromCart(parseInt(btn.dataset.index, 10)));
  });
}

function updateSummary() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  const subtotal = cart.reduce((sum, line) => sum + (line.unitPrice + line.proteinPrice) * line.qty, 0);
  const mealCount = currentMealCount();

  const rush = isRush(date, time) && mealCount > 0;
  let rushFee = 0;
  let perMeal = 0;
  if (rush) {
    perMeal = rushRatePerMeal(mealCount);
    rushFee = perMeal * mealCount;
  }

  const total = subtotal + rushFee;

  document.getElementById("sum-subtotal").textContent = naira(subtotal);
  document.getElementById("sum-total").textContent = naira(total);
  document.getElementById("sum-meal-count").textContent = mealCount;

  const banner = document.getElementById("rush-banner");
  const rushLine = document.getElementById("sum-rush-line");
  if (rush) {
    banner.classList.add("show");
    banner.textContent = `⚡ Within ${RUSH_WINDOW_HOURS} hours — rush fee at ${mealCount} meal${mealCount > 1 ? "s" : ""}: ${naira(perMeal)} per meal (${naira(rushFee)} total).`;
    rushLine.style.display = "flex";
    document.getElementById("sum-rush").textContent = `${naira(perMeal)}/meal × ${mealCount} = ${naira(rushFee)}`;
  } else {
    banner.classList.remove("show");
    rushLine.style.display = "none";
  }
}

const PEPPER_LABELS = { 1: "Low", 2: "Medium", 3: "Really Peppery" };

function updatePepperUI() {
  const slider = document.getElementById("pepper");
  const icons = document.getElementById("pepper-icons");
  const box = document.getElementById("pepper-slider");
  const hint = document.getElementById("pepper-hint");
  const level = slider.value;
  const touched = slider.dataset.touched === "true";

  icons.className = "pepper-icons level-" + level;

  if (touched) {
    box.classList.remove("untouched");
    hint.textContent = `Pepper level set: ${PEPPER_LABELS[level]}.`;
    hint.className = "hint ok";
  } else {
    box.classList.add("untouched");
    hint.textContent = "Slide to set your pepper level — required before checkout.";
    hint.className = "hint";
  }
}

function handleBookingSubmit(e) {
  e.preventDefault();
  if (cart.length === 0) {
    alert("Add at least one meal to the order before checking out.");
    return;
  }
  const pepperSlider = document.getElementById("pepper");
  if (pepperSlider.dataset.touched !== "true") {
    const hint = document.getElementById("pepper-hint");
    hint.textContent = "Please choose your pepper level before checking out.";
    hint.className = "hint warn";
    document.getElementById("pepper-slider").classList.add("untouched");
    document.getElementById("pepper-slider").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  alert("This is a working prototype of the booking flow.\n\nOnce Paystack and Google Calendar are connected on the backend, this button will open the real payment window and the booking will land on your kitchen calendar automatically.");
}

document.addEventListener("DOMContentLoaded", () => {
  populateCategory();
  ["category"].forEach(id => document.getElementById(id).addEventListener("change", populateCategory));
  ["item"].forEach(id => document.getElementById(id).addEventListener("change", populateSize));
  document.getElementById("add-to-cart").addEventListener("click", addToCart);
  document.getElementById("pepper").addEventListener("input", () => {
    document.getElementById("pepper").dataset.touched = "true";
    updatePepperUI();
  });
  updatePepperUI();
  ["date", "time"].forEach(id =>
    document.getElementById(id).addEventListener("input", updateSummary)
  );
  document.getElementById("booking-form").addEventListener("submit", handleBookingSubmit);

  const d = new Date(Date.now() + 26 * 60 * 60 * 1000);
  document.getElementById("date").value = d.toISOString().slice(0, 10);
  document.getElementById("time").value = d.toTimeString().slice(0, 5);
  renderCart();
  updateSummary();
});
