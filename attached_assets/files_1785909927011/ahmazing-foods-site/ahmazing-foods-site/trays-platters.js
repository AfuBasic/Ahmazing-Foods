// Trays & Platters — per-card wine/drink add-on pickers, plus a shared
// delivery date/time field with different lead-time rules per segment:
//   - Platters & Trays: minimum 24-48 hours' notice, no same-day option
//     at all — today can never be selected for these.
//   - Packages (Small Chops): minimum 24 hours' notice, OR same-day if
//     ordered between 6:00-9:00 AM, delivered in one of two fixed
//     windows (4-6pm or 6-8pm) with a rush fee — identical mechanism to
//     Book a Meal's same-day rush system, reused here.

const TP_BUSINESS_OPEN = "09:00";
const TP_BUSINESS_CLOSE = "21:00";
const TP_SAME_DAY_ORDER_START = "06:00";
const TP_SAME_DAY_ORDER_END = "09:00";
const TP_RUSH_WINDOWS = [
  { val: "4pm-6pm", label: "4:00 – 6:00 PM", time: "16:00" },
  { val: "6pm-8pm", label: "6:00 – 8:00 PM", time: "18:00" }
];
const TP_RUSH_FLAT_FEE = 20000;
const TP_RUSH_CAP_PERCENT = 0.5;

let tpSameDayRushEligible = false;
let tpSelectedRushWindow = null;

function tpTo12Hour(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function initDrinkPickers() {
  document.querySelectorAll(".drink-picker").forEach(picker => {
    const max = parseInt(picker.dataset.max, 10);
    const checks = picker.querySelectorAll('input[type="checkbox"]');
    const countEl = picker.querySelector(".addon-count");

    function update() {
      const checkedCount = [...checks].filter(c => c.checked).length;
      checks.forEach(c => {
        if (!c.checked) c.disabled = checkedCount >= max;
      });
      if (countEl) countEl.textContent = `${checkedCount} of ${max} selected`;
    }
    checks.forEach(c => c.addEventListener("change", update));
    update();
  });
}

// Pepper blend pickers: each blend can be checked, and once checked, a
// quantity stepper appears so the customer can match a big order (e.g. a
// 30-person Party Starter needs more than one cup of a blend). Pricing is
// now per UNIT, not per distinct blend type: the first unit selected
// (across all blends combined) is free, every additional unit — whether
// it's more of the same blend or a different one — costs ₦3,000.
function pepperBlendTotalUnits(picker) {
  let total = 0;
  picker.querySelectorAll(".blend-row").forEach(row => {
    const check = row.querySelector(".pepper-blend-check");
    if (check.checked) {
      const qtyEl = row.querySelector(".qty-value");
      total += parseInt(qtyEl.textContent, 10);
    }
  });
  return total;
}

function initPepperBlendPickers() {
  document.querySelectorAll(".pepper-blend-picker").forEach(picker => {
    const costEl = picker.querySelector(".pepper-blend-cost");

    function updateCost() {
      const totalUnits = pepperBlendTotalUnits(picker);
      if (!costEl) return;
      if (totalUnits === 0) {
        costEl.textContent = "0 units selected — free";
      } else if (totalUnits === 1) {
        costEl.textContent = "1 unit selected — free";
      } else {
        const extra = (totalUnits - 1) * 3000;
        costEl.textContent = `${totalUnits} units selected — 1st free, +₦${extra.toLocaleString("en-NG")} for the extra ${totalUnits - 1}`;
      }
    }

    picker.querySelectorAll(".blend-row").forEach(row => {
      const check = row.querySelector(".pepper-blend-check");
      const stepper = row.querySelector(".blend-qty-stepper");
      const qtyEl = row.querySelector(".qty-value");
      const minusBtn = row.querySelector(".qty-minus");
      const plusBtn = row.querySelector(".qty-plus");

      check.addEventListener("change", () => {
        if (check.checked) {
          stepper.style.display = "flex";
          qtyEl.textContent = "1";
        } else {
          stepper.style.display = "none";
          qtyEl.textContent = "1";
        }
        updateCost();
      });

      minusBtn.addEventListener("click", () => {
        const current = parseInt(qtyEl.textContent, 10);
        if (current > 1) {
          qtyEl.textContent = String(current - 1);
          updateCost();
        }
      });

      plusBtn.addEventListener("click", () => {
        const current = parseInt(qtyEl.textContent, 10);
        qtyEl.textContent = String(current + 1);
        updateCost();
      });
    });

    updateCost();
  });
}

// Updates the shared date/time UI: if "today" is picked and the current
// real time is within the 6-9am same-day order window, show the two rush
// delivery-window buttons instead of the free time picker. Otherwise show
// the normal picker. This is generic — segment-specific rules (whether
// today is even allowed) are enforced separately, at order-click time.
function updateTpDateTimeUI() {
  const dateInput = document.getElementById("tp-date");
  const timeField = document.getElementById("tp-time-field");
  const rushField = document.getElementById("tp-rush-window-field");
  const noticeEl = document.getElementById("tp-notice");
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const nowTimeStr = now.toTimeString().slice(0, 5);

  dateInput.min = todayStr;
  noticeEl.style.display = "none";
  tpSameDayRushEligible = false;

  if (dateInput.value === todayStr) {
    const withinOrderWindow = nowTimeStr >= TP_SAME_DAY_ORDER_START && nowTimeStr <= TP_SAME_DAY_ORDER_END;
    if (withinOrderWindow) {
      tpSameDayRushEligible = true;
      timeField.style.display = "none";
      rushField.style.display = "block";
    } else {
      timeField.style.display = "";
      rushField.style.display = "none";
      tpSelectedRushWindow = null;
      noticeEl.style.display = "block";
      noticeEl.textContent = `Note: same-day ordering (Packages only) closes at ${tpTo12Hour(TP_SAME_DAY_ORDER_END)}. Platters and Trays always need at least 24-48 hours regardless.`;
    }
  } else {
    timeField.style.display = "";
    rushField.style.display = "none";
    tpSelectedRushWindow = null;
  }
}

// Segment-specific validation, run when a specific card's Order button is
// clicked (the shared date field alone can't know this in advance, since
// it's shared across every item on the page).
function validateDeliveryForSegment(segment) {
  const dateInput = document.getElementById("tp-date");
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const isToday = dateInput.value === todayStr;

  if (!dateInput.value) {
    return { valid: false, message: "Please choose a delivery date." };
  }

  if (segment === "platters" || segment === "trays") {
    if (isToday) {
      return { valid: false, message: "Platters and Trays need at least 24-48 hours' notice — please choose tomorrow or a later date." };
    }
    return { valid: true, rush: false };
  }

  // segment === "packages"
  if (isToday) {
    if (!tpSameDayRushEligible) {
      return { valid: false, message: `Same-day ordering closes at ${tpTo12Hour(TP_SAME_DAY_ORDER_END)}. Please choose tomorrow, or come back tomorrow between ${tpTo12Hour(TP_SAME_DAY_ORDER_START)}-${tpTo12Hour(TP_SAME_DAY_ORDER_END)} for same-day.` };
    }
    if (!tpSelectedRushWindow) {
      return { valid: false, message: "Please choose a same-day delivery window (4-6pm or 6-8pm)." };
    }
    return { valid: true, rush: true };
  }
  return { valid: true, rush: false };
}

function handleOrderClick(e) {
  const btn = e.target;
  const card = btn.closest(".product-card");
  const name = card.dataset.name;
  const priceStr = card.dataset.price;
  const price = parseInt(priceStr.replace(/[^\d]/g, ""), 10);
  const segment = card.dataset.segment;

  const wineSelect = card.querySelector(".wine-choice");
  const wine = wineSelect ? wineSelect.value : null;

  const pepperBlendPicker = card.querySelector(".pepper-blend-picker");
  const pepperBlendItems = pepperBlendPicker
    ? [...pepperBlendPicker.querySelectorAll(".blend-row")]
        .map(row => {
          const check = row.querySelector(".pepper-blend-check");
          const qty = parseInt(row.querySelector(".qty-value").textContent, 10);
          return check.checked ? { name: check.value, qty } : null;
        })
        .filter(Boolean)
    : [];
  const totalBlendUnits = pepperBlendItems.reduce((sum, b) => sum + b.qty, 0);
  const PEPPER_BLEND_EXTRA_FEE = 3000;
  const pepperBlendExtraCharge = Math.max(0, totalBlendUnits - 1) * PEPPER_BLEND_EXTRA_FEE;

  const picker = card.querySelector(".drink-picker");
  const maxDrinks = picker ? parseInt(picker.dataset.max, 10) : 0;
  const drinks = picker ? [...picker.querySelectorAll('input[type="checkbox"]:checked')].map(c => c.value) : [];

  if (wineSelect && !wine) {
    alert("Please choose a wine option before ordering.");
    wineSelect.focus();
    return;
  }
  if (pepperBlendPicker && pepperBlendItems.length === 0) {
    alert("Please choose at least one pepper blend before ordering.");
    pepperBlendPicker.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (picker && drinks.length !== maxDrinks) {
    alert(`Please select exactly ${maxDrinks} free drink${maxDrinks > 1 ? "s" : ""} before ordering (${drinks.length} selected so far).`);
    return;
  }

  const deliveryCheck = validateDeliveryForSegment(segment);
  if (!deliveryCheck.valid) {
    alert(deliveryCheck.message);
    document.getElementById("tp-date").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const dateVal = document.getElementById("tp-date").value;
  let deliveryDesc;
  let rushFee = 0;
  if (deliveryCheck.rush) {
    const windowInfo = TP_RUSH_WINDOWS.find(w => w.val === tpSelectedRushWindow);
    deliveryDesc = `${dateVal}, ${windowInfo.label} (same-day rush)`;
    rushFee = Math.min(TP_RUSH_FLAT_FEE, price * TP_RUSH_CAP_PERCENT);
  } else {
    const timeVal = document.getElementById("tp-time").value;
    deliveryDesc = timeVal ? `${dateVal} at ${timeVal}` : dateVal;
  }

  const total = price + rushFee + pepperBlendExtraCharge;

  const lines = [`Hi, I'd like to order the ${name} (${priceStr}).`];
  if (wine) lines.push(`Wine: ${wine}`);
  if (pepperBlendItems.length) {
    const blendDesc = pepperBlendItems.map(b => b.qty > 1 ? `${b.name} x${b.qty}` : b.name).join(", ");
    lines.push(`Pepper blend${pepperBlendItems.length > 1 || totalBlendUnits > 1 ? "s" : ""}: ${blendDesc}`);
    if (pepperBlendExtraCharge > 0) {
      lines.push(`Extra blend fee: ${totalBlendUnits - 1} extra unit${totalBlendUnits - 1 > 1 ? "s" : ""} × ₦3,000 = ₦${pepperBlendExtraCharge.toLocaleString("en-NG")}`);
    }
  }
  if (drinks.length) lines.push(`Free drink${drinks.length > 1 ? "s" : ""}: ${drinks.join(", ")}`);
  const fixedDrinksEl = card.querySelector(".fixed-drinks-list");
  if (fixedDrinksEl) lines.push(`Includes: ${fixedDrinksEl.textContent.trim()}`);
  lines.push(`Delivery: ${deliveryDesc}`);
  if (rushFee > 0) {
    lines.push(`Rush fee: ₦${Math.round(rushFee).toLocaleString("en-NG")}`);
  }
  if (rushFee > 0 || pepperBlendExtraCharge > 0) {
    lines.push(`TOTAL: ₦${Math.round(total).toLocaleString("en-NG")}`);
  }
  lines.push("", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");

  window.open(`https://wa.me/2348105506052?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  initDrinkPickers();
  initPepperBlendPickers();
  document.querySelectorAll(".order-btn").forEach(btn => btn.addEventListener("click", handleOrderClick));

  document.getElementById("tp-date").addEventListener("input", updateTpDateTimeUI);
  document.querySelectorAll("#tp-rush-window-picker button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#tp-rush-window-picker button").forEach(b => b.classList.remove("seg-active"));
      btn.classList.add("seg-active");
      tpSelectedRushWindow = btn.dataset.val;
    });
  });

  // Default: tomorrow — safe default for Platters/Trays/Packages alike.
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("tp-date").value = tomorrow.toISOString().slice(0, 10);
  document.getElementById("tp-time").value = "12:00";
  updateTpDateTimeUI();
});
