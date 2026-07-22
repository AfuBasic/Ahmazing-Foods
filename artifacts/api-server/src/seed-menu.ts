/**
 * Seed script: clears and re-inserts all menu items at original prices.
 * Run with: npx tsx src/seed-menu.ts
 */
import { db, menuItemsTable, ordersTable } from "@workspace/db";

// Proteins shared across all soups
const soupProteins = [
  { name: "Beef", extraCost: 3000 },
  { name: "Chicken", extraCost: 3000 },
  { name: "Goat Meat", extraCost: 3000 },
  { name: "Turkey", extraCost: 4000 },
  { name: "Croaker", extraCost: 4000 },
  { name: "Tilapia", extraCost: 3000 },
  { name: "Catfish", extraCost: 4000 },
  { name: "Bush-meat", extraCost: 6000 },
  { name: "Guinea Fowl", extraCost: 6000 },
  { name: "Offals / Assorted Meats", extraCost: 4000 },
  { name: "Ponmo", extraCost: 2000 },
  { name: "Snail", extraCost: 15000 },
  { name: "Mixed Seafood", extraCost: 10000 },
  { name: "Titus", extraCost: 5000 },
  { name: "Mackerel", extraCost: 5000 },
  { name: "Gizzard", extraCost: 4000 },
  { name: "Sausages", extraCost: 3000 },
];

const standardSoupSizes = [
  { label: "2 Litres", price: 15000 },
  { label: "3 Litres", price: 18000 },
  { label: "5 Litres", price: 23000 },
  { label: "Cooler — Small", price: 50000 },
  { label: "Cooler — Medium", price: 65000 },
];

const seafoodOkroSizes = [
  { label: "2 Litres", price: 25000 },
  { label: "3 Litres", price: 30000 },
  { label: "5 Litres", price: 35000 },
  { label: "Cooler — Small", price: 85000 },
  { label: "Cooler — Medium", price: 120000 },
];

const nativeSoupSizes = [
  { label: "2 Litres", price: 25000 },
  { label: "3 Litres", price: 30000 },
  { label: "5 Litres", price: 35000 },
  { label: "Cooler — Small", price: 50000 },
  { label: "Cooler — Medium", price: 65000 },
];

const eweduSizes = [
  { label: "2 Litres", price: 5000 },
  { label: "3 Litres", price: 8000 },
  { label: "5 Litres", price: 10000 },
  { label: "Cooler — Small", price: 50000 },
  { label: "Cooler — Medium", price: 65000 },
];

const eweduGbegiriSizes = [
  { label: "2 Litres", price: 10000 },
  { label: "3 Litres", price: 13000 },
  { label: "5 Litres", price: 16000 },
  { label: "Cooler — Small", price: 50000 },
  { label: "Cooler — Medium", price: 65000 },
];

const stewSizes = (s: number, m: number, l: number) => [
  { label: "Small (serves 2–3)", price: s },
  { label: "Medium (serves 4–6)", price: m },
  { label: "Large (serves 8–10)", price: l },
];

const breakfastProteins = [
  { name: "Chicken", extraCost: 0 },
  { name: "Beef", extraCost: 0 },
  { name: "Goat Meat", extraCost: 0 },
  { name: "Fish (Titus)", extraCost: 0 },
  { name: "Fish (Kote)", extraCost: 0 },
  { name: "Live Chicken", extraCost: 5000 },
];

const SOUP_IMG = "assets/food-egusi-hands.jpg";
const STEW_IMG = "assets/food-jollof-fish.jpg";
const BF_IMG   = "assets/food-akara-pap.jpg";

const items = [
  // ── SOUPS ────────────────────────────────────────────────────────────────
  {
    category: "soups",
    name: "Onugbu Soup (Bitterleaf)",
    description: "Rich bitterleaf soup garnished with dried fish, stockfish and cowhide.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Oha Soup",
    description: "Traditional Igbo oha leaf soup, hearty and deeply flavoured.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Nsala Soup (White Soup)",
    description: "Light, aromatic white soup — perfect with pounded yam.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Ogbono Soup",
    description: "Thick, earthy ogbono soup with a rich draw.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Okro / Ogbono Soup",
    description: "A satisfying combo of okro and ogbono with your choice of protein.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Okro Soup",
    description: "Freshly made okro soup, silky and well-seasoned.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Edikang Ikong (Vegetable Soup)",
    description: "A rich, nutritious Cross River vegetable soup made with ugu and waterleaf.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Afang Soup",
    description: "Classic Efik soup packed with afang leaves and waterleaf.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Egusi Soup",
    description: "Thick, golden egusi soup cooked low and slow with ground melon seeds.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Banga Soup (Delta Style)",
    description: "Aromatic palm nut soup cooked the Delta way with native spices.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Seafood Okro",
    description: "Luscious okro soup loaded with fresh mixed seafood.",
    sizes: seafoodOkroSizes,
    proteins: [],
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Native Soup (Abak)",
    description: "A bold, native palm-oil soup with authentic Abak spices.",
    sizes: nativeSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Ewedu Soup",
    description: "Smooth Yoruba jute-leaf soup, best paired with amala.",
    sizes: eweduSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Ewedu + Gbegiri",
    description: "The classic Yoruba duo — ewedu and bean soup together.",
    sizes: eweduGbegiriSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },

  // ── STEWS ────────────────────────────────────────────────────────────────
  {
    category: "stews",
    name: "Classic Tomato Stew",
    description: "A rich, slow-cooked tomato base stew — the backbone of Nigerian cooking.",
    sizes: stewSizes(8000, 14000, 24000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Ayamase (Ofada Stew)",
    description: "Spicy green pepper stew with assorted offals — pairs perfectly with ofada rice.",
    sizes: stewSizes(10000, 17000, 28000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Peppered Beef Stew",
    description: "Tender chunks of beef in a bold pepper stew with caramelised onions.",
    sizes: stewSizes(9000, 15000, 25000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Peppered Chicken Stew",
    description: "Succulent chicken pieces simmered in a spiced tomato and pepper stew.",
    sizes: stewSizes(9000, 15000, 25000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Coconut Curry Stew",
    description: "A Nigerian-inspired coconut curry — fragrant, creamy and lightly spiced.",
    sizes: stewSizes(10000, 17000, 28000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Ata Din-Din (Fried Pepper Stew)",
    description: "Deep-fried pepper stew — bold, smoky, and intensely flavoured.",
    sizes: stewSizes(8500, 14500, 24500),
    proteins: [],
    imageUrl: STEW_IMG,
  },

  // ── BREAKFAST ─────────────────────────────────────────────────────────────
  {
    category: "breakfast",
    name: "Akara (4pcs) × Pap",
    description: "Golden bean cakes served with smooth ogi pap. A Lagos morning classic.",
    sizes: [{ label: "Standard", price: 8000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "Akara (4pcs) × Bread",
    description: "Crispy bean cakes paired with fresh soft bread.",
    sizes: [{ label: "Standard", price: 8000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "Instant Noodles & Egg",
    description: "Noodles cooked with vegetables, eggs and our own spice blend.",
    sizes: [{ label: "Standard", price: 8000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "Moin-moin (2pcs) × Pap",
    description: "Steamed bean pudding with eggs and choice of protein, served with pap.",
    sizes: [{ label: "Standard", price: 10000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "Yam or Plantain × Egg Stew",
    description: "Boiled yam or fried plantain served with egg stew.",
    sizes: [{ label: "Standard", price: 10000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "Beans × Bread",
    description: "Slow-cooked honey beans served alongside fresh bread.",
    sizes: [{ label: "Standard", price: 8000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "Pancakes × 4pcs",
    description: "Four fluffy pancakes — served with syrup or your choice.",
    sizes: [{ label: "Standard", price: 8000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "Oatmeal × Milk",
    description: "Creamy oatmeal with milk — a wholesome start to the day.",
    sizes: [{ label: "Standard", price: 8000 }],
    proteins: breakfastProteins,
    imageUrl: BF_IMG,
  },
];

async function seed() {
  console.log("Clearing existing orders (FK constraint)…");
  await db.delete(ordersTable);
  console.log("Clearing existing menu items…");
  await db.delete(menuItemsTable);

  console.log(`Inserting ${items.length} menu items…`);
  await db.insert(menuItemsTable).values(
    items.map((item) => ({
      ...item,
      available: true,
    }))
  );

  console.log("Done ✓");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
