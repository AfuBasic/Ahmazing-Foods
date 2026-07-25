import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const OUT = path.resolve("../attached_assets/AHmazing-Foods-Product-Spec.pdf");

const RED    = "#C81212";
const GREEN  = "#0F9E0F";
const DARK   = "#221F1F";
const GREY   = "#666666";
const LGREY  = "#F5F5F5";
const WHITE  = "#FFFFFF";

const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
doc.pipe(fs.createWriteStream(OUT));

const W = doc.page.width - 100; // usable width

// ─── helpers ────────────────────────────────────────────────────────────────
function pageBreakIfNeeded(needed = 80) {
  if (doc.y + needed > doc.page.height - 80) doc.addPage();
}

function sectionTitle(text) {
  pageBreakIfNeeded(60);
  doc.moveDown(1)
     .rect(50, doc.y, W, 28).fill(RED)
     .fillColor(WHITE).fontSize(13).font("Helvetica-Bold")
     .text(text, 58, doc.y - 22, { width: W - 16 })
     .fillColor(DARK).moveDown(0.8);
}

function subTitle(text) {
  pageBreakIfNeeded(40);
  doc.moveDown(0.6)
     .fillColor(GREEN).fontSize(11).font("Helvetica-Bold")
     .text(text)
     .fillColor(DARK).moveDown(0.3);
}

function body(text, opts = {}) {
  doc.fontSize(9).font("Helvetica").fillColor(GREY)
     .text(text, { width: W, ...opts })
     .fillColor(DARK);
}

function tableRow(cols, widths, isHeader = false, shaded = false) {
  const x0 = 50;
  const rowH = 18;
  if (shaded) doc.rect(x0, doc.y, W, rowH).fill(LGREY).fillColor(DARK);
  const y = doc.y + 4;
  let x = x0 + 4;
  cols.forEach((col, i) => {
    doc.fontSize(isHeader ? 8 : 8)
       .font(isHeader ? "Helvetica-Bold" : "Helvetica")
       .fillColor(isHeader ? RED : DARK)
       .text(String(col), x, y, { width: widths[i] - 8, ellipsis: true });
    x += widths[i];
  });
  doc.moveDown(0).y += rowH;
}

function tableHeader(cols, widths) { tableRow(cols, widths, true, true); }

function note(text) {
  doc.moveDown(0.4)
     .fontSize(8).font("Helvetica-Oblique").fillColor(GREY)
     .text("ℹ  " + text, { width: W })
     .fillColor(DARK).font("Helvetica").moveDown(0.4);
}

// ─── COVER ──────────────────────────────────────────────────────────────────
doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FCF1EF");
doc.rect(0, 0, doc.page.width, 12).fill(RED);
doc.rect(0, doc.page.height - 12, doc.page.width, 12).fill(GREEN);

doc.fillColor(RED).fontSize(42).font("Helvetica-Bold")
   .text("AHmazing Foods", 50, 120);
doc.fillColor(GREEN).fontSize(18).font("Helvetica-Bold")
   .text("Product & Platform Specification", 50, 172);

doc.fillColor(GREY).fontSize(11).font("Helvetica")
   .text("Complete reference for all products, pricing, categories,\nbooking rules, and site configuration.", 50, 210);

doc.fillColor(DARK).fontSize(9).font("Helvetica")
   .text("Lagos, Nigeria  ·  ahmazingcuisine@gmail.com  ·  +234 (810)-550-6052", 50, 250);

doc.moveDown(4)
   .fillColor(GREY).fontSize(8)
   .text(`Generated: ${new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}  ·  For internal use`, 50);

doc.addPage().rect(0, 0, doc.page.width, doc.page.height).fill(WHITE);

// ─── 1. BRAND ───────────────────────────────────────────────────────────────
sectionTitle("1. Brand & Identity");
subTitle("Colour palette");
const cols2 = [W / 2, W / 2];
tableHeader(["Colour", "Hex value"], cols2);
[["Primary / Accent Red", "#C81212"], ["CTA Green", "#0F9E0F"], ["Charcoal (body text)", "#221F1F"], ["Cream background", "#FCF1EF"], ["Gold (small accents)", "#D9A441"]]
  .forEach(([n, h], i) => tableRow([n, h], cols2, false, i % 2 === 1));

subTitle("Typography");
tableHeader(["Role", "Typeface"], cols2);
[["Headings (display)", "Lora (warm serif)"], ["Body text", "Poppins (clean sans)"], ["Prices / data labels", "Monospace"]]
  .forEach(([r, f], i) => tableRow([r, f], cols2, false, i % 2 === 1));

subTitle("Contact & location bar (every page)");
body("+234 (810)-550-6052  ·  ahmazingcuisine@gmail.com  ·  Lagos State");

// ─── 2. SOUPS ───────────────────────────────────────────────────────────────
sectionTitle("2. Soups");
body("All soups come garnished with dried fish, stockfish and cowhide. Add extra protein at booking.\n2L includes 10pcs protein · 3L → 15pcs · 5L → 20pcs · Cooler-Small (feeds 20–25) → 25pcs · Cooler-Medium (feeds 30–35) → 35pcs");
doc.moveDown(0.4);

const soupCols = [140, 60, 60, 60, 75, 85];
tableHeader(["Soup", "2L", "3L", "5L", "Cooler-S", "Cooler-M"], soupCols);
[
  ["Onugbu (Bitterleaf)",       "₦15,000","₦18,000","₦23,000","₦50,000","₦65,000"],
  ["Oha Soup",                  "₦15,000","₦18,000","₦23,000","₦50,000","₦65,000"],
  ["Okro Soup",                 "₦15,000","₦18,000","₦23,000","₦50,000","₦65,000"],
  ["Edikang Ikong (Veg.)",      "₦15,000","₦18,000","₦23,000","₦50,000","₦65,000"],
  ["Egusi Soup",                "₦15,000","₦18,000","₦23,000","₦50,000","₦65,000"],
  ["Banga Soup (Delta Style)",  "₦15,000","₦18,000","₦23,000","₦50,000","₦65,000"],
  ["Efo-Riro",                  "₦15,000","₦18,000","₦23,000","₦50,000","₦65,000"],
  ["Seafood Okro",              "—",      "—",      "₦35,000","₦85,000","₦120,000"],
].forEach((r, i) => tableRow(r, soupCols, false, i % 2 === 1));

subTitle("Extra protein add-ons (soups)");
const pCols = [W / 2, W / 2];
tableHeader(["Protein", "Extra cost"], pCols);
[["Beef","₦3,000"],["Chicken","₦3,000"],["Turkey","₦4,000"],["Croaker","₦4,000"],["Tilapia","₦3,000"],
 ["Catfish","₦4,000"],["Snail","₦15,000"],["Mixed Seafood","₦10,000"],["Gizzard","₦4,000"],["Sausages","₦3,000"]]
  .forEach(([n, p], i) => tableRow([n, p], pCols, false, i % 2 === 1));

// ─── 3. STEWS ───────────────────────────────────────────────────────────────
sectionTitle("3. Stews");
body("Medium serves 4–6 people. Large serves 8–10. Small size discontinued.");
doc.moveDown(0.4);
const stewCols = [220, W / 2 - 110, W / 2 - 110];
tableHeader(["Stew", "Medium", "Large"], stewCols);
[
  ["Classic Tomato Stew",             "₦14,000","₦24,000"],
  ["Ayamase (Ofada Stew)",            "₦17,000","₦28,000"],
  ["Peppered Beef Stew",              "₦15,000","₦25,000"],
  ["Peppered Chicken Stew",           "₦15,000","₦25,000"],
  ["Peppered Turkey Stew",            "₦18,000","₦26,500"],
  ["Ata Din-Din (Fried Pepper Stew)", "₦14,500","₦24,500"],
].forEach((r, i) => tableRow(r, stewCols, false, i % 2 === 1));

// ─── 4. BREAKFAST ───────────────────────────────────────────────────────────
sectionTitle("4. Breakfast Combos");
body("Sold as generous combo plates only — no small a-la-carte items. Min price ₦22,000. Each combo = one distinct meal for rush-fee calculations.");
doc.moveDown(0.4);
const bfCols = [160, 60, W - 220];
tableHeader(["Combo", "Price", "Contents"], bfCols);
[
  ["The Classic Nigerian", "₦22,000", "Akara (10pcs), pap (1L), 2 boiled eggs"],
  ["The Hearty Plate",     "₦22,000", "Yam (5 slices), plantain (5 slices), egg stew (1L), sausages, choice of Orange or Carrot Juice"],
  ["The Sweet Start",      "₦25,000", "Oats (1L), fresh fruit bowl, choice of Orange or Carrot Juice"],
  ["The Protein Power",    "₦25,000", "Moin-moin (2pcs), akara (10pcs), pap (1L), 2 boiled eggs"],
].forEach((r, i) => tableRow(r, bfCols, false, i % 2 === 1));

// ─── 5. PRODUCTS ────────────────────────────────────────────────────────────
sectionTitle("5. Products (WhatsApp-ordered)");
note("All items on this page are ordered directly via WhatsApp — not through the booking system.");

subTitle("5a. Pantry & Sauces");
const prodCols = [180, 110, 80];
tableHeader(["Product", "Size / Format", "Price"], prodCols);
[
  ["Smoky Jollof Base",          "Glass jar · 250g",         "₦4,500"],
  ["Hibiscus Ginger Concentrate","Glass bottle · 250ml",     "₦3,000"],
  ["Premium Pepper Mix",         "Stand-up pouch · 150g",    "₦3,500"],
  ["Suya Marinade",              "Spout pouch · 200g",       "₦3,000"],
  ["Coconut Curry Base",         "Resealable pouch · 200g",  "₦4,000"],
].forEach((r, i) => tableRow(r, prodCols, false, i % 2 === 1));

subTitle("5b. Snacks");
tableHeader(["Product", "Size / Format", "Price"], prodCols);
[
  ["Roasted Peanuts",               "Lightly salted · 200g",     "₦1,800"],
  ["Plantain Chips",                "Toasted & crunchy · 150g",  "₦2,200"],
  ["Coated Peanuts",                "Spicy BBQ · 200g",          "₦2,000"],
  ["Yogurt Mix — Seed & Nut Blend", "200g",                      "₦2,800"],
  ["Chin Chin",                     "200g",                      "₦2,800"],
  ["Corn Sticks",                   "200g",                      "₦4,000"],
  ["Kwili Kwili",                   "Spicy & crunchy · 200g",    "₦2,000"],
  ["Cashew Nuts",                   "Roasted · 200g",            "₦2,800"],
].forEach((r, i) => tableRow(r, prodCols, false, i % 2 === 1));

subTitle("5c. Drinks & Wellness (all 500ml)");
tableHeader(["Product", "Description", "Price"], prodCols);
[
  ["Zobo Drink",              "Hibiscus infusion",        "₦2,000"],
  ["Yogurt Drink",            "Probiotic",                "₦2,800"],
  ["Ginger Immune Booster",   "Ginger · Lemon · Honey",   "₦2,000"],
  ["Turmeric Immune Booster", "Turmeric · Ginger",        "₦2,000"],
  ["Pineapple Ginger Drink",  "Freshly pressed",          "₦2,500"],
  ["Tiger Nut Milk",          "Plant-based, dairy-free",  "₦2,500"],
  ["Kale Cleanser",           "Kale · Cucumber · Apple",  "₦2,200"],
  ["Lemon Honey Cleanser",    "Lemon · Honey · Cayenne",  "₦3,000"],
  ["Orange Juice",            "100% natural",             "₦3,000"],
  ["Carrot Juice",            "100% carrot juice",        "₦3,000"],
].forEach((r, i) => tableRow(r, prodCols, false, i % 2 === 1));

subTitle("5d. Seeds & Spices");
tableHeader(["Product", "Size / Format", "Price"], prodCols);
[
  ["Cameroon Pepper",     "50g pack",  "₦1,500"],
  ["Chili Pepper",        "50g pack",  "₦1,000"],
  ["Suya Mix",            "50g pack",  "₦1,500"],
  ["Cinnamon Powder",     "30g pack",  "₦1,200"],
  ["Chia Seeds",          "100g pack", "₦2,500"],
  ["Melon Seeds (Egusi)", "100g pack", "₦2,000"],
].forEach((r, i) => tableRow(r, prodCols, false, i % 2 === 1));

// ─── 6. PLATTERS & TRAYS ────────────────────────────────────────────────────
sectionTitle("6. Platters & Trays");
note("This page is currently hidden from navigation — no nav link, footer link, or homepage card — until real photography is ready.");

subTitle("6a. Platters (bookable via Book a Slot)");
const trayCols = [160, 80, W - 240];
tableHeader(["Item", "Price", "Notes"], trayCols);
[
  ["Breakfast Platter",      "₦154,000", "Serves 8–10: akara, moin-moin, pap, egg stew, yam, plantain, juice"],
  ["Party Starter Platter",  "₦247,500", "Serves 15–20: puff-puff, spring rolls, samosas, chicken skewers"],
].forEach((r, i) => tableRow(r, trayCols, false, i % 2 === 1));

subTitle("6b. Trays (+15% markup on original pricing)");
tableHeader(["Tray", "Price", "Contents (summary)"], trayCols);
[
  ["Classic Tray",  "₦34,500",  "Fruit salad, coleslaw, peppered fish (2pcs), jollof rice, chocolates, juice, water"],
  ["Deluxe Tray",   "₦51,750",  "Fruit salad, coleslaw, jollof rice, small chops, 2 peppered chicken thighs, Pringles, juice, water"],
  ["Grand Tray",    "₦103,500", "Coleslaw, fruit salad, 10\" cake, jollof & fried rice, fried plantain, half peppered chicken, red wine, water ×2"],
  ["Ultimate Tray", "₦132,250", "All Grand Tray items + spaghetti, small chops, pancakes, chocolates, chips, biscuits, fruit juice, red wine, water ×2"],
].forEach((r, i) => tableRow(r, trayCols, false, i % 2 === 1));

subTitle("6c. Singles");
tableHeader(["Item", "Price", "Notes"], trayCols);
[
  ["Jollof Lunch Pack (Regular)", "₦9,350",  "Single-serve jollof + grilled chicken or beef"],
  ["Jollof Lunch Pack (Large)",   "₦9,900",  "Single-serve jollof + grilled chicken or beef"],
  ["Small Chops Box",             "₦6,000",  "Puff-puff, spring rolls, samosas (assorted, 12pcs)"],
].forEach((r, i) => tableRow(r, trayCols, false, i % 2 === 1));

// ─── 7. MINDFUL MEALS ───────────────────────────────────────────────────────
sectionTitle("7. Mindful Meals — Subscription Plans");
note("Not a medical treatment plan. Does not replace a doctor or dietitian. Disclaimer appears prominently on the Mindful Meals page.");
subTitle("Subscription pricing");
const subCols = [120, 90, 90, 90, W - 390];
tableHeader(["Plan", "Duration", "Per day", "Total", "Saving"], subCols);
[
  ["Weekly",   "7 days",  "₦19,000","₦133,000","~9%"],
  ["Two-Week", "14 days", "₦17,500","₦245,000","~17% · Most Popular"],
  ["Monthly",  "28 days", "₦16,000","₦448,000","~24%"],
].forEach((r, i) => tableRow(r, subCols, false, i % 2 === 1));

note("No single-day subscription. Single-day = ₦21,000 (non-subscription, booked normally). Subscriptions are for planning ahead.");

subTitle("Delivery logistics");
body("Every plan delivers in TWO drops per week:\n• Drop 1 (start of week): Days 1–3 meals packed in labelled, fridge-safe containers.\n• Drop 2 (mid-week): Days 4–7 meals. Customer refrigerates on arrival and reheats before eating.\nTwo-Week and Monthly plans repeat this two-drop pattern every week.");

subTitle("Sample 6-day rotation");
const rotCols = [70, 120, 120, 120, 100];
tableHeader(["Day", "Breakfast", "Lunch", "Dinner", "Snack"], rotCols);
[
  ["Mon", "Oatmeal × Fruit",     "Edikang Ikong",  "Oha Soup",           "Tiger Nut Milk"],
  ["Tue", "Moin-moin × Pap",     "Onugbu Soup",    "Ewedu × Amala",      "Zobo (no sugar)"],
  ["Wed", "Yam × Egg Stew",      "Egusi Soup",     "Banga Soup",         "Roasted Peanuts"],
  ["Thu", "Oatmeal × Fruit",     "Edikang Ikong",  "Oha Soup",           "Fresh Pawpaw"],
  ["Fri", "Moin-moin × Pap",     "Efo-Riro",       "Onugbu Soup",        "Kale Cleanser"],
  ["Sat", "Yam × Egg Stew",      "Okro Soup",      "Ewedu × Amala",      "Cashew Nuts"],
].forEach((r, i) => tableRow(r, rotCols, false, i % 2 === 1));

// ─── 8. BOOKING RULES ───────────────────────────────────────────────────────
sectionTitle("8. Book a Slot — Rules & Rush Fee Logic");
subTitle("Cart rules");
body(
  "• Multi-item cart: customer configures each item (category → dish → size → qty → proteins) then clicks Add to Cart.\n" +
  "• Cart cap: maximum 5 DISTINCT meals (soups, stews, breakfast). Drinks, snacks, seeds, platters are unlimited.\n" +
  "• 'Distinct' = distinct dish — ordering 2L + 5L of the same soup counts as ONE meal.\n" +
  "• Pepper level: required slider (Low / Medium / Really Peppery) — must be deliberately moved; default alone does not count.\n" +
  "• Items removable from cart at any time. Live price updates instantly."
);

subTitle("Rush fee — charged when delivery is within 24 hours of booking");
const rushCols = [160, 120, W - 280];
tableHeader(["Distinct meals in order", "Rate per meal", "Total rush fee"], rushCols);
[
  ["1 meal",  "₦20,000", "₦20,000"],
  ["2 meals", "₦15,000", "₦30,000"],
  ["3 meals", "₦13,000", "₦39,000"],
  ["4 meals", "₦12,000", "₦48,000"],
  ["5 meals", "₦10,000", "₦50,000"],
].forEach((r, i) => tableRow(r, rushCols, false, i % 2 === 1));
note("Rush fee applies to food items only (soups, stews, breakfast). No rush fee outside the 24-hour window.");

subTitle("Booking reference format");
body("AHM-XXXX (e.g. AHM-0008). Auto-generated, shown on confirmation page, copyable to clipboard.");

// ─── 9. CATERING ────────────────────────────────────────────────────────────
sectionTitle("9. Catering — Event Quote Request");
body(
  "No fixed price. Catering form fields: Name, Phone, Email, Event type (Wedding / Birthday / Corporate / Wake / House party / Other), " +
  "Guest count, Event date, Event time, Service type (Delivery / Pickup / Full setup with staff), Venue address, Menu request (free text), " +
  "Budget range, Notes.\n\n" +
  "On submit: form values are compiled into a pre-filled WhatsApp message opened via wa.me/2348105506052."
);

// ─── 10. SITE STRUCTURE ─────────────────────────────────────────────────────
sectionTitle("10. Site Structure & SEO");
subTitle("Pages");
const pageCols = [160, 80, W - 240];
tableHeader(["Page / Route", "Nav visible?", "Notes"], pageCols);
[
  ["/  (Home)",                  "Always",   "Hero, gallery, differentiator banner, service cards"],
  ["/soups",                     "Our Meals","Soup table + Mindful Picks callout"],
  ["/stews",                     "Our Meals","Stew table + Mindful Picks callout"],
  ["/breakfast",                 "Our Meals","Breakfast combo cards + Mindful Picks callout"],
  ["/weekend-specials",          "Our Meals","Rotating specials, WhatsApp booking"],
  ["/products",                  "Always",   "Pantry, Snacks, Drinks, Seeds — WhatsApp orders"],
  ["/mindful-meals",             "Always",   "Subscription plans, picks, rotation table"],
  ["/blog",                      "Always",   "Listing of 3 live posts"],
  ["/catering",                  "Always",   "Event quote form → WhatsApp"],
  ["/book",                      "CTA btn",  "Full multi-item cart booking form"],
  ["/trays-platters",            "HIDDEN",   "Page exists; no nav link until photos ready"],
  ["/admin",                     "Hidden",   "Order management dashboard (staff only)"],
].forEach((r, i) => tableRow(r, pageCols, false, i % 2 === 1));

subTitle("SEO requirements (all pages)");
body(
  "• One <h1> per page containing primary keyword naturally.\n" +
  "• Unique <title> under ~60 characters including 'Lagos'.\n" +
  "• Unique <meta name='description'> under ~160 characters.\n" +
  "• <link rel='canonical'> pointing to page's own URL.\n" +
  "• Open Graph tags: og:title, og:description, og:type on every page.\n" +
  "• JSON-LD Restaurant/LocalBusiness schema on homepage (name, cuisine, phone, email, address Lagos/NG).\n" +
  "• alt text on every image describing what it shows.\n" +
  "• sitemap.xml listing all live pages; robots.txt pointing to it.\n" +
  "• Every price in Naira (₦) with comma formatting.\n" +
  "• Every product 'Order' button opens wa.me/2348105506052 with item name pre-filled."
);

note("On-page SEO is necessary but not sufficient for ranking. Results typically take months and also depend on backlinks, domain age, and competition.");

// ─── 11. BLOG ───────────────────────────────────────────────────────────────
sectionTitle("11. Blog");
body("Three posts live now:");
const blogCols = [W];
[
  "• 5 Nigerian Foods That Are Naturally Diabetes-Friendly",
  "• How to Cook Nigerian Soups With Less Oil (Without Losing Flavour)",
  "• What Makes a Meal 'Heart-Healthy'? A Nigerian Kitchen Guide",
].forEach(t => { doc.fontSize(9).font("Helvetica").fillColor(GREY).text(t, 58, doc.y, { width: W - 8 }); });
doc.moveDown(0.4);
body("Each post includes: one h1, meta description, canonical URL, Open Graph tags, cross-links to Mindful Meals/Soups/Stews, and the 'not medical advice' disclaimer.");

// ─── 12. TECHNICAL ──────────────────────────────────────────────────────────
sectionTitle("12. Technical Stack");
const techCols = [140, W - 140];
tableHeader(["Layer", "Technology"], techCols);
[
  ["Frontend",     "React + Vite + TypeScript + Tailwind CSS + shadcn/ui"],
  ["Backend API",  "Node.js + Express + Drizzle ORM"],
  ["Database",     "PostgreSQL (Replit managed)"],
  ["Auth (admin)", "Session-based (express-session)"],
  ["Email alerts", "Nodemailer + Gmail App Password (GMAIL_APP_PASSWORD secret)"],
  ["PDF/sitemap",  "Public static files in /public"],
  ["Fonts",        "Google Fonts: Inter (UI) + display font"],
].forEach((r, i) => tableRow(r, techCols, false, i % 2 === 1));

subTitle("Pending / Coming Soon");
body(
  "• Paystack payment integration (marked 'Coming Soon' in booking form)\n" +
  "• Google Calendar integration\n" +
  "• GMAIL_USER environment secret (email notifications disabled until set)\n" +
  "• Trays & Platters nav link (pending real photography)"
);

// ─── FOOTER on all pages ─────────────────────────────────────────────────────
const pageCount = doc.bufferedPageRange().count;
for (let i = 0; i < pageCount; i++) {
  doc.switchToPage(i);
  doc.fontSize(7).font("Helvetica").fillColor(GREY)
     .text(
       `AHmazing Foods — Product & Platform Specification  ·  Page ${i + 1} of ${pageCount}`,
       50, doc.page.height - 40, { width: W, align: "center" }
     );
}

doc.end();
console.log("PDF written to", OUT);
