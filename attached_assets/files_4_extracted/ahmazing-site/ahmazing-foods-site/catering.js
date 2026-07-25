// Catering request form: keeps a live summary ticket updated, toggles the
// venue address field based on delivery/pickup choice, and on submit builds
// a formatted WhatsApp message with every field so nothing gets lost.

function updateCateringSummary() {
  const type = document.getElementById("c-event-type").value;
  const guests = document.getElementById("c-guests").value;
  const date = document.getElementById("c-date").value;
  const service = document.getElementById("c-service").value;

  document.getElementById("c-sum-type").textContent = type || "Event type —";
  document.getElementById("c-sum-guests").textContent = guests ? `${guests} guests` : "— guests";
  document.getElementById("c-sum-date").textContent = date || "Date —";
  document.getElementById("c-sum-service").textContent = service || "—";
}

function toggleLocationField() {
  const service = document.getElementById("c-service").value;
  const field = document.getElementById("c-location-field");
  const label = field.querySelector("label");
  if (service === "Pickup from our kitchen") {
    label.textContent = "Anything else about pickup? (optional)";
  } else {
    label.textContent = "Event venue / delivery address";
  }
}

function handleCateringSubmit(e) {
  e.preventDefault();

  const val = id => document.getElementById(id).value.trim();
  const name = val("c-name");
  const phone = val("c-phone");
  const email = val("c-email");
  const type = val("c-event-type");
  const guests = val("c-guests");
  const date = val("c-date");
  const time = val("c-time");
  const service = val("c-service");
  const location = val("c-location");
  const menu = val("c-menu");
  const budget = val("c-budget");
  const notes = val("c-notes");

  if (!name || !phone || !guests || !date) {
    alert("Please fill in your name, phone, guest count, and event date so we can quote accurately.");
    return;
  }

  const lines = [
    "Hi, I'd like to request a catering quote:",
    `Name: ${name}`,
    `Phone: ${phone}`,
    email ? `Email: ${email}` : null,
    `Event type: ${type}`,
    `Guests: ${guests}`,
    `Date: ${date}${time ? " at " + time : ""}`,
    `Service: ${service}`,
    location ? `Venue/address: ${location}` : null,
    menu ? `Menu request: ${menu}` : null,
    `Budget: ${budget}`,
    notes ? `Notes: ${notes}` : null
  ].filter(Boolean);

  const message = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/2348105506052?text=${message}`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("catering-form-el");
  if (!form) return;

  ["c-event-type", "c-guests", "c-date", "c-service"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateCateringSummary);
  });
  document.getElementById("c-service").addEventListener("change", toggleLocationField);

  form.addEventListener("submit", handleCateringSubmit);

  updateCateringSummary();
  toggleLocationField();
});
