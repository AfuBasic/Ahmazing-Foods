/**
 * Seed script: clears and re-inserts all menu items per the approved product list.
 * Run with: scripts/node_modules/.bin/tsx artifacts/api-server/src/seed-menu.ts
 *
 * WARNING: this clears orders first (FK constraint). Run in dev only.
 */
import { db, menuItemsTable, ordersTable } from "@workspace/db";

// ── PROTEINS (soups only) ────────────────────────────────────────────────────
const soupProteins = [
  { name: "Beef",          extraCost: 4000  },
  { name: "Chicken",       extraCost: 4700  },
  { name: "Turkey",        extraCost: 5700  },
  { name: "Croaker",       extraCost: 5700  },
  { name: "Tilapia",       extraCost: 4700  },
  { name: "Catfish",       extraCost: 5700  },
  { name: "Snail",         extraCost: 6700  },
  { name: "Mixed Seafood", extraCost: 11700 },
  { name: "Gizzard",       extraCost: 5700  },
  { name: "Sausages",      extraCost: 4700  },
];

// ── SIZE HELPERS ─────────────────────────────────────────────────────────────
// price: 0 = "Contact Us" sentinel — rendered as a quote-request link in the UI
const standardSoupSizes = [
  { label: "2 Litres (Serves ~3)", price: 32000 },
  { label: "3 Litres (Serves ~5)", price: 36000 },
  { label: "5 Litres (Serves ~7)", price: 43000 },
  { label: "Cooler — Small",       price: 0 },
  { label: "Cooler — Medium",      price: 0 },
];
const seafoodOkroSizes = [
  { label: "5 Litres",        price: 56000 },
  { label: "Cooler — Small",  price: 0 },
  { label: "Cooler — Medium", price: 0 },
];
const stewSizes = (m: number, l: number) => [
  { label: "3 Litres (Serves ~5)", price: m },
  { label: "5 Litres (Serves ~8)", price: l },
];
const single = (price: number) => [{ label: "Standard", price }];

// ── IMAGE PLACEHOLDERS ───────────────────────────────────────────────────────
const SOUP_IMG    = "assets/food-egusi-hands.jpg";
const STEW_IMG    = "assets/food-jollof-fish.jpg";
const BF_IMG      = "assets/food-akara-pap.jpg";
const DRINK_IMG   = "";
const SNACK_IMG   = "";
const SEED_IMG    = "";
const PLATTER_IMG = "";

const items = [

  // ════════════════════════════════════════════════════════════════════════════
  // SOUPS (8)
  // ════════════════════════════════════════════════════════════════════════════
  {
    category: "soups",
    name: "Onugbu Soup (Bitterleaf)",
    description: "Rich bitterleaf soup garnished with dried fish, stockfish and cowhide.",
    sizes: standardSoupSizes, proteins: soupProteins, imageUrl: "assets/soups/onugbu-soup.jpg",
  },
  {
    category: "soups",
    name: "Oha Soup",
    description: "Traditional Igbo oha leaf soup, hearty and deeply flavoured.",
    sizes: standardSoupSizes, proteins: soupProteins, imageUrl: "assets/soups/oha-soup.jpg",
  },
  {
    category: "soups",
    name: "Okro Soup",
    description: "Freshly made okro soup, silky and well-seasoned with your choice of protein.",
    sizes: standardSoupSizes, proteins: soupProteins, imageUrl: "assets/soups/okro-soup.jpg",
  },
  {
    category: "soups",
    name: "Edikang Ikong (Vegetable Soup)",
    description: "A rich, nutritious Cross River vegetable soup made with ugu and waterleaf.",
    sizes: standardSoupSizes, proteins: soupProteins, imageUrl: "assets/soups/edikang-ikong.jpg",
  },
  {
    category: "soups",
    name: "Egusi Soup",
    description: "Thick, golden egusi soup cooked low and slow with ground melon seeds.",
    sizes: standardSoupSizes, proteins: soupProteins, imageUrl: "assets/soups/egusi-soup.jpg",
  },
  {
    category: "soups",
    name: "Banga Soup (Ofe Akwu)",
    description: "Aromatic palm nut soup cooked the Delta way with native spices.",
    sizes: standardSoupSizes, proteins: soupProteins, imageUrl: "assets/soups/banga-soup.jpg",
  },
  {
    category: "soups",
    name: "Efo-Riro",
    description: "Yoruba spinach stew cooked with peppers, assorted meats and a rich base.",
    sizes: standardSoupSizes, proteins: soupProteins, imageUrl: "assets/soups/efo-riro.jpg",
  },
  {
    category: "soups",
    name: "Seafood Okro",
    description: "Luscious okro soup loaded with fresh mixed seafood. 5L and Cooler only.",
    sizes: seafoodOkroSizes, proteins: [], imageUrl: "assets/soups/seafood-okro.jpg",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // STEWS (5 — Medium / Large only; Ata Din-Din removed)
  // ════════════════════════════════════════════════════════════════════════════
  {
    category: "stews",
    name: "Classic Tomato Stew",
    description: "A rich, slow-cooked tomato base stew — the backbone of Nigerian cooking.",
    sizes: stewSizes(37000, 45000), proteins: [], imageUrl: "assets/stews/classic-tomato-stew.webp",
  },
  {
    category: "stews",
    name: "Ayamase (Ofada Stew)",
    description: "Spicy green pepper stew with assorted offals — pairs perfectly with ofada rice.",
    sizes: stewSizes(40000, 49000), proteins: [], imageUrl: "assets/stews/ayamase-stew.jpg",
  },
  {
    category: "stews",
    name: "Peppered Beef Stew",
    description: "Tender chunks of beef in a bold pepper stew with caramelised onions.",
    sizes: stewSizes(37000, 45000), proteins: [], imageUrl: "assets/stews/peppered-beef-stew.jpg",
  },
  {
    category: "stews",
    name: "Peppered Chicken Stew",
    description: "Succulent chicken pieces simmered in a spiced tomato and pepper stew.",
    sizes: stewSizes(37000, 45000), proteins: [], imageUrl: "assets/stews/peppered-chicken-stew.jpg",
  },
  {
    category: "stews",
    name: "Peppered Turkey Stew",
    description: "Juicy turkey pieces slow-cooked in a bold, well-spiced pepper stew.",
    sizes: stewSizes(40000, 49000), proteins: [], imageUrl: "assets/stews/peppered-turkey-stew.jpg",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // BREAKFAST (4 combo plates)
  // ════════════════════════════════════════════════════════════════════════════
  {
    category: "breakfast",
    name: "Classic Nigerian",
    description: "Serves 2–3. Akara, pap, boiled eggs, fried plantain, and more.",
    sizes: single(22000), proteins: [], imageUrl: "assets/breakfast/classic-nigerian.png",
  },
  {
    category: "breakfast",
    name: "Hearty Plate",
    description: "Serves 2–3. Yam, plantain, egg stew, sausages, side salad, and more.",
    sizes: single(22000), proteins: [], imageUrl: "assets/breakfast/hearty-plate.png",
  },
  {
    category: "breakfast",
    name: "Sweet Start",
    description: "Serves 2–3. Oats, fresh fruit bowl, boiled egg, and more.",
    sizes: single(25000), proteins: [], imageUrl: "assets/breakfast/sweet-start.png",
  },
  {
    category: "breakfast",
    name: "Protein Power",
    description: "Serves 2–3. Moin-moin, akara, pap, boiled eggs, fried plantain, and more.",
    sizes: single(25000), proteins: [], imageUrl: "assets/breakfast/protein-power.png",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // DRINKS & WELLNESS (10 — all 500ml)
  // ════════════════════════════════════════════════════════════════════════════
  {
    category: "drinks",
    name: "Zobo Drink",
    description: "Chilled hibiscus drink made fresh in-house, lightly sweetened.",
    sizes: [{ label: "500ml bottle", price: 2900 }], proteins: [], imageUrl: "assets/products/zobo-drink.jpg",
  },
  {
    category: "drinks",
    name: "Pineapple Ginger Drink",
    description: "Freshly pressed pineapple with ginger — sweet, zingy, and deeply refreshing.",
    sizes: [{ label: "500ml bottle", price: 2900 }], proteins: [], imageUrl: "assets/products/pineapple-ginger-drink.jpg",
  },
  {
    category: "drinks",
    name: "Orange Juice",
    description: "Freshly squeezed orange juice, no additives, no preservatives.",
    sizes: [{ label: "500ml bottle", price: 2900 }], proteins: [], imageUrl: "assets/products/orange.jpg",
  },
  {
    category: "drinks",
    name: "Lemon Honey Cleanser",
    description: "Warming lemon and raw honey blend — soothing and immunity-building.",
    sizes: [{ label: "500ml bottle", price: 3100 }], proteins: [], imageUrl: "assets/products/lemon-honey-cleanser.jpg",
  },
  {
    category: "drinks",
    name: "Ginger Immune Booster",
    description: "Fresh ginger shot blended with lemon, turmeric and honey. Fiery and reviving.",
    sizes: [{ label: "500ml bottle", price: 3200 }], proteins: [], imageUrl: "assets/products/ginger-immune-booster.jpg",
  },
  {
    category: "drinks",
    name: "Turmeric Immune Booster",
    description: "Anti-inflammatory turmeric blend with black pepper and a touch of honey.",
    sizes: [{ label: "500ml bottle", price: 3200 }], proteins: [], imageUrl: "assets/products/turmeric-immune-booster.jpg",
  },
  {
    category: "drinks",
    name: "Yogurt Drink",
    description: "Creamy probiotic yogurt drink, natural and unsweetened.",
    sizes: [{ label: "500ml bottle", price: 3300 }], proteins: [], imageUrl: "assets/products/yogurt-drink.jpg",
  },
  {
    category: "drinks",
    name: "Tiger Nut Milk",
    description: "Dairy-free tiger nut milk — creamy, nutty and naturally sweet.",
    sizes: [{ label: "500ml bottle", price: 3300 }], proteins: [], imageUrl: "assets/products/tiger-nut-milk.jpg",
  },
  {
    category: "drinks",
    name: "Carrot Juice",
    description: "Fresh carrot juice with ginger and orange — vibrant and vitamin-packed.",
    sizes: [{ label: "500ml bottle", price: 3300 }], proteins: [], imageUrl: "assets/products/carrot.jpg",
  },
  {
    category: "drinks",
    name: "Kale Cleanser",
    description: "Green detox blend with kale, cucumber and lemon. Clean and light.",
    sizes: [{ label: "500ml bottle", price: 3700 }], proteins: [], imageUrl: "assets/products/kale-cleanser.jpg",
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SNACKS (8 — Kwili Kwili removed per spec)
  // ════════════════════════════════════════════════════════════════════════════
  {
    category: "snacks",
    name: "Roasted Peanuts",
    description: "Dry-roasted groundnuts, lightly salted and naturally crunchy.",
    sizes: [{ label: "200g pack", price: 1800 }], proteins: [], imageUrl: SNACK_IMG,
  },
  {
    category: "snacks",
    name: "Coated Peanuts",
    description: "Crunchy peanuts in a thin spiced coating — addictively snackable.",
    sizes: [{ label: "200g pack", price: 2000 }], proteins: [], imageUrl: SNACK_IMG,
  },
  {
    category: "snacks",
    name: "Yogurt Mix (Seed & Nut Blend)",
    description: "A nutritious blend of seeds and nuts, perfect stirred into yogurt or oats.",
    sizes: [{ label: "200g pack", price: 2800 }], proteins: [], imageUrl: SNACK_IMG,
  },
  {
    category: "snacks",
    name: "Cashew Nuts",
    description: "Premium whole cashew nuts, roasted and lightly salted.",
    sizes: [{ label: "200g pack", price: 2800 }], proteins: [], imageUrl: SNACK_IMG,
  },
  {
    category: "snacks",
    name: "Corn Sticks",
    description: "Light and airy corn puffs, mildly seasoned — great for all ages.",
    sizes: [{ label: "200g pack", price: 4000 }], proteins: [], imageUrl: SNACK_IMG,
  },
  {
    category: "snacks",
    name: "Chin Chin",
    description: "Classic Nigerian fried dough pastry — lightly sweetened and utterly moreish.",
    sizes: [{ label: "200g pack", price: 2800 }], proteins: [], imageUrl: SNACK_IMG,
  },
  {
    category: "snacks",
    name: "Plantain Chips — Ripe & Spicy",
    description: "Thinly sliced ripe plantain chips with a chili kick.",
    sizes: [{ label: "150g pack", price: 2200 }], proteins: [], imageUrl: SNACK_IMG,
  },
  {
    category: "snacks",
    name: "Plantain Chips — Toasted & Crunchy",
    description: "Unripe plantain chips, toasted to a satisfying crunch. Clean and savoury.",
    sizes: [{ label: "150g pack", price: 2200 }], proteins: [], imageUrl: SNACK_IMG,
  },

  // ════════════════════════════════════════════════════════════════════════════
  // SEEDS & SPICES (6 — raw spices, no sauce/marinade items)
  // ════════════════════════════════════════════════════════════════════════════
  {
    category: "seeds",
    name: "Chili Pepper",
    description: "Dried red chili pepper, freshly ground in-house. Clean heat, no fillers.",
    sizes: [{ label: "Ground · 100g", price: 2000 }], proteins: [], imageUrl: SEED_IMG,
  },
  {
    category: "seeds",
    name: "Cameroon Pepper",
    description: "Whole dried Cameroon pepper — intensely aromatic and deeply peppery.",
    sizes: [{ label: "Ground · 100g", price: 2500 }], proteins: [], imageUrl: SEED_IMG,
  },
  {
    category: "seeds",
    name: "Soya Mix",
    description: "A blended soya-based seasoning mix — rich, savoury, no additives.",
    sizes: [{ label: "200g", price: 2500 }], proteins: [], imageUrl: SEED_IMG,
  },
  {
    category: "seeds",
    name: "Cinnamon Powder",
    description: "Pure cinnamon powder, no added sugar or fillers.",
    sizes: [{ label: "100g", price: 2000 }], proteins: [], imageUrl: SEED_IMG,
  },
  {
    category: "seeds",
    name: "Chia Seeds",
    description: "Organic chia seeds — great for smoothies, oats and baking.",
    sizes: [{ label: "150g", price: 3500 }], proteins: [], imageUrl: SEED_IMG,
  },
  {
    category: "seeds",
    name: "Melon Seed",
    description: "Whole dried egusi/melon seeds — a pantry staple for soups and stews.",
    sizes: [{ label: "200g", price: 3000 }], proteins: [], imageUrl: SEED_IMG,
  },

  // ════════════════════════════════════════════════════════════════════════════
  // PLATTERS & TRAYS (8)
  // ════════════════════════════════════════════════════════════════════════════
  {
    category: "platters",
    name: "Breakfast Platter",
    description: "A full spread for 8–10: akara, moin-moin, pap, egg stew, yam, plantain, fresh juice.",
    sizes: single(154000), proteins: [], imageUrl: PLATTER_IMG,
  },
  {
    category: "platters",
    name: "Party Starter Platter",
    description: "Small chops assortment for 15–20: puff-puff, spring rolls, samosas, chicken skewers.",
    sizes: single(247500), proteins: [], imageUrl: PLATTER_IMG,
  },
  {
    category: "platters",
    name: "Classic Tray",
    description: "Jollof rice (serves 10), fried chicken (10pcs) and a side salad.",
    sizes: single(34500), proteins: [], imageUrl: PLATTER_IMG,
  },
  {
    category: "platters",
    name: "Deluxe Tray",
    description: "Jollof + fried rice (serves 15), grilled chicken (15pcs), coleslaw and plantain.",
    sizes: single(51750), proteins: [], imageUrl: PLATTER_IMG,
  },
  {
    category: "platters",
    name: "Grand Tray",
    description: "Full spread for 30: jollof, fried rice, peppered turkey, chicken, coleslaw, salad.",
    sizes: single(103500), proteins: [], imageUrl: PLATTER_IMG,
  },
  {
    category: "platters",
    name: "Ultimate Tray",
    description: "The works for 40+: all three rice options, grilled and peppered meats, full accompaniments.",
    sizes: single(132250), proteins: [], imageUrl: PLATTER_IMG,
  },
  {
    category: "platters",
    name: "Jollof Lunch Pack",
    description: "Single-serve jollof rice with grilled chicken or beef — perfect for office delivery.",
    sizes: [
      { label: "Regular",   price: 9350 },
      { label: "Large",     price: 9900 },
    ],
    proteins: [], imageUrl: PLATTER_IMG,
  },
  {
    category: "platters",
    name: "Small Chops Box",
    description: "Mixed small chops — puff-puff, spring rolls, samosas (assorted, 12pcs).",
    sizes: single(6000), proteins: [], imageUrl: PLATTER_IMG,
  },
];

async function seed() {
  console.log("Clearing existing orders (FK constraint)…");
  await db.delete(ordersTable);
  console.log("Clearing existing menu items…");
  await db.delete(menuItemsTable);

  console.log(`Inserting ${items.length} menu items…`);
  await db.insert(menuItemsTable).values(
    items.map((item) => ({ ...item, available: true }))
  );

  const counts: Record<string, number> = {};
  for (const i of items) counts[i.category] = (counts[i.category] ?? 0) + 1;
  for (const [cat, n] of Object.entries(counts)) console.log(`  ${cat}: ${n}`);

  console.log("Done ✓");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
