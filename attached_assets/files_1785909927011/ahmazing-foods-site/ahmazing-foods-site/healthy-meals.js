// Healthy Meals — build-your-own plan calculator.
// Total = rate-per-meal (set by plan length) × meals-per-day × number of
// days (customer-chosen, bounded by each plan's minimum). Each meal
// already includes its own snack.
//
// DELIVERY TIMING — deliberately simple, and deliberately different from
// Book a Meal / Trays & Platters: Healthy Meals NEVER offers same-day
// delivery, for any reason, no rush fee available to override it. Every
// plan's first delivery needs a minimum of 24 hours' notice, full stop.
// This exists on purpose, to give the kitchen real breathing room for an
// ongoing subscription rather than a one-off urgent order — there is no
// legitimate "I need my meal plan to start in the next few hours" case
// the way there is for a single same-day soup order. Because delivery is
// always at least a full day out, every plan's Day 1 already has a
// complete day ahead of it before the first drop arrives — there is no
// partial first day, no meal slot to skip, no makeup-meal logic needed
// anywhere in this file.

const HM_BUSINESS_OPEN = "09:00";
const HM_BUSINESS_CLOSE = "21:00";
const HM_MIN_LEAD_HOURS = 24;

const naira = n => "₦" + n.toLocaleString("en-NG");

const PLAN_LABELS = {
  single: "Single Day",
  weekly: "Weekly",
  twoweek: "Two-Week",
  monthly: "Monthly"
};

function hmTo12Hour(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function hmIsWithinBusinessHours(timeStr) {
  return timeStr >= HM_BUSINESS_OPEN && timeStr <= HM_BUSINESS_CLOSE;
}

function hmValidateDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return { valid: false, message: "Please choose a first delivery date and time." };
  if (!hmIsWithinBusinessHours(timeStr)) {
    return { valid: false, message: `We're open ${hmTo12Hour(HM_BUSINESS_OPEN)} – ${hmTo12Hour(HM_BUSINESS_CLOSE)} daily — please pick a time in that window.` };
  }
  return { valid: true, message: null };
}

// The date picker's minimum is always tomorrow — today is never even
// selectable, regardless of what time it currently is. No same-day path
// exists to detect or block; there's nothing conditional here.
function updateHmDateTimeConstraints() {
  const dateInput = document.getElementById("hm-date");
  const timeInput = document.getElementById("hm-time");
  const hintEl = document.getElementById("hm-datetime-hint");
  const now = new Date();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  dateInput.min = tomorrowStr;
  if (!dateInput.value || dateInput.value < tomorrowStr) {
    dateInput.value = tomorrowStr;
  }
  timeInput.min = HM_BUSINESS_OPEN;
  timeInput.max = HM_BUSINESS_CLOSE;

  hintEl.textContent = `We're open ${hmTo12Hour(HM_BUSINESS_OPEN)} – ${hmTo12Hour(HM_BUSINESS_CLOSE)} daily. Every plan needs at least ${HM_MIN_LEAD_HOURS} hours' notice before the first delivery — this gives our kitchen real time to prepare, so same-day start isn't available, even with a rush fee.`;
}

function updateDaysBounds() {
  const planBtn = document.querySelector("#plan-length .seg-active");
  const minDays = parseInt(planBtn.dataset.mindays, 10);
  const maxDays = parseInt(planBtn.dataset.days, 10);
  const daysInput = document.getElementById("days-count");
  const rangeHint = document.getElementById("days-range-hint");

  daysInput.min = minDays;
  daysInput.max = maxDays;
  if (parseInt(daysInput.value, 10) < minDays || parseInt(daysInput.value, 10) > maxDays || !daysInput.value) {
    daysInput.value = maxDays;
  }
  rangeHint.textContent = minDays === maxDays ? `(fixed at ${maxDays})` : `(${minDays}–${maxDays} days)`;
  daysInput.disabled = (minDays === maxDays);

  document.getElementById("days-field").style.display = "block";
}

// The 9-dish pool for the meal picker — any dish can go in any slot,
// deliberately not restricted to its original Breakfast/Lunch/Dinner
// grouping, since all 9 are built to the same lower-sugar/lower-sodium/
// higher-fibre standard. See updatePlanCalculator() for how the picked
// dishes flow into the order message.
const HM_MEAL_POOL = [
  "Boiled Unripe Plantain & Egg Sauce",
  "Unsweetened Oat Pap with Roasted Groundnuts",
  "Whole Wheat Bread, Baked Akara & Cucumber",
  "Unripe Plantain Porridge with Grilled Fish",
  "Brown Rice Jollof with Grilled Chicken & Vegetables",
  "Beans & Vegetable Sauce",
  "Vegetable Soup with Small Swallow",
  "Grilled Fish with Ofada Rice & Vegetables",
  "Okra Soup with Lean Protein"
];
const HM_SLOT_NAMES = ["Meal 1", "Meal 2", "Meal 3"];

function renderMealSlotPickers(mealsPerDay) {
  const container = document.getElementById("meal-slot-pickers");
  const existing = {};
  container.querySelectorAll("select[data-slot]").forEach(sel => {
    existing[sel.dataset.slot] = sel.value;
  });
  let html = "";
  for (let i = 0; i < mealsPerDay; i++) {
    const prevVal = existing[i] || "";
    const options = HM_MEAL_POOL.map(d => `<option value="${d}"${d === prevVal ? " selected" : ""}>${d}</option>`).join("");
    html += `
      <div class="meal-slot">
        <label for="meal-slot-${i}">${HM_SLOT_NAMES[i]}</label>
        <select id="meal-slot-${i}" data-slot="${i}">
          <option value="">Choose a dish</option>
          ${options}
        </select>
      </div>`;
  }
  container.innerHTML = html;
  container.querySelectorAll("select").forEach(sel => sel.addEventListener("change", updatePlanCalculator));
}

function getSelectedMeals() {
  return [...document.querySelectorAll("#meal-slot-pickers select")].map(sel => sel.value);
}

function updatePlanCalculator() {
  const mealsBtn = document.querySelector("#meals-per-day .seg-active");
  const planBtn = document.querySelector("#plan-length .seg-active");
  const meals = parseInt(mealsBtn.dataset.val, 10);
  const rate = parseInt(planBtn.dataset.rate, 10);
  const planKey = planBtn.dataset.val;
  const days = parseInt(document.getElementById("days-count").value, 10);

  const planTotal = rate * meals * days;
  const total = planTotal;

  const hmDate = document.getElementById("hm-date").value;
  const hmTime = document.getElementById("hm-time").value;

  const selectedMeals = getSelectedMeals();
  const allMealsChosen = selectedMeals.length === meals && selectedMeals.every(m => m !== "");

  document.getElementById("plan-label").textContent = PLAN_LABELS[planKey];
  document.getElementById("plan-rate").textContent = naira(rate);
  document.getElementById("plan-count").textContent = `${meals} meal${meals > 1 ? "s" : ""}/day × ${days} day${days > 1 ? "s" : ""}`;
  document.getElementById("plan-total").textContent = naira(total);

  const btn = document.getElementById("plan-subscribe-btn");
  const lines = [
    `Hi, I'd like to order the ${PLAN_LABELS[planKey]} Healthy Meals plan:`,
    `${meals} meal(s)/day, ${days} day(s) — ${naira(rate)} per meal`,
  ];
  if (allMealsChosen) {
    selectedMeals.forEach((dish, i) => lines.push(`${HM_SLOT_NAMES[i]}: ${dish}`));
  }
  lines.push(
    `Plan subtotal: ${naira(planTotal)}`,
    `First delivery: ${hmDate}${hmTime ? " at " + hmTime : ""} (minimum 24 hours' notice, no same-day)`
  );
  lines.push(`TOTAL: ${naira(Math.round(total))}`, "", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
  btn.href = allMealsChosen ? `https://wa.me/2348105506052?text=${encodeURIComponent(lines.join("\n"))}` : "#";
  btn.dataset.mealsIncomplete = allMealsChosen ? "false" : "true";
}

document.addEventListener("DOMContentLoaded", () => {
  const mealsGroup = document.getElementById("meals-per-day");
  const planGroup = document.getElementById("plan-length");
  if (!mealsGroup || !planGroup) return;

  mealsGroup.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      mealsGroup.querySelectorAll("button").forEach(b => b.classList.remove("seg-active"));
      btn.classList.add("seg-active");
      renderMealSlotPickers(parseInt(btn.dataset.val, 10));
      updatePlanCalculator();
    });
  });

  const subscribeBtn = document.getElementById("plan-subscribe-btn");
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", (e) => {
      if (subscribeBtn.dataset.mealsIncomplete === "true") {
        e.preventDefault();
        alert("Please choose a dish for every meal slot before subscribing.");
        document.getElementById("meal-picker-field").scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  renderMealSlotPickers(1);

  planGroup.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      planGroup.querySelectorAll("button").forEach(b => b.classList.remove("seg-active"));
      btn.classList.add("seg-active");
      updateDaysBounds();
      updatePlanCalculator();
    });
  });

  document.getElementById("days-count").addEventListener("input", () => {
    const planBtn = document.querySelector("#plan-length .seg-active");
    const min = parseInt(planBtn.dataset.mindays, 10);
    const max = parseInt(planBtn.dataset.days, 10);
    let val = parseInt(document.getElementById("days-count").value, 10) || min;
    val = Math.max(min, Math.min(max, val));
    document.getElementById("days-count").value = val;
    updatePlanCalculator();
  });

  document.getElementById("hm-date").addEventListener("input", () => {
    updateHmDateTimeConstraints();
    updatePlanCalculator();
  });
  document.getElementById("hm-time").addEventListener("input", updatePlanCalculator);

  // Default first-delivery date/time: tomorrow at noon (mirrors Book a Meal's default)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("hm-date").value = tomorrow.toISOString().slice(0, 10);
  document.getElementById("hm-time").value = "12:00";

  updateDaysBounds();
  updateHmDateTimeConstraints();
  updatePlanCalculator();
});
