/**
 * Wellness Drink Crates — order by health goal, not by drink name.
 * 6 categories · 10 drinks · minimum batch rules to prevent tiny orders.
 */

import { useState } from "react";
import { Droplets, Plus, Minus, Trash2, ShoppingCart, AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";

const WA_NUMBER = "2348105506052";
const ICE_COST      = 2000;
const DELIVERY_COST = 5000;
const BRANDED_COST  = 5000;
const NYLON_COST    = 2000;

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}${p}`;
const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

interface Drink  { name: string; pricePerBottle: number; img: string; }
interface Category {
  id: string; title: string; goal: string; tip: string; drinks: Drink[];
}
interface CartLine {
  categoryId: string; categoryTitle: string;
  drinks: { name: string; qty: number; pricePerBottle: number }[];
  subtotal: number;
}

const CATEGORIES: Category[] = [
  {
    id: "heart",
    title: "Heart & Blood Pressure Support",
    goal: "Cardiovascular health",
    tip: "Zobo (hibiscus tea) is rich in anthocyanins — antioxidants linked to lower blood pressure and reduced LDL cholesterol in peer-reviewed studies.",
    drinks: [
      { name: "Zobo Drink", pricePerBottle: 2900, img: "assets/products/zobo-drink.jpg" },
    ],
  },
  {
    id: "digestive",
    title: "Digestive Comfort & Gut Health",
    goal: "Gut support",
    tip: "Probiotic yogurt cultures support gut flora; ginger reduces nausea and bloating. Together a practical daily gut-health pairing.",
    drinks: [
      { name: "Yogurt Drink",          pricePerBottle: 3300, img: "assets/products/yogurt-drink.jpg" },
      { name: "Pineapple Ginger Drink", pricePerBottle: 2900, img: "assets/products/pineapple-ginger-drink.jpg" },
    ],
  },
  {
    id: "immunity",
    title: "Immunity & Defense",
    goal: "Immune support",
    tip: "Ginger and turmeric both contain anti-inflammatory compounds (gingerols, curcumin). Combined with vitamin C, one of the most evidence-backed pairings for immune support.",
    drinks: [
      { name: "Ginger Immune Booster",   pricePerBottle: 3200, img: "assets/products/ginger-immune-booster.jpg" },
      { name: "Turmeric Immune Booster", pricePerBottle: 3200, img: "assets/products/turmeric-immune-booster.jpg" },
    ],
  },
  {
    id: "detox",
    title: "Detox & Cleanse",
    goal: "Liver & gut cleanse",
    tip: "Kale provides chlorophyll and fibre to support liver function. Lemon and raw honey have mild antimicrobial properties and support digestion.",
    drinks: [
      { name: "Kale Cleanser",         pricePerBottle: 3700, img: "assets/products/kale-cleanser.jpg" },
      { name: "Lemon Honey Cleanser",  pricePerBottle: 3100, img: "assets/products/lemon-honey-cleanser.jpg" },
    ],
  },
  {
    id: "weight",
    title: "Weight Management & Fullness",
    goal: "Appetite management",
    tip: "Tiger nut milk is high in resistant starch and fibre, which slows digestion and keeps you feeling full longer — helpful for managing appetite between meals.",
    drinks: [
      { name: "Tiger Nut Milk", pricePerBottle: 3300, img: "assets/products/tiger-nut-milk.jpg" },
    ],
  },
  {
    id: "skin",
    title: "Skin, Eyes & Antioxidant Glow",
    goal: "Skin & eye health",
    tip: "Carrot juice is rich in beta-carotene (vitamin A, essential for skin and eye health). Orange juice adds vitamin C for collagen synthesis. A natural antioxidant duo.",
    drinks: [
      { name: "Carrot Juice",  pricePerBottle: 3300, img: "assets/products/carrot.jpg" },
      { name: "Orange Juice",  pricePerBottle: 2900, img: "assets/products/orange.jpg" },
    ],
  },
];

/** Returns a validation error string, or null if valid. */
function validateQtys(cat: Category, qtys: number[]): string | null {
  if (cat.drinks.length === 1) {
    return qtys[0] < 6 ? `Minimum 6 bottles of ${cat.drinks[0].name}` : null;
  }
  const [a, b] = qtys;
  if (!a && !b) return "Select at least one drink and set a quantity";
  if (a && !b) return a < 6 ? `Minimum 6 bottles of ${cat.drinks[0].name} when ordering just one drink` : null;
  if (!a && b) return b < 6 ? `Minimum 6 bottles of ${cat.drinks[1].name} when ordering just one drink` : null;
  // Both selected
  if (a < 5 || b < 5) return "When ordering both drinks, each needs at least 5 bottles";
  return null;
}

export default function DrinkCratesPage() {
  const [qtys, setQtys] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, c.drinks.map(() => 0)]))
  );
  const [cart, setCart]         = useState<CartLine[]>([]);
  const [packaging, setPackaging] = useState<"branded" | "nylon">("branded");
  const [errors, setErrors]     = useState<Record<string, string>>({});

  function setQty(catId: string, di: number, val: number) {
    setQtys((prev) => {
      const next = [...prev[catId]];
      next[di] = Math.max(0, val);
      return { ...prev, [catId]: next };
    });
  }

  function addToCrate(cat: Category) {
    const q = qtys[cat.id];
    const err = validateQtys(cat, q);
    if (err) { setErrors((p) => ({ ...p, [cat.id]: err })); return; }
    setErrors((p) => ({ ...p, [cat.id]: "" }));

    const drinks = cat.drinks
      .map((d, i) => ({ name: d.name, qty: q[i], pricePerBottle: d.pricePerBottle }))
      .filter((d) => d.qty > 0);
    const subtotal = drinks.reduce((s, d) => s + d.qty * d.pricePerBottle, 0);

    setCart((prev) => [...prev, { categoryId: cat.id, categoryTitle: cat.title, drinks, subtotal }]);
    setQtys((prev) => ({ ...prev, [cat.id]: cat.drinks.map(() => 0) }));
  }

  function removeFromCart(idx: number) {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }

  const drinkSubtotal  = cart.reduce((s, l) => s + l.subtotal, 0);
  const packagingCost  = packaging === "branded" ? BRANDED_COST : NYLON_COST;
  const grandTotal     = drinkSubtotal + ICE_COST + packagingCost + DELIVERY_COST;

  function buildMessage() {
    const lines: string[] = ["Hi, I'd like to order a Wellness Drink Crate:", ""];
    cart.forEach((line) => {
      lines.push(`▸ ${line.categoryTitle}`);
      line.drinks.forEach((d) =>
        lines.push(`  • ${d.name}: ${d.qty} bottles × ${fmt(d.pricePerBottle)} = ${fmt(d.qty * d.pricePerBottle)}`)
      );
    });
    lines.push("");
    lines.push(`Packaging: ${packaging === "branded" ? "Branded Pack" : "Nylon Bag"} — ${fmt(packagingCost)}`);
    lines.push(`Ice (always included): ${fmt(ICE_COST)}`);
    lines.push(`Delivery: ${fmt(DELIVERY_COST)}`);
    lines.push(`TOTAL: ${fmt(grandTotal)}`);
    lines.push("", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest text-primary">Wellness Drink Crates</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Drinks ordered<br />by what they do.
          </h1>
          <p className="text-xl text-background/80 max-w-2xl leading-relaxed">
            Six health goals. Ten drinks. Build a crate around what your body needs — minimum batch rules keep every bottle fresh-brewed, never rushed.
          </p>
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-6 -mt-6 mb-10 max-w-4xl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800 leading-relaxed">
          <strong>General wellness information only</strong> — not a treatment plan, not a substitute for medical advice.
          Consult your doctor or dietitian before making changes based on any health claim.
          These are real Nigerian-kitchen drinks, not medicine.
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* ── Minimum rules note ────────────────────────────────── */}
        <div className="mb-8 bg-muted/50 border border-border rounded-2xl px-5 py-4 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Minimum order rules:</strong>{" "}
          Single-drink categories need at least <strong>6 bottles</strong>. Two-drink categories:
          if you pick just one drink, same <strong>6-bottle</strong> minimum. If you pick both,
          each drink needs at least <strong>5 bottles</strong> — so the smallest split is 5 + 5 = 10.
          No maximum — order as many as you like above the floor.
        </div>

        {/* ── Categories ────────────────────────────────────────── */}
        <h2 className="text-2xl font-display font-black mb-6">Choose your health goals</h2>
        <div className="space-y-5">
          {CATEGORIES.map((cat) => {
            const q      = qtys[cat.id];
            const err    = errors[cat.id];
            const bothOn = cat.drinks.length > 1 && q[0] > 0 && q[1] > 0;

            return (
              <div key={cat.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-muted/40 px-5 py-4 border-b border-border flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-lg leading-tight">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.tip}</p>
                  </div>
                  <span className="shrink-0 text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    {cat.goal}
                  </span>
                </div>

                {/* Drink rows */}
                <div className="p-5">
                  <div className="space-y-4 mb-5">
                    {cat.drinks.map((drink, di) => (
                      <div key={drink.name} className="flex items-center gap-3">
                        {/* Photo */}
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                          <img src={asset(drink.img)} alt={drink.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm leading-tight">{drink.name}</p>
                          <p className="text-xs text-muted-foreground">{fmt(drink.pricePerBottle)} / bottle · 500ml</p>
                          <p className="text-[10px] text-primary mt-0.5">
                            {bothOn ? "Min 5 bottles each (split order)" : "Min 6 bottles"}
                          </p>
                        </div>
                        {/* Stepper */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setQty(cat.id, di, q[di] - 1)}
                            disabled={q[di] === 0}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-sm">{q[di]}</span>
                          <button
                            type="button"
                            onClick={() => setQty(cat.id, di, q[di] + 1)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {/* Line subtotal */}
                        <div className="w-20 text-right shrink-0">
                          <span className="text-sm font-bold">
                            {q[di] > 0 ? fmt(q[di] * drink.pricePerBottle) : <span className="text-muted-foreground/40">—</span>}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Error + Add button */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
                    <div className="min-w-0">
                      {err ? (
                        <div className="flex items-center gap-1.5 text-amber-700 text-xs">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{err}</span>
                        </div>
                      ) : <span />}
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCrate(cat)}
                      className="shrink-0 px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: "#0F9E0F" }}
                    >
                      + Add to Crate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Crate summary ─────────────────────────────────────── */}
        <div className="mt-12">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-10 border border-dashed border-border rounded-2xl">
              <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Your crate is empty — add a health goal above to get started.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg">Your Crate</h2>
                <span className="ml-auto text-xs text-muted-foreground">{cart.length} categor{cart.length === 1 ? "y" : "ies"}</span>
              </div>

              <div className="p-5 space-y-3">
                {/* Cart lines */}
                {cart.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-muted/40 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">{line.categoryTitle}</p>
                      {line.drinks.map((d) => (
                        <p key={d.name} className="text-xs text-muted-foreground">
                          {d.name}: {d.qty} × {fmt(d.pricePerBottle)} = <strong>{fmt(d.qty * d.pricePerBottle)}</strong>
                        </p>
                      ))}
                    </div>
                    <span className="font-bold text-sm shrink-0">{fmt(line.subtotal)}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Packaging choice */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3 text-foreground">Packaging</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { val: "branded" as const, label: "Branded Pack", sub: "Gift-ready, logo-printed", cost: BRANDED_COST },
                      { val: "nylon"   as const, label: "Nylon Bag",    sub: "Simple, practical",       cost: NYLON_COST   },
                    ] as const).map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setPackaging(opt.val)}
                        className={[
                          "py-3 px-4 rounded-xl text-left text-sm border transition-all",
                          packaging === opt.val
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-muted-foreground hover:border-foreground/40",
                        ].join(" ")}
                      >
                        <span className="font-bold block">{opt.label}</span>
                        <span className={["text-xs", packaging === opt.val ? "text-background/70" : "text-muted-foreground/70"].join(" ")}>
                          {opt.sub} · +{fmt(opt.cost)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-border space-y-2 text-sm">
                  {[
                    { label: "Drinks subtotal",                          val: drinkSubtotal  },
                    { label: "Ice (always included)",                    val: ICE_COST       },
                    { label: `Packaging (${packaging === "branded" ? "Branded Pack" : "Nylon Bag"})`, val: packagingCost  },
                    { label: "Delivery",                                 val: DELIVERY_COST  },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{fmt(val)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-3 border-t border-border text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">{fmt(grandTotal)}</span>
                  </div>
                </div>

                {/* Order button */}
                <a
                  href={buildMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 mt-1"
                  style={{ background: "#25D366" }}
                >
                  <MessageCircle className="w-4 h-4" /> Order on WhatsApp
                </a>

                <div className="flex items-center gap-1.5 justify-center text-xs text-primary mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bank details included in the message · FCMB 1009414545</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
