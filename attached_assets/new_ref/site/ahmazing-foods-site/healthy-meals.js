// Healthy Meals — build-your-own plan calculator.
// Total = rate-per-meal (set by plan length) × meals-per-day × number of
// days (customer-chosen, bounded by each plan's minimum). Each meal
// already includes its own snack. A rush fee (same 12-24hr window, same
// 9am-9pm hours, same 50%-of-value cap logic as Book a Meal) applies only
// to the FIRST delivery drop, capped at min(3, days chosen).

const HM_BUSINESS_OPEN = "09:00";
const HM_BUSINESS_CLOSE = "21:00";
const HM_MIN_LEAD_HOURS = 12;
const HM_RUSH_WINDOW_HOURS = 24;
const HM_RUSH_CAP_PERCENT = 0.5;
const HM_FLAT_RUSH_FEE = 20000; // same baseline as a single Book-a-Meal item

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

function hmHoursUntil(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const requested = new Date(`${dateStr}T${timeStr}`);
  const now = new Date();
  return (requested - now) / (1000 * 60 * 60);
}

function hmValidateDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return { valid: false, message: "Please choose a first delivery date and time." };
  if (!hmIsWithinBusinessHours(timeStr)) {
    return { valid: false, message: `We're open ${hmTo12Hour(HM_BUSINESS_OPEN)} – ${hmTo12Hour(HM_BUSINESS_CLOSE)} daily — please pick a time in that window.` };
  }
  const hrs = hmHoursUntil(dateStr, timeStr);
  if (hrs === null || hrs < HM_MIN_LEAD_HOURS) {
    return { valid: false, message: `We need at least ${HM_MIN_LEAD_HOURS} hours' notice — that time is too soon.` };
  }
  return { valid: true, message: null };
}

function hmIsRush(dateStr, timeStr) {
  const check = hmValidateDateTime(dateStr, timeStr);
  if (!check.valid) return false;
  const hrs = hmHoursUntil(dateStr, timeStr);
  return hrs >= HM_MIN_LEAD_HOURS && hrs < HM_RUSH_WINDOW_HOURS;
}

function updateHmDateTimeConstraints() {
  const dateInput = document.getElementById("hm-date");
  const timeInput = document.getElementById("hm-time");
  const noticeEl = document.getElementById("hm-next-day-notice");
  const hintEl = document.getElementById("hm-datetime-hint");
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  hintEl.textContent = `We're open ${hmTo12Hour(HM_BUSINESS_OPEN)} – ${hmTo12Hour(HM_BUSINESS_CLOSE)} daily. First delivery needs at least ${HM_MIN_LEAD_HOURS} hours' notice — within ${HM_MIN_LEAD_HOURS}–${HM_RUSH_WINDOW_HOURS} hours adds a rush fee on that first drop only.`;

  dateInput.min = todayStr;
  timeInput.max = HM_BUSINESS_CLOSE;
  noticeEl.style.display = "none";

  if (dateInput.value === todayStr) {
    const earliest = new Date(now.getTime() + HM_MIN_LEAD_HOURS * 60 * 60 * 1000);
    const earliestDateStr = earliest.toISOString().slice(0, 10);
    const earliestStr = earliest.toTimeString().slice(0, 5);
    const rolledToNextDay = earliestDateStr !== todayStr;
    const pastCloseToday = !rolledToNextDay && earliestStr > HM_BUSINESS_CLOSE;

    if (rolledToNextDay || pastCloseToday) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().slice(0, 10);
      timeInput.min = HM_BUSINESS_OPEN;
      timeInput.value = HM_BUSINESS_OPEN;
      noticeEl.style.display = "block";
      noticeEl.textContent = `⏰ Too late in the day for ${HM_MIN_LEAD_HOURS}-hour notice before we close at ${hmTo12Hour(HM_BUSINESS_CLOSE)} — your first delivery has been moved to tomorrow from ${hmTo12Hour(HM_BUSINESS_OPEN)}.`;
    } else {
      timeInput.min = earliestStr > HM_BUSINESS_OPEN ? earliestStr : HM_BUSINESS_OPEN;
    }
  } else {
    timeInput.min = HM_BUSINESS_OPEN;
  }
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

function updatePlanCalculator() {
  const mealsBtn = document.querySelector("#meals-per-day .seg-active");
  const planBtn = document.querySelector("#plan-length .seg-active");
  const meals = parseInt(mealsBtn.dataset.val, 10);
  const rate = parseInt(planBtn.dataset.rate, 10);
  const planKey = planBtn.dataset.val;
  const days = parseInt(document.getElementById("days-count").value, 10);

  const planTotal = rate * meals * days;

  // Rush fee applies only to the first drop (up to 3 days' worth of meals),
  // using the same capped-at-50%-of-value logic as Book a Meal.
  const hmDate = document.getElementById("hm-date").value;
  const hmTime = document.getElementById("hm-time").value;
  const rush = hmIsRush(hmDate, hmTime);
  const firstDropDays = Math.min(3, days);
  const firstDropValue = rate * meals * firstDropDays;
  const rushFee = rush ? Math.min(HM_FLAT_RUSH_FEE, HM_RUSH_CAP_PERCENT * firstDropValue) : 0;

  const total = planTotal + rushFee;

  document.getElementById("plan-label").textContent = PLAN_LABELS[planKey];
  document.getElementById("plan-rate").textContent = naira(rate);
  document.getElementById("plan-count").textContent = `${meals} meal${meals > 1 ? "s" : ""}/day × ${days} day${days > 1 ? "s" : ""}`;
  document.getElementById("plan-total").textContent = naira(total);

  const rushLine = document.getElementById("hm-rush-line");
  const rushBanner = document.getElementById("hm-rush-banner");
  if (rush) {
    rushLine.style.display = "flex";
    document.getElementById("hm-rush-amount").textContent = naira(Math.round(rushFee));
    rushBanner.classList.add("show");
    rushBanner.textContent = `⚡ First delivery within ${HM_MIN_LEAD_HOURS}-${HM_RUSH_WINDOW_HOURS} hours — a rush fee applies to that first drop only.`;
  } else {
    rushLine.style.display = "none";
    rushBanner.classList.remove("show");
  }

  const btn = document.getElementById("plan-subscribe-btn");
  const lines = [
    `Hi, I'd like to order the ${PLAN_LABELS[planKey]} Healthy Meals plan:`,
    `${meals} meal(s)/day, ${days} day(s) — ${naira(rate)} per meal`,
    `Plan subtotal: ${naira(planTotal)}`,
    `First delivery: ${hmDate}${hmTime ? " at " + hmTime : ""}`
  ];
  if (rush) lines.push(`Rush fee (first drop only): ${naira(Math.round(rushFee))}`);
  lines.push(`TOTAL: ${naira(Math.round(total))}`, "", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
  btn.href = `https://wa.me/2348105506052?text=${encodeURIComponent(lines.join("\n"))}`;
}

document.addEventListener("DOMContentLoaded", () => {
  const mealsGroup = document.getElementById("meals-per-day");
  const planGroup = document.getElementById("plan-length");
  if (!mealsGroup || !planGroup) return;

  mealsGroup.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      mealsGroup.querySelectorAll("button").forEach(b => b.classList.remove("seg-active"));
      btn.classList.add("seg-active");
      updatePlanCalculator();
    });
  });

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
