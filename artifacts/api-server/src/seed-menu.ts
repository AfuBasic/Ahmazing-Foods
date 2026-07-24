/**
 * Seed script: clears and re-inserts all menu items per the approved product list.
 * Run with: npx tsx src/seed-menu.ts
 */
import { db, menuItemsTable, ordersTable } from "@workspace/db";

// ── APPROVED PROTEINS (10) ───────────────────────────────────────────────────
const soupProteins = [
  { name: "Beef",          extraCost: 3000 },
  { name: "Chicken",       extraCost: 3000 },
  { name: "Turkey",        extraCost: 4000 },
  { name: "Croaker",       extraCost: 4000 },
  { name: "Tilapia",       extraCost: 3000 },
  { name: "Catfish",       extraCost: 4000 },
  { name: "Snail",         extraCost: 15000 },
  { name: "Mixed Seafood", extraCost: 10000 },
  { name: "Gizzard",       extraCost: 4000 },
  { name: "Sausages",      extraCost: 3000 },
];

// ── SOUP SIZES ────────────────────────────────────────────────────────────────
const standardSoupSizes = [
  { label: "2 Litres",        price: 15000 },
  { label: "3 Litres",        price: 18000 },
  { label: "5 Litres",        price: 23000 },
  { label: "Cooler — Small",  price: 50000 },
  { label: "Cooler — Medium", price: 65000 },
];

// Seafood Okro: 5L and Cooler sizes only
const seafoodOkroSizes = [
  { label: "5 Litres",        price: 35000 },
  { label: "Cooler — Small",  price: 85000 },
  { label: "Cooler — Medium", price: 120000 },
];

// ── STEW SIZES (Medium and Large only — Small discontinued) ──────────────────
const stewSizes = (m: number, l: number) => [
  { label: "Medium (serves 4–6)",  price: m },
  { label: "Large (serves 8–10)",  price: l },
];

const SOUP_IMG = "assets/food-egusi-hands.jpg";
const STEW_IMG = "assets/food-jollof-fish.jpg";
const BF_IMG   = "assets/food-akara-pap.jpg";

const items = [
  // ── SOUPS (8 approved) ───────────────────────────────────────────────────
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
    name: "Okro Soup",
    description: "Freshly made okro soup, silky and well-seasoned with your choice of protein.",
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
    name: "Efo-Riro",
    description: "Yoruba spinach stew cooked with peppers, assorted meats and a rich base.",
    sizes: standardSoupSizes,
    proteins: soupProteins,
    imageUrl: SOUP_IMG,
  },
  {
    category: "soups",
    name: "Seafood Okro",
    description: "Luscious okro soup loaded with fresh mixed seafood. Available in 5L and Cooler sizes only.",
    sizes: seafoodOkroSizes,
    proteins: [],
    imageUrl: SOUP_IMG,
  },

  // ── STEWS (6 approved, Medium/Large only) ────────────────────────────────
  {
    category: "stews",
    name: "Classic Tomato Stew",
    description: "A rich, slow-cooked tomato base stew — the backbone of Nigerian cooking.",
    sizes: stewSizes(14000, 24000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Ayamase (Ofada Stew)",
    description: "Spicy green pepper stew with assorted offals — pairs perfectly with ofada rice.",
    sizes: stewSizes(17000, 28000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Peppered Beef Stew",
    description: "Tender chunks of beef in a bold pepper stew with caramelised onions.",
    sizes: stewSizes(15000, 25000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Peppered Chicken Stew",
    description: "Succulent chicken pieces simmered in a spiced tomato and pepper stew.",
    sizes: stewSizes(15000, 25000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Peppered Turkey Stew",
    description: "Juicy turkey pieces slow-cooked in a bold, well-spiced pepper stew.",
    sizes: stewSizes(16000, 27000),
    proteins: [],
    imageUrl: STEW_IMG,
  },
  {
    category: "stews",
    name: "Ata Din-Din (Fried Pepper Stew)",
    description: "Deep-fried pepper stew — bold, smoky, and intensely flavoured.",
    sizes: stewSizes(14500, 24500),
    proteins: [],
    imageUrl: STEW_IMG,
  },

  // ── BREAKFAST (4 combo plates) ───────────────────────────────────────────
  {
    category: "breakfast",
    name: "The Classic Nigerian",
    description: "Akara (10pcs), pap (1L), 2 boiled eggs. A proper Lagos morning, made fresh.",
    sizes: [{ label: "Standard", price: 22000 }],
    proteins: [],
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "The Hearty Plate",
    description: "Yam (5 slices), plantain (5 slices), egg stew (1L), sausages, choice of Orange or Carrot Juice.",
    sizes: [{ label: "Standard", price: 22000 }],
    proteins: [],
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "The Sweet Start",
    description: "Oats (1L), fresh fruit bowl, choice of Orange or Carrot Juice. Light, clean and energising.",
    sizes: [{ label: "Standard", price: 25000 }],
    proteins: [],
    imageUrl: BF_IMG,
  },
  {
    category: "breakfast",
    name: "The Protein Power",
    description: "Moin-moin (2pcs), akara (10pcs), pap (1L), 2 boiled eggs. High protein, no shortcuts.",
    sizes: [{ label: "Standard", price: 25000 }],
    proteins: [],
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
