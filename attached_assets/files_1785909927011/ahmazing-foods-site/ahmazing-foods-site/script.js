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
      "onugbu":  { name: "Onugbu Soup (Bitterleaf)", sizes: { "2L": 32000, "3L": 36000, "5L": 43000 } },
      "oha":     { name: "Oha Soup",                  sizes: { "2L": 32000, "3L": 36000, "5L": 43000 } },
      "okro":    { name: "Okro Soup",                 sizes: { "2L": 32000, "3L": 36000, "5L": 43000 } },
      "edikang": { name: "Edikang Ikong (Vegetable Soup)", sizes: { "2L": 32000, "3L": 36000, "5L": 43000 } },
      "egusi":   { name: "Egusi Soup",                sizes: { "2L": 32000, "3L": 36000, "5L": 43000 } },
      "banga":   { name: "Banga Soup (Ofe Akwu)",     sizes: { "2L": 32000, "3L": 36000, "5L": 43000 } },
      "eforiro": { name: "Efo-Riro",                  sizes: { "2L": 32000, "3L": 36000, "5L": 43000 } },
      "seafood": { name: "Seafood Okro (Fish, Shrimp, Prawns & Calamari)", sizes: { "5L": 56000 } }
    }
  },
  stew: {
    label: "Stew",
    items: {
      "tomato":  { name: "Classic Tomato Stew",  sizes: { "3L": 37000, "5L": 45000 } },
      "ayamase": { name: "Ayamase (Ofada Stew)", sizes: { "3L": 40000, "5L": 49000 } },
      "beef":    { name: "Peppered Beef Stew",   sizes: { "3L": 37000, "5L": 45000 } },
      "chicken": { name: "Peppered Chicken Stew",sizes: { "3L": 37000, "5L": 45000 } },
      "turkey":  { name: "Peppered Turkey Stew", sizes: { "3L": 40000, "5L": 49000 } }
    }
  },
  breakfast: {
    label: "Breakfast",
    items: {
      "classic-nigerian": { name: "The Classic Nigerian — Akara (10pcs), Pap (1L), 2 Boiled Eggs, Fried Plantain", sizes: { "Standard": 22000 } },
      "hearty-plate":      { name: "The Hearty Plate — Yam & Plantain, Egg Stew (1L), Sausages, Side Salad, Choice of Juice", sizes: { "Standard": 22000 } },
      "sweet-start":       { name: "The Sweet Start — Oats (1L), Fresh Fruit Bowl, Boiled Egg, Choice of Juice", sizes: { "Standard": 25000 } },
      "protein-power":     { name: "The Protein Power — Moin-moin (2pcs), Akara (10pcs), Pap (1L), 2 Boiled Eggs, Fried Plantain", sizes: { "Standard": 25000 } }
    }
  },
  products: {
    label: "Products",
    items: {
      "chili-pepper": { name: "Chili Pepper", sizes: { "Standard": 2000 } },
      "cameroon-pepper": { name: "Cameroon Pepper", sizes: { "Standard": 2500 } },
      "soya-mix": { name: "Soya Mix", sizes: { "Standard": 2500 } },
      "cinnamon-powder": { name: "Cinnamon Powder", sizes: { "Standard": 2000 } },
      "chia-seeds": { name: "Chia Seeds", sizes: { "Standard": 3500 } },
      "melon-seed": { name: "Melon Seed", sizes: { "Standard": 3000 } },
      "roasted-peanuts": { name: "Roasted Peanuts", sizes: { "Standard": 1800 } },
      "plantain-chips-ripe": { name: "Plantain Chips — Ripe & Spicy", sizes: { "Standard": 2200 } },
      "plantain-chips-toasted": { name: "Plantain Chips — Toasted & Crunchy", sizes: { "Standard": 2200 } },
      "cashew-nuts": { name: "Cashew Nuts", sizes: { "Standard": 2800 } },
      "coated-peanuts": { name: "Coated Peanuts", sizes: { "Standard": 2000 } },
      "yogurt-mix": { name: "Yogurt Mix — Seed & Nut Blend", sizes: { "Standard": 2800 } },
      "chinchin": { name: "Chin Chin", sizes: { "Standard": 2800 } },
      "corn-sticks": { name: "Corn Sticks", sizes: { "Standard": 4000 } },
      "zobo": { name: "Zobo Drink", sizes: { "Standard": 2000 } },
      "yogurt-drink": { name: "Yogurt Drink", sizes: { "Standard": 2800 } },
      "ginger-immune": { name: "Ginger Immune Booster", sizes: { "Standard": 2000 } },
      "turmeric-immune": { name: "Turmeric Immune Booster", sizes: { "Standard": 2000 } },
      "pineapple-ginger": { name: "Pineapple Ginger Drink", sizes: { "Standard": 2500 } },
      "tigernut-milk": { name: "Tiger Nut Milk", sizes: { "Standard": 2500 } },
      "kale-cleanser": { name: "Kale Cleanser", sizes: { "Standard": 2200 } },
      "lemon-honey": { name: "Lemon Honey Cleanser", sizes: { "Standard": 3000 } },
      "orange-juice": { name: "Orange Juice", sizes: { "Standard": 3000 } },
      "carrot-juice": { name: "Carrot Juice", sizes: { "Standard": 3000 } }
    }
  }
};

const PROTEINS = {
  "none":    { name: "No extra protein", price: 0 },
  "beef":    { name: "Beef",             price: 4000 },
  "chicken": { name: "Chicken",          price: 4700 },
  "turkey":  { name: "Turkey",           price: 5700 },
  "croaker": { name: "Croaker",          price: 5700 },
  "tilapia": { name: "Tilapia",          price: 4700 },
  "catfish": { name: "Catfish",          price: 5700 },
  "snail":   { name: "Snail",            price: 6700 },
  "seafood": { name: "Mixed Seafood",    price: 11700 },
  "gizzard": { name: "Gizzard",          price: 5700 },
  "sausages":{ name: "Sausages",         price: 4700 }
};

// --- Rush premium rule -------------------------------------------------
// Within this many hours of the requested delivery time, a rush fee
// applies. The fee is charged PER MEAL, and the per-meal rate drops as
// more meals go into the same order. "Meals" = total quantity across
// every line in the cart. Beyond MAX_MEALS, the customer is directed to
// Catering / Trays & Platters instead of checking out here.
//
// RUSH / SAME-DAY DELIVERY — a discrete system, not a continuous "hours
// until delivery" window. Rush/same-day delivery is ONLY available if:
//   (a) the customer places the order between 6:00 AM and 9:00 AM that day
//   (b) they pick one of exactly two delivery windows: 4-6pm or 6-8pm
// This exists because the math doesn't work any other way: with an 8-hour
// minimum lead and a 9pm close, ordering after 9am can never reach same-day
// delivery no matter what time is picked — so rather than let someone
// attempt it and get silently bumped to tomorrow after paying a rush fee,
// same-day is only ever offered when it's mathematically guaranteed to work.
// Every other booking (any future date) uses the normal continuous
// 9am-9pm picker with no rush fee at all.
const BUSINESS_OPEN = "09:00";
const BUSINESS_CLOSE = "21:00";
const SAME_DAY_ORDER_START = "06:00";
const SAME_DAY_ORDER_END = "09:00";
const RUSH_WINDOWS = [
  { val: "4pm-6pm", label: "4:00 – 6:00 PM", time: "16:00" },
  { val: "6pm-8pm", label: "6:00 – 8:00 PM", time: "18:00" }
];
const RUSH_CAP_PERCENT = 0.5;
const MAX_MEALS = 5;
const RUSH_TIERS = [
  { upTo: 1, perMeal: 20000 },
  { upTo: 2, perMeal: 15000 },
  { upTo: 3, perMeal: 13000 },
  { upTo: 4, perMeal: 12000 },
  { upTo: 5, perMeal: 10000 }
];

let sameDayRushEligible = false;
let selectedRushWindow = null;

function rushRatePerMeal(mealCount) {
  const tier = RUSH_TIERS.find(t => mealCount <= t.upTo) || RUSH_TIERS[RUSH_TIERS.length - 1];
  return tier.perMeal;
}

// Rush fee = the flat tiered amount, or 50% of the order's subtotal,
// whichever is LOWER. Keeps the fee proportionate on small orders without
// changing anything for orders large enough that the cap never binds.
function computeRushFee(mealCount, subtotal) {
  const flat = rushRatePerMeal(mealCount) * mealCount;
  const cap = subtotal * RUSH_CAP_PERCENT;
  return Math.min(flat, cap);
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

  const proteinField = document.getElementById("protein-field");
  const proteinApplies = (catSelect.value === "soup" || catSelect.value === "stew");
  proteinField.style.display = proteinApplies ? "" : "none";
  if (!proteinApplies) document.getElementById("protein").value = "none";

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

function isWithinBusinessHours(timeStr) {
  if (!timeStr) return false;
  return timeStr >= BUSINESS_OPEN && timeStr <= BUSINESS_CLOSE;
}

// Validates FUTURE-day bookings (the normal continuous picker). Same-day
// rush validity is handled separately by sameDayRushEligible/selectedRushWindow.
function validateDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) {
    return { valid: false, message: "Please choose a delivery date and time." };
  }
  if (!isWithinBusinessHours(timeStr)) {
    return { valid: false, message: `We're open ${to12Hour(BUSINESS_OPEN)} – ${to12Hour(BUSINESS_CLOSE)} daily — please pick a time in that window.` };
  }
  return { valid: true, message: null };
}

// Decides, every time the date changes (or on page load): is same-day
// rush delivery even offered right now? If the selected date is today AND
// the current time is within the 6-9am order window, show the two rush
// delivery-window buttons instead of a free time picker. If it's today but
// OUTSIDE that order window, same-day is impossible — say so plainly and
// move the date to tomorrow rather than let the customer hit a dead end
// after paying a rush fee. Any future date just uses the normal picker.
function updateDateTimeConstraints() {
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const timeField = document.getElementById("time-field");
  const rushField = document.getElementById("rush-window-field");
  const noticeEl = document.getElementById("next-day-notice");
  const hintEl = document.getElementById("datetime-hint");
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nowTimeStr = now.toTimeString().slice(0, 5);

  dateInput.min = todayStr;
  noticeEl.style.display = "none";
  sameDayRushEligible = false;

  if (dateInput.value === todayStr) {
    const withinOrderWindow = nowTimeStr >= SAME_DAY_ORDER_START && nowTimeStr <= SAME_DAY_ORDER_END;

    if (withinOrderWindow) {
      sameDayRushEligible = true;
      timeField.style.display = "none";
      rushField.style.display = "block";
      hintEl.textContent = `Same-day delivery is open right now — choose one of the two windows below. A rush fee applies.`;
    } else {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().slice(0, 10);
      timeField.style.display = "";
      rushField.style.display = "none";
      selectedRushWindow = null;
      timeInput.min = BUSINESS_OPEN;
      timeInput.max = BUSINESS_CLOSE;
      timeInput.value = BUSINESS_OPEN;

      noticeEl.style.display = "block";
      noticeEl.textContent = `⏰ Same-day booking closes at ${to12Hour(SAME_DAY_ORDER_END)} — the next available slot is tomorrow. We've moved your delivery date to tomorrow.`;
      hintEl.textContent = `We're open ${to12Hour(BUSINESS_OPEN)} – ${to12Hour(BUSINESS_CLOSE)} daily for advance orders.`;
    }
  } else {
    timeField.style.display = "";
    rushField.style.display = "none";
    selectedRushWindow = null;
    timeInput.min = BUSINESS_OPEN;
    timeInput.max = BUSINESS_CLOSE;
    hintEl.textContent = `We're open ${to12Hour(BUSINESS_OPEN)} – ${to12Hour(BUSINESS_CLOSE)} daily. Same-day rush delivery is only available if you order between ${to12Hour(SAME_DAY_ORDER_START)} and ${to12Hour(SAME_DAY_ORDER_END)}.`;
  }
}

function to12Hour(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function isRush() {
  return sameDayRushEligible && selectedRushWindow !== null;
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

// --- Deep-link auto-add -----------------------------------------------
// Arriving from a "Book This" link elsewhere on the site (?cat=..&item=..&
// size=..) pre-selects and auto-adds that exact item to the cart, so the
// customer lands here with their choice already in — they can still add
// more, or remove it like any other cart line.
function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat");
  const itemKey = params.get("item");
  const sizeKey = params.get("size");
  if (!cat || !itemKey || !CATALOG[cat] || !CATALOG[cat].items[itemKey]) return;

  document.getElementById("category").value = cat;
  populateCategory();

  const itemSelect = document.getElementById("item");
  if ([...itemSelect.options].some(o => o.value === itemKey)) {
    itemSelect.value = itemKey;
  }
  populateSize();

  const sizeSelect = document.getElementById("size");
  if (sizeKey && [...sizeSelect.options].some(o => o.value === sizeKey)) {
    sizeSelect.value = sizeKey;
  }

  addToCart();

  const itemName = CATALOG[cat].items[itemKey].name;
  const banner = document.getElementById("deeplink-banner");
  banner.style.display = "flex";
  banner.textContent = `✓ We've added "${itemName}" to your order already — add more below, or remove it if you'd rather start over.`;
}

function updateSummary() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  const subtotal = cart.reduce((sum, line) => sum + (line.unitPrice + line.proteinPrice) * line.qty, 0);
  const mealCount = currentMealCount();

  const errorEl = document.getElementById("datetime-error");
  const hintEl = document.getElementById("datetime-hint");
  if (!sameDayRushEligible) {
    const dtCheck = validateDateTime(date, time);
    if (!dtCheck.valid && date && time) {
      errorEl.textContent = dtCheck.message;
      errorEl.style.display = "block";
      hintEl.style.display = "none";
    } else {
      errorEl.style.display = "none";
      hintEl.style.display = "block";
    }
  } else {
    errorEl.style.display = "none";
    hintEl.style.display = "block";
  }

  const rush = isRush() && mealCount > 0;
  let rushFee = 0;
  let flatRate = 0;
  let capApplied = false;
  if (rush) {
    flatRate = rushRatePerMeal(mealCount);
    rushFee = computeRushFee(mealCount, subtotal);
    capApplied = rushFee < flatRate * mealCount;
  }

  const total = subtotal + rushFee;

  document.getElementById("sum-subtotal").textContent = naira(subtotal);
  document.getElementById("sum-total").textContent = naira(total);
  document.getElementById("sum-meal-count").textContent = mealCount;

  const banner = document.getElementById("rush-banner");
  const rushLine = document.getElementById("sum-rush-line");
  if (rush) {
    const windowLabel = RUSH_WINDOWS.find(w => w.val === selectedRushWindow).label;
    banner.classList.add("show");
    if (capApplied) {
      banner.textContent = `⚡ Same-day, ${windowLabel} — rush fee capped at 50% of your subtotal: ${naira(rushFee)}.`;
      document.getElementById("sum-rush").textContent = `${naira(rushFee)} (capped at 50% of subtotal)`;
    } else {
      banner.textContent = `⚡ Same-day, ${windowLabel} — rush fee at ${mealCount} meal${mealCount > 1 ? "s" : ""}: ${naira(flatRate)} per meal (${naira(rushFee)} total).`;
      document.getElementById("sum-rush").textContent = `${naira(flatRate)}/meal × ${mealCount} = ${naira(rushFee)}`;
    }
    rushLine.style.display = "flex";
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

  document.querySelectorAll(".pepper-tick").forEach(tick => {
    tick.classList.toggle("passed", parseInt(tick.dataset.level, 10) <= parseInt(level, 10));
  });

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

// Builds a "one click add" Google Calendar link for the CUSTOMER's own
// calendar, pre-filled with the delivery window and order details. This
// runs entirely client-side — no backend needed for this half of the
// calendar picture. The BUSINESS side (auto-creating an event on the
// kitchen's own calendar) still needs the backend integration noted below.
function buildGoogleCalendarLink(dateStr, timeStr, itemsSummary, address, pepperText) {
  const start = new Date(`${dateStr}T${timeStr}`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const details = `AHmazing Foods delivery.\n\nOrder: ${itemsSummary}\nPepper level: ${pepperText}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "AHmazing Foods Delivery",
    dates: `${fmt(start)}/${fmt(end)}`,
    details: details,
    location: address || ""
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
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

  const val = id => (document.getElementById(id).value || "").trim();
  const name = val("name");
  const phone = val("phone");
  const email = val("email");
  const address = val("address");
  const date = val("date");
  const time = val("time");

  if (!name || !phone || !address) {
    alert("Please fill in your name, phone, and delivery address before checking out.");
    return;
  }

  if (sameDayRushEligible && !selectedRushWindow) {
    alert("Please choose a same-day delivery window (4-6pm or 6-8pm) before checking out.");
    document.getElementById("rush-window-field").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (!sameDayRushEligible) {
    const dtCheck = validateDateTime(date, time);
    if (!dtCheck.valid) {
      const errorEl = document.getElementById("datetime-error");
      const hintEl = document.getElementById("datetime-hint");
      errorEl.textContent = dtCheck.message;
      errorEl.style.display = "block";
      hintEl.style.display = "none";
      document.getElementById("date").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  }

  const subtotal = cart.reduce((sum, line) => sum + (line.unitPrice + line.proteinPrice) * line.qty, 0);
  const mealCount = currentMealCount();
  const rush = isRush() && mealCount > 0;
  const rushFee = rush ? computeRushFee(mealCount, subtotal) : 0;
  const total = subtotal + rushFee;
  const pepperText = PEPPER_LABELS[pepperSlider.value];

  // ---------------------------------------------------------------------
  // Build a full itemized order — every cart line, not just the first —
  // so both the customer and the business have a complete copy.
  // ---------------------------------------------------------------------
  const lines = [
    "Hi, I'd like to confirm this order:",
    "",
    "ITEMS:"
  ];
  cart.forEach((line, i) => {
    const lineTotal = (line.unitPrice + line.proteinPrice) * line.qty;
    lines.push(`${i + 1}. ${line.name} (${line.size}) x${line.qty} — ${naira(lineTotal)}`);
    if (line.proteinPrice > 0) {
      lines.push(`   + ${line.proteinName} (${naira(line.proteinPrice)}/unit)`);
    }
  });
  lines.push("");
  lines.push(`Pepper level: ${pepperText}`);
  const deliveryDesc = rush
    ? `${date}, ${RUSH_WINDOWS.find(w => w.val === selectedRushWindow).label} (same-day rush)`
    : `${date}${time ? " at " + time : ""}`;
  lines.push(`Delivery: ${deliveryDesc}`);
  lines.push("");
  lines.push(`Subtotal: ${naira(subtotal)}`);
  if (rush) {
    const flatCheck = rushRatePerMeal(mealCount) * mealCount;
    if (rushFee < flatCheck) {
      lines.push(`Rush fee: ${naira(rushFee)} (capped at 50% of subtotal)`);
    } else {
      lines.push(`Rush fee: ${naira(rushRatePerMeal(mealCount))}/meal x ${mealCount} = ${naira(rushFee)}`);
    }
  }
  lines.push(`TOTAL: ${naira(total)}`);
  lines.push("");
  lines.push(`Name: ${name}`);
  lines.push(`Phone: ${phone}`);
  if (email) lines.push(`Email: ${email}`);
  lines.push(`Address: ${address}`);
  lines.push("");
  lines.push("PAY BY TRANSFER:");
  lines.push("Account Name: Ahmazing Cuisine");
  lines.push("Bank: FCMB");
  lines.push("Account Number: 1009414545");

  const message = encodeURIComponent(lines.join("\n"));
  // -----------------------------------------------------------------------
  // LIVE INTEGRATION POINT 1 — Paystack
  // Replace this WhatsApp handoff with a real Paystack transaction using
  // `total` (in kobo) and the customer's email. On successful callback,
  // still send the same itemized message below (or an equivalent email/SMS)
  // so both sides have a copy, then move to step 2.
  //
  // LIVE INTEGRATION POINT 2 — Google Calendar (business side)
  // The link above already gives the CUSTOMER a one-click add to their own
  // calendar — but that still needs a click. To make it genuinely
  // automatic when they've given an email (no click needed), the backend
  // should, on payment success:
  //   1. Create the event on AHmazing Foods' own Google Calendar via a
  //      service account (this also solves the kitchen-calendar sync).
  //   2. If `email` is set, add it as a GUEST/ATTENDEE on that same event
  //      through the Calendar API.
  //   3. Google automatically emails that guest a calendar invite — one
  //      click to accept and it's on their calendar. No OAuth or account
  //      access needed from the customer, because Google handles the
  //      invite step itself. This is the standard, correct pattern for
  //      "their email automatically gets the meal time on their
  //      calendar" — it's backend-only, which is why it's not built here.
  // -----------------------------------------------------------------------
  window.open(`https://wa.me/2348105506052?text=${message}`, "_blank");

  const itemsSummary = cart.map(l => `${l.name} (${l.size}) x${l.qty}`).join(", ");
  const calendarUrl = buildGoogleCalendarLink(date, time, itemsSummary, address, pepperText);
  document.getElementById("calendar-link").href = calendarUrl;
  document.getElementById("calendar-panel").style.display = "block";
  document.getElementById("calendar-panel").scrollIntoView({ behavior: "smooth", block: "center" });
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
  document.getElementById("date").addEventListener("input", () => {
    updateDateTimeConstraints();
    updateSummary();
  });
  document.getElementById("time").addEventListener("input", updateSummary);
  document.querySelectorAll("#rush-window-picker button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#rush-window-picker button").forEach(b => b.classList.remove("seg-active"));
      btn.classList.add("seg-active");
      selectedRushWindow = btn.dataset.val;
      document.getElementById("time").value = RUSH_WINDOWS.find(w => w.val === selectedRushWindow).time;
      updateSummary();
    });
  });
  document.getElementById("booking-form").addEventListener("submit", handleBookingSubmit);

  // Default: tomorrow at noon — always within business hours and always
  // past the minimum lead time, regardless of what time "now" is.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("date").value = tomorrow.toISOString().slice(0, 10);
  document.getElementById("time").value = "12:00";

  updateDateTimeConstraints();
  renderCart();
  updateSummary();
  handleDeepLink();
});
