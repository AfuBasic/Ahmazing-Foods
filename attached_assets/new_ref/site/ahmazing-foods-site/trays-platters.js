// Trays & Platters — per-card wine/drink add-on pickers.
// Platters: 1 wine choice (required) + exactly 2 drinks (required).
// Trays: no wine, exactly 4 drinks (required).
// Packages: no wine, exactly 2 drinks (required).
// Every "Order" click validates the required selections, then builds a
// WhatsApp message with the item, price, wine (if any), and drinks,
// followed by the bank transfer details.

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

function handleOrderClick(e) {
  const btn = e.target;
  const card = btn.closest(".product-card");
  const name = card.dataset.name;
  const price = card.dataset.price;

  const wineSelect = card.querySelector(".wine-choice");
  const wine = wineSelect ? wineSelect.value : null;

  const picker = card.querySelector(".drink-picker");
  const maxDrinks = picker ? parseInt(picker.dataset.max, 10) : 0;
  const drinks = picker ? [...picker.querySelectorAll('input[type="checkbox"]:checked')].map(c => c.value) : [];

  if (wineSelect && !wine) {
    alert("Please choose a wine option before ordering.");
    wineSelect.focus();
    return;
  }
  if (picker && drinks.length !== maxDrinks) {
    alert(`Please select exactly ${maxDrinks} free drink${maxDrinks > 1 ? "s" : ""} before ordering (${drinks.length} selected so far).`);
    return;
  }

  const lines = [`Hi, I'd like to order the ${name} (${price}).`];
  if (wine) lines.push(`Wine: ${wine}`);
  if (drinks.length) lines.push(`Free drink${drinks.length > 1 ? "s" : ""}: ${drinks.join(", ")}`);
  lines.push("", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");

  window.open(`https://wa.me/2348105506052?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  initDrinkPickers();
  document.querySelectorAll(".order-btn").forEach(btn => btn.addEventListener("click", handleOrderClick));
});
