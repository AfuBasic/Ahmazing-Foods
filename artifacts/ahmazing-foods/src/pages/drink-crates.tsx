/**
 * Wellness Drink Crates — order by health goal, not by drink name.
 * 6 visual category cards · 10 drinks · minimum batch rules.
 */

import { useState } from "react";
import {
  Droplets, Plus, Minus, Trash2, ShoppingCart,
  AlertCircle, CheckCircle2, MessageCircle, ChevronDown, ChevronUp,
} from "lucide-react";

const WA_NUMBER     = "2348105506052";
const DELIVERY_ZONES = [
  { id: "standard", label: "Lekki Phase 1, Chevron, VGC, Ajah, VI, Ikoyi & nearby areas", fee: 5000 },
  { id: "remote",   label: "Lakowe, Ogombo, Sangotedo & areas past Ajah roundabout toward Epe", fee: 8500 },
] as const;
type ZoneId = typeof DELIVERY_ZONES[number]["id"];

const BRANDED_COST = 5000;
const NYLON_COST   = 2000;

const BASE  = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}${p}`;
const fmt   = (n: number) => `₦${n.toLocaleString("en-NG")}`;

interface Drink { name: string; pricePerBottle: number; img: string; }
interface Category {
  id: string; title: string; goal: string; tip: string;
  heroImg: string;        // large card banner
  drinks: Drink[];
}
interface CartLine {
  categoryId: string; categoryTitle: string;
  drinks: { name: string; qty: number; pricePerBottle: number }[];
  subtotal: number;
}

// ── 1024×1536 photos are the real drink shots ─────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: "heart",
    title: "Heart & Blood Pressure Support",
    goal: "Cardiovascular health",
    tip: "Zobo (hibiscus tea) is rich in anthocyanins — antioxidants linked to lower blood pressure and reduced LDL cholesterol in peer-reviewed studies.",
    heroImg: "assets/products/zobo.jpg",
    drinks: [
      { name: "Zobo Drink", pricePerBottle: 2900, img: "assets/products/zobo.jpg" },
    ],
  },
  {
    id: "digestive",
    title: "Digestive Comfort & Gut Health",
    goal: "Gut support",
    tip: "Probiotic yogurt cultures support gut flora; ginger reduces nausea and bloating. Together a practical daily gut-health pairing.",
    heroImg: "assets/products/yoghurt.jpg",
    drinks: [
      { name: "Yogurt Drink",           pricePerBottle: 3300, img: "assets/products/yoghurt.jpg" },
      { name: "Pineapple Ginger Drink", pricePerBottle: 2900, img: "assets/products/pineapple_ginger_lemon.jpg" },
    ],
  },
  {
    id: "immunity",
    title: "Immunity & Defense",
    goal: "Immune support",
    tip: "Ginger and turmeric both contain anti-inflammatory compounds (gingerols, curcumin). Combined with vitamin C, one of the most evidence-backed pairings for immune support.",
    heroImg: "assets/products/ginger_immune_booster.jpg",
    drinks: [
      { name: "Ginger Immune Booster",   pricePerBottle: 3200, img: "assets/products/ginger_immune_booster.jpg" },
      { name: "Turmeric Immune Booster", pricePerBottle: 3200, img: "assets/products/Turmeric.jpg" },
    ],
  },
  {
    id: "detox",
    title: "Detox & Cleanse",
    goal: "Liver & gut cleanse",
    tip: "Kale provides chlorophyll and fibre to support liver function. Lemon and raw honey have mild antimicrobial properties and support digestion.",
    heroImg: "assets/products/kale.jpg",
    drinks: [
      { name: "Kale Cleanser",        pricePerBottle: 3700, img: "assets/products/kale.jpg" },
      { name: "Lemon Honey Cleanser", pricePerBottle: 3100, img: "assets/products/lemon__honey.jpg" },
    ],
  },
  {
    id: "weight",
    title: "Weight Management & Fullness",
    goal: "Appetite management",
    tip: "Tiger nut milk is high in resistant starch and fibre, which slows digestion and keeps you feeling full longer — helpful for managing appetite between meals.",
    heroImg: "assets/products/tigernut.jpg",
    drinks: [
      { name: "Tiger Nut Milk", pricePerBottle: 3300, img: "assets/products/tigernut.jpg" },
    ],
  },
  {
    id: "skin",
    title: "Skin, Eyes & Antioxidant Glow",
    goal: "Skin & eye health",
    tip: "Carrot juice is rich in beta-carotene (vitamin A, essential for skin and eye health). Orange juice adds vitamin C for collagen synthesis. A natural antioxidant duo.",
    heroImg: "assets/products/carrot.jpg",
    drinks: [
      { name: "Carrot Juice", pricePerBottle: 3300, img: "assets/products/carrot.jpg" },
      { name: "Orange Juice", pricePerBottle: 2900, img: "assets/products/orange.jpg" },
    ],
  },
];

function validateQtys(cat: Category, qtys: number[]): string | null {
  if (cat.drinks.length === 1) {
    return qtys[0] < 6 ? `Minimum 6 bottles of ${cat.drinks[0].name}` : null;
  }
  const [a, b] = qtys;
  if (!a && !b) return "Select at least one drink and set a quantity";
  if (a && !b)  return a < 6 ? `Minimum 6 bottles of ${cat.drinks[0].name} when ordering just one drink` : null;
  if (!a && b)  return b < 6 ? `Minimum 6 bottles of ${cat.drinks[1].name} when ordering just one drink` : null;
  if (a < 5 || b < 5) return "When ordering both drinks, each needs at least 5 bottles";
  return null;
}

export default function DrinkCratesPage() {
  const [qtys, setQtys] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, c.drinks.map(() => 0)]))
  );
  const [open,      setOpen]      = useState<Record<string, boolean>>({});
  const [cart,      setCart]      = useState<CartLine[]>([]);
  const [packaging, setPackaging] = useState<"branded" | "nylon">("branded");
  const [zoneId,    setZoneId]    = useState<ZoneId>("standard");
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  const zone         = DELIVERY_ZONES.find((z) => z.id === zoneId)!;
  const packagingCost = packaging === "branded" ? BRANDED_COST : NYLON_COST;

  function toggleOpen(id: string) {
    setOpen((p) => ({ ...p, [id]: !p[id] }));
  }

  function setQty(catId: string, di: number, val: number) {
    setQtys((prev) => {
      const next = [...prev[catId]];
      next[di] = Math.max(0, val);
      return { ...prev, [catId]: next };
    });
  }

  function addToCrate(cat: Category) {
    const q   = qtys[cat.id];
    const err = validateQtys(cat, q);
    if (err) { setErrors((p) => ({ ...p, [cat.id]: err })); return; }
    setErrors((p) => ({ ...p, [cat.id]: "" }));

    const drinks  = cat.drinks.map((d, i) => ({ name: d.name, qty: q[i], pricePerBottle: d.pricePerBottle })).filter((d) => d.qty > 0);
    const subtotal = drinks.reduce((s, d) => s + d.qty * d.pricePerBottle, 0);

    setCart((prev) => [...prev, { categoryId: cat.id, categoryTitle: cat.title, drinks, subtotal }]);
    setQtys((prev) => ({ ...prev, [cat.id]: cat.drinks.map(() => 0) }));
    setOpen((p) => ({ ...p, [cat.id]: false }));
  }

  function removeFromCart(idx: number) { setCart((prev) => prev.filter((_, i) => i !== idx)); }

  const drinkSubtotal = cart.reduce((s, l) => s + l.subtotal, 0);
  const grandTotal    = drinkSubtotal + packagingCost + zone.fee;

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
    lines.push(`Ice: Included (complimentary)`);
    lines.push(`Delivery zone: ${zone.label} — ${fmt(zone.fee)}`);
    lines.push(`TOTAL: ${fmt(grandTotal)}`);
    lines.push("", "PAY BY TRANSFER:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* ── Hero ───────────────────────────────────────────────── */}
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
            Six health goals. Ten drinks. Build a crate around what your body needs —
            minimum batch rules keep every bottle fresh-brewed, never rushed.
          </p>
        </div>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-6 -mt-6 mb-10 max-w-5xl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800 leading-relaxed">
          <strong>General wellness information only</strong> — not a treatment plan, not a substitute for medical advice.
          Consult your doctor or dietitian before making changes based on any health claim.
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">

        {/* ── Min order note ─────────────────────────────────────── */}
        <div className="mb-8 bg-muted/50 border border-border rounded-2xl px-5 py-4 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Minimum order rules:</strong>{" "}
          Single-drink categories need at least <strong>6 bottles</strong>.
          Two-drink categories: pick one drink — still <strong>6 bottles</strong> minimum.
          Pick both — each needs at least <strong>5 bottles</strong> (smallest split = 10 total).
          Ice is always complimentary with every crate order.
        </div>

        {/* ── 6 Category cards ──────────────────────────────────── */}
        <h2 className="text-2xl font-display font-black mb-6">Choose your health goals</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {CATEGORIES.map((cat) => {
            const q      = qtys[cat.id];
            const err    = errors[cat.id];
            const isOpen = !!open[cat.id];
            const bothOn = cat.drinks.length > 1 && q[0] > 0 && q[1] > 0;
            const inCart = cart.some((l) => l.categoryId === cat.id);

            return (
              <div
                key={cat.id}
                className={[
                  "bg-card border rounded-2xl overflow-hidden transition-shadow",
                  inCart ? "border-primary/40 shadow-md" : "border-border",
                ].join(" ")}
              >
                {/* Card photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={asset(cat.heroImg)}
                    alt={cat.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[10px] bg-primary text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {cat.goal}
                    </span>
                    <h3 className="font-display font-bold text-white text-lg mt-2 leading-tight">{cat.title}</h3>
                  </div>
                  {inCart && (
                    <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Added
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{cat.tip}</p>

                  {/* Drink previews (collapsed) */}
                  {!isOpen && (
                    <div className="flex items-center gap-2 mb-4">
                      {cat.drinks.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                            <img src={asset(d.img)} alt={d.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-muted-foreground">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expand / collapse order controls */}
                  <button
                    type="button"
                    onClick={() => toggleOpen(cat.id)}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    <span>{isOpen ? "Close" : "Select quantities"}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-4">
                      {/* Drink rows */}
                      {cat.drinks.map((drink, di) => (
                        <div key={drink.name} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                            <img src={asset(drink.img)} alt={drink.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">{drink.name}</p>
                            <p className="text-xs text-muted-foreground">{fmt(drink.pricePerBottle)} / bottle</p>
                            <p className="text-[10px] text-primary mt-0.5">
                              {bothOn ? "Min 5 each" : "Min 6 bottles"}
                            </p>
                          </div>
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
                          <div className="w-16 text-right shrink-0">
                            <span className="text-sm font-bold">
                              {q[di] > 0 ? fmt(q[di] * drink.pricePerBottle) : <span className="text-muted-foreground/40">—</span>}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Error + Add */}
                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                        {err ? (
                          <div className="flex items-center gap-1.5 text-amber-700 text-xs min-w-0">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{err}</span>
                          </div>
                        ) : <span />}
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
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Crate summary ──────────────────────────────────────── */}
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 border border-dashed border-border rounded-2xl">
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your crate is empty — tap a card above to select quantities.</p>
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
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Packaging */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-foreground">Packaging</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { val: "branded" as const, label: "Branded Pack",   sub: "Gift-ready, logo-printed", cost: BRANDED_COST },
                    { val: "nylon"   as const, label: "Nylon Bag",       sub: "Simple and practical",    cost: NYLON_COST   },
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

              {/* Delivery zone */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-bold uppercase tracking-wider mb-3 text-foreground">Delivery Area</p>
                <div className="space-y-2">
                  {DELIVERY_ZONES.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setZoneId(z.id)}
                      className={[
                        "w-full py-3 px-4 rounded-xl text-left text-sm border transition-all flex items-start justify-between gap-3",
                        zoneId === z.id
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/40",
                      ].join(" ")}
                    >
                      <span className={["flex-1 leading-snug", zoneId === z.id ? "" : ""].join(" ")}>
                        {z.label}
                      </span>
                      <span className={["font-bold shrink-0", zoneId === z.id ? "text-primary" : ""].join(" ")}>
                        {fmt(z.fee)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-4 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Drinks subtotal</span>
                  <span className="font-semibold">{fmt(drinkSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Ice
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">FREE</span>
                  </span>
                  <span className="font-semibold text-primary">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Packaging ({packaging === "branded" ? "Branded Pack" : "Nylon Bag"})</span>
                  <span className="font-semibold">{fmt(packagingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold">{fmt(zone.fee)}</span>
                </div>
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
                <span>Bank details included · Ahmazing Cuisine · FCMB 1009414545</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
