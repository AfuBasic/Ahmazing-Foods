/**
 * Seed script: clears and re-inserts all menu items with 30% markup.
 * Run with: npx tsx scripts/seed-menu.ts
 */
import { db, menuItemsTable } from "@workspace/db";

const M = 1.3; // 30% markup multiplier
const p = (n: number) => Math.round(n * M); // apply markup

// Proteins shared across all soups
const soupProteins = [
  { name: "Beef", extraCost: p(3000) },
  { name: "Chicken", extraCost: p(3000) },
  { name: "Goat Meat", extraCost: p(3000) },
  { name: "Turkey", extraCost: p(4000) },
  { name: "Croaker", extraCost: p(4000) },
  { name: "Tilapia", extraCost: p(3000) },
  { name: "Catfish", extraCost: p(4000) },
  { name: "Bush-meat", extraCost: p(6000) },
  { name: "Guinea Fowl", extraCost: p(6000) },
  { name: "Offals / Assorted Meats", extraCost: p(4000) },
  { name: "Ponmo", extraCost: p(2000) },
  { name: "Snail", extraCost: p(15000) },
  { name: "Mixed Seafood", extraCost: p(10000) },
  { name: "Titus", extraCost: p(5000) },
  { name: "Mackerel", extraCost: p(5000) },
  { name: "Gizzard", extraCost: p(4000) },
  { name: "Sausages", extraCost: p(3000) },
];

// Standard soup sizes (applies to most soups)
const standardSoupSizes = [
  { label: "2 Litres", price: p(15000) },
  { label: "3 Litres", price: p(18000) },
  { label: "5 Litres", price: p(23000) },
  { label: "Cooler — Small", price: p(50000) },
  { label: "Cooler — Medium", price: p(65000) },
];

const seafoodOkroSizes = [
  { label: "2 Litres", price: p(25000) },
  { label: "3 Litres", price: p(30000) },
  { label: "5 Litres", price: p(35000) },
  { label: "Cooler — Small", price: p(85000) },
  { label: "Cooler — Medium", price: p(120000) },
];

const nativeSoupSizes = [
  { label: "2 Litres", price: p(25000) },
  { label: "3 Litres", price: p(30000) },
  { label: "5 Litres", price: p(35000) },
  { label: "Cooler — Small", price: p(50000) },
  { label: "Cooler — Medium", price: p(65000) },
];

const ewedуSizes = [
  { label: "2 Litres", price: p(5000) },
  { label: "3 Litres", price: p(8000) },
  { label: "5 Litres", price: p(10000) },
  { label: "Cooler — Small", price: p(50000) },
  { label: "Cooler — Medium", price: p(65000) },
];

const eweduGbegiriSizes = [
  { label: "2 Litres", price: p(10000) },
  { label: "3 Litres", price: p(13000) },
  { label: "5 Litres", price: p(16000) },
  { label: "Cooler — Small", price: p(50000) },
  { label: "Cooler — Medium", price: p(65000) },
];

// Stew proteins (same structure, no extra cost — protein is baked in)
const stewProteins: { name: string; extraCost: number }[] = [];

const stewSizes = (s: number, m: number, l: number) => [
  { label: "Small (serves 2–3)", price: p(s) },
  { label: "Medium (serves 4–6)", price: p(m) },
  { label: "Large (serves 8–10)", price: p(l) },
];

// Breakfast proteins from HTML note
const breakfastProteins = [
  { name: "Chicken", extraCost: 0 },
  { name: "Beef", extraCost: 0 },
  { name: "Goat Meat", extraCost: 0 },
  { name: "Fish (Titus)", extraCost: 0 },
  { name: "Fish (Kote)", extraCost: 0 },
  { name: "Live Chicken", extraCost: p(5000) },
];

const items = [
  // ── SOUPS ────────────────────────────────────────────────────────────────
  {
    category: "soups",
    name: "Onugbu Soup (Bitterleaf)",
    description: "Rich bitterleaf soup garnished with dried fish, stockfish and cowhide.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Oha Soup",
    description: "Traditional Igbo oha leaf soup, hearty and deeply flavoured.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Nsala Soup (White Soup)",
    description: "Light, aromatic white soup — perfect with pounded yam.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Ogbono Soup",
    description: "Draw soup made with ground ogbono seeds and choice proteins.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Okro/Ogbono Soup",
    description: "The best of both worlds — okro and ogbono combined.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Okro Soup",
    description: "Fresh okro soup, thick and well seasoned.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Edikang Ikong (Vegetable Soup)",
    description: "Efik classic packed with ugu and water leaves.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Afang Soup",
    description: "Wild afang leaves with periwinkles and assorted meat.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Egusi Soup",
    description: "Classic melon seed soup, rich with palm oil and spices.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Banga Soup (Ofe Akwu)",
    description: "Palm nut soup — the Delta classic, made the proper way.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Efo-Riro",
    description: "Yoruba-style spinach stew, deeply seasoned with locust beans.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Ofe Owerri",
    description: "Imo-style soup loaded with cocoyam and variety of proteins.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Seafood Okro (Fish, Shrimp, Prawns)",
    description: "Premium okro soup loaded with fresh seafood.",
    sizes: seafoodOkroSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Native Soup",
    description: "Bold and smoky native soup with palm oil and assorted stock.",
    sizes: nativeSoupSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Ewedu Soup",
    description: "Silky jute-leaf soup, pairs perfectly with gbegiri and amala.",
    sizes: ewedуSizes,
    proteins: soupProteins,
  },
  {
    category: "soups",
    name: "Ewedu & Gbegiri Soup",
    description: "The Lagos classic — ewedu and bean soup together.",
    sizes: eweduGbegiriSizes,
    proteins: soupProteins,
  },

  // ── STEWS ────────────────────────────────────────────────────────────────
  {
    category: "stews",
    name: "Classic Tomato Stew",
    description: "Everyday tomato stew cooked slow with peppers and seasoning.",
    sizes: stewSizes(8000, 14000, 24000),
    proteins: stewProteins,
  },
  {
    category: "stews",
    name: "Ayamase (Ofada Stew)",
    description: "Green pepper stew with assorted meats — rich and aromatic.",
    sizes: stewSizes(10000, 17000, 28000),
    proteins: stewProteins,
  },
  {
    category: "stews",
    name: "Peppered Beef Stew",
    description: "Slow-cooked beef in a thick, spiced tomato base.",
    sizes: stewSizes(9000, 15000, 25000),
    proteins: stewProteins,
  },
  {
    category: "stews",
    name: "Peppered Chicken Stew",
    description: "Juicy chicken pieces simmered in a bold pepper stew.",
    sizes: stewSizes(9000, 15000, 25000),
    proteins: stewProteins,
  },
  {
    category: "stews",
    name: "Coconut Curry Stew",
    description: "Creamy coconut stew with a warm Nigerian curry twist.",
    sizes: stewSizes(10000, 17000, 28000),
    proteins: stewProteins,
  },
  {
    category: "stews",
    name: "Ata Din-Din (Fried Pepper Stew)",
    description: "Classic fried pepper stew — the base of many Nigerian meals.",
    sizes: stewSizes(8500, 14500, 24500),
    proteins: stewProteins,
  },

  // ── BREAKFAST ────────────────────────────────────────────────────────────
  {
    category: "breakfast",
    name: "Akara (4pcs) × Pap",
    description: "Freshly fried bean cakes served with warm, smooth pap.",
    sizes: [{ label: "Standard", price: p(8000) }],
    proteins: breakfastProteins,
  },
  {
    category: "breakfast",
    name: "Akara (4pcs) × Bread",
    description: "Hot bean cakes paired with soft white bread.",
    sizes: [{ label: "Standard", price: p(8000) }],
    proteins: breakfastProteins,
  },
  {
    category: "breakfast",
    name: "Instant Noodles & Egg",
    description: "Quick, comforting noodles with egg — spiced your way.",
    sizes: [{ label: "Standard", price: p(8000) }],
    proteins: breakfastProteins,
  },
  {
    category: "breakfast",
    name: "Moin-moin (2pcs) × Pap",
    description: "Steamed bean pudding — two generous portions with pap.",
    sizes: [{ label: "Standard", price: p(10000) }],
    proteins: breakfastProteins,
  },
  {
    category: "breakfast",
    name: "Yam or Plantain × Egg Stew",
    description: "Boiled yam or fried plantain served with egg stew.",
    sizes: [{ label: "Standard", price: p(10000) }],
    proteins: breakfastProteins,
  },
  {
    category: "breakfast",
    name: "Beans × Bread",
    description: "Slow-cooked honey beans served alongside fresh bread.",
    sizes: [{ label: "Standard", price: p(8000) }],
    proteins: breakfastProteins,
  },
  {
    category: "breakfast",
    name: "Pancakes × 4pcs",
    description: "Four fluffy pancakes — served with syrup or your choice.",
    sizes: [{ label: "Standard", price: p(8000) }],
    proteins: breakfastProteins,
  },
  {
    category: "breakfast",
    name: "Oatmeal × Milk",
    description: "Creamy oatmeal with milk — a wholesome start to the day.",
    sizes: [{ label: "Standard", price: p(8000) }],
    proteins: breakfastProteins,
  },
];

async function seed() {
  console.log("Clearing existing menu items…");
  await db.delete(menuItemsTable);

  console.log(`Inserting ${items.length} menu items…`);
  await db.insert(menuItemsTable).values(
    items.map((item) => ({
      ...item,
      available: true,
      imageUrl: null,
    }))
  );

  console.log("Done ✓");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
