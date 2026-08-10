/**
 * Wellness Drink Crates — order by health goal, not by drink name.
 * 6 visual category cards · 10 drinks · minimum batch rules.
 * Delivered from Agungi, Lekki. 6 delivery tiers.
 */

import { useState, useEffect } from "react";
import {
  Droplets, Plus, Minus, Trash2, ShoppingCart,
  AlertCircle, CheckCircle2, MessageCircle, ChevronDown, ChevronUp,
  MapPin, FlaskConical, Check, User, Phone,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

const WA_NUMBER = "2348105506052";

const OFFICE_PHONE = "+234 (810)-550-6052";

const BRANDED_COST = 5000;
const NYLON_COST   = 0;   // Nylon bag is free — included with every order

const BASE  = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}${p}`;
const fmt   = (n: number) => `₦${n.toLocaleString("en-NG")}`;

// Car delivery zones — all quoted individually (no fixed fee shown online)
const CAR_ZONES = [
  { id: "t1",  label: "Tier 1 — Lekki, Ikate, VGC, Chevron, Igbo-Efon" },
  { id: "t1b", label: "Tier 1B — Ajah, Abraham Adesanya, Lakowe, Awoyaya, Ogombo" },
  { id: "t2",  label: "Tier 2 — Lagos Island, Marina, Apapa, VI, Ikoyi, Banana Island, Yaba, Surulere" },
  { id: "t3",  label: "Tier 3 — Ikeja, Maryland, Gbagada, Anthony, Ojota" },
  { id: "t4",  label: "Tier 4 — Festac, Oshodi, Isolo, Mushin, Amuwo-Odofin, Alimosho, Agege" },
  { id: "t5",  label: "Tier 5 — Ikorodu, Badagry, Epe, far Ibeju-Lekki" },
] as const;

interface Drink    { name: string; pricePerBottle: number; img: string; }
interface Category {
  id: string; title: string; goal: string;
  /** Headline science claim — shown prominently. */
  benefit: string;
  /** Additional detail shown in collapse. */
  detail: string;
  heroImg: string;
  drinks: Drink[];
}
interface CartLine {
  categoryId: string; categoryTitle: string;
  drinks: { name: string; qty: number; pricePerBottle: number }[];
  subtotal: number;
}

// ── Real 1024×1536 drink photos ───────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: "heart",
    title: "Heart & Blood Pressure Support",
    goal: "Cardiovascular health",
    benefit: "Zobo (hibiscus tea) has been shown in peer-reviewed clinical trials to reduce systolic blood pressure by up to 7 mmHg and lower LDL (\"bad\") cholesterol — effects attributed to its high anthocyanin content.",
    detail: "Anthocyanins are the same flavonoid class studied in berries and red wine. Regular hibiscus consumption has been compared favourably with low-dose antihypertensive medication in short-term trials (though it is not a replacement for it). Our Zobo is brewed fresh and lightly sweetened, with no additives.",
    heroImg: "assets/products/zobo.jpg",
    drinks: [
      { name: "Zobo Drink", pricePerBottle: 2900, img: "assets/products/zobo.jpg" },
    ],
  },
  {
    id: "digestive",
    title: "Digestive Comfort & Gut Health",
    goal: "Gut support",
    benefit: "Probiotic yogurt cultures (Lactobacillus strains) have strong evidence for restoring gut microbiome balance, reducing bloating, and supporting bowel regularity. Ginger actively reduces nausea and intestinal inflammation via gingerol compounds.",
    detail: "The gut microbiome influences everything from immunity to mood — a diverse population of bacteria is consistently linked to better health outcomes. Fermented drinks are one of the most accessible and well-studied ways to support it. Combined with ginger's anti-spasmodic properties, this is a practical daily stack for digestive comfort.",
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
    benefit: "Ginger (gingerols) and turmeric (curcumin) are two of the most studied natural anti-inflammatory compounds in the world. Combined with vitamin C from the juice base, they activate immune cell production and reduce inflammatory markers measurable in blood.",
    detail: "Curcumin has been studied extensively in peer-reviewed literature — over 12,000 published papers as of 2024. The key to absorption is black pepper (piperine), which increases bioavailability by up to 2000%. Our Turmeric Immune Booster includes black pepper. Ginger's gingerols have separate but complementary immune-modulating effects, making these two a well-supported pairing.",
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
    benefit: "Kale is one of the most nutrient-dense vegetables measured — high in chlorophyll, sulforaphane, and fibre that directly supports liver detoxification pathways. Lemon and raw honey provide vitamin C and mild antimicrobial polyphenols.",
    detail: "The liver runs two phases of detoxification — both require specific micronutrients. Cruciferous vegetables like kale (related to broccoli) supply sulforaphane, which activates phase II liver enzymes. Lemon's flavonoids support phase I. Together they create a complementary cleansing effect. This is not a crash detox — it is a daily nutritional support approach backed by food-science research.",
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
    benefit: "Tiger nut (aya) is exceptionally high in resistant starch and insoluble fibre — two components consistently linked to satiety, slower glucose absorption, and reduced calorie intake at subsequent meals in clinical studies.",
    detail: "Resistant starch acts as a prebiotic, feeding beneficial gut bacteria while simultaneously slowing digestion. This means tiger nut milk keeps you feeling full significantly longer than most drinks — and its natural sweetness comes with a lower glycemic impact than sugar-sweetened alternatives. It is also dairy-free, making it accessible to lactose-intolerant customers.",
    heroImg: "assets/products/tigernut.jpg",
    drinks: [
      { name: "Tiger Nut Milk", pricePerBottle: 3300, img: "assets/products/tigernut.jpg" },
    ],
  },
  {
    id: "skin",
    title: "Skin, Eyes & Antioxidant Glow",
    goal: "Skin & eye health",
    benefit: "Carrot juice delivers beta-carotene — converted by the body into vitamin A, which is essential for skin cell renewal, eye health, and protecting against UV damage. Orange juice adds vitamin C, which is required for collagen synthesis and is one of the most evidence-backed nutrients for skin integrity.",
    detail: "Vitamin A deficiency is one of the most common nutritional gaps in sub-Saharan Africa and the leading cause of preventable blindness in children. Even mild subclinical deficiency affects skin turnover and wound healing. Carrot juice is one of the most bioavailable dietary sources of beta-carotene. Pairing it with vitamin C from orange juice amplifies absorption and adds antioxidant protection against free-radical skin damage.",
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
  if (a && !b)  return a < 6 ? `Minimum 6 of ${cat.drinks[0].name} when ordering just one drink` : null;
  if (!a && b)  return b < 6 ? `Minimum 6 of ${cat.drinks[1].name} when ordering just one drink` : null;
  if (a < 5 || b < 5) return "When ordering both drinks, each needs at least 5 bottles";
  return null;
}

export default function DrinkCratesPage() {
  const { cart: globalCart, addToCart: addGlobalCart, removeFromCart: removeGlobalCart } = useCart();
  const { toast } = useToast();

  const [qtys,      setQtys]      = useState<Record<string, number[]>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.id, c.drinks.map(() => 0)]))
  );
  const [open,      setOpen]      = useState<Record<string, boolean>>({});
  const [packaging,  setPackaging]  = useState<"nylon" | "branded">("nylon");
  const [delivMode,  setDelivMode]  = useState<"car" | "own" | "">("");
  const [carZone,    setCarZone]    = useState<string>("");
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  // Customer details
  const [custName,    setCustName]    = useState("");
  const [custPhone,   setCustPhone]   = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [hasAlt,      setHasAlt]      = useState(false);
  const [altName,     setAltName]     = useState("");
  const [altPhone,    setAltPhone]    = useState("");

  const crateItems = globalCart.filter((i) => i.category === "crate");
  const packagingCost = packaging === "branded" ? BRANDED_COST : NYLON_COST;
  const drinkSubtotal = crateItems.reduce((s, i) => s + i.price, 0);
  // Delivery is always quoted (car) or free (own) — never a fixed fee shown on site
  const grandTotal   = drinkSubtotal + packagingCost;

  // Reset delivery mode + zone when crate items are fully cleared
  useEffect(() => {
    if (crateItems.length === 0) { setDelivMode(""); setCarZone(""); }
  }, [crateItems.length]);

  // Computed readiness
  const customerReady = !!(custName.trim() && custPhone.trim() && custAddress.trim());
  const delivReady    = delivMode === "own" || (delivMode === "car" && carZone !== "");
  const canOrder      = crateItems.length > 0 && customerReady && delivReady;

  function toggleOpen(id: string) { setOpen((p) => ({ ...p, [id]: !p[id] })); }

  function setQty(catId: string, di: number, val: number) {
    setQtys((prev) => {
      const next = [...prev[catId]]; next[di] = Math.max(0, val);
      return { ...prev, [catId]: next };
    });
  }

  function addToCrate(cat: Category) {
    const q   = qtys[cat.id];
    const err = validateQtys(cat, q);
    if (err) { setErrors((p) => ({ ...p, [cat.id]: err })); return; }
    setErrors((p) => ({ ...p, [cat.id]: "" }));
    const drinks = cat.drinks
      .map((d, i) => ({ name: d.name, qty: q[i], pricePerBottle: d.pricePerBottle }))
      .filter((d) => d.qty > 0);
    const subtotal = drinks.reduce((s, d) => s + d.qty * d.pricePerBottle, 0);
    const sizeDesc = drinks.map((d) => `${d.name} ×${d.qty}`).join(", ");

    addGlobalCart({
      id:               `crate-${cat.id}-${Date.now()}`,
      menuItemId:       0,
      menuItemName:     `Wellness Crate — ${cat.title}`,
      category:         "crate",
      selectedSize:     sizeDesc,
      itemQty:          1,
      selectedProteins: [],
      price:            subtotal,
      imageUrl:         cat.heroImg,
      crateLines:       drinks,
    });

    setQtys((prev) => ({ ...prev, [cat.id]: cat.drinks.map(() => 0) }));
    setOpen((p) => ({ ...p, [cat.id]: false }));
    toast({
      title: "Added to Cart",
      description: `Wellness Crate — ${cat.title} (${sizeDesc})`,
    });
  }

  function removeFromCart(id: string) {
    removeGlobalCart(id);
  }

  function buildMessage() {
    const zoneObj = CAR_ZONES.find((z) => z.id === carZone);
    const lines: string[] = ["Hi, I'd like to order a Wellness Drink Crate:", ""];

    // Customer details
    lines.push(`Name: ${custName.trim()}`);
    lines.push(`Phone: ${custPhone.trim()}`);
    lines.push(`Delivery address: ${custAddress.trim()}`);
    if (hasAlt && altName.trim()) {
      lines.push(`Recipient (receiving order): ${altName.trim()}${altPhone.trim() ? ` | ${altPhone.trim()}` : ""}`);
    }
    lines.push("");

    // Cart
    crateItems.forEach((item) => {
      lines.push(`▸ ${item.menuItemName}`);
      if (item.crateLines) {
        item.crateLines.forEach((d) =>
          lines.push(`  • ${d.name}: ${d.qty} bottles × ${fmt(d.pricePerBottle)} = ${fmt(d.qty * d.pricePerBottle)}`)
        );
      }
    });
    lines.push("");
    lines.push(`Packaging: ${packaging === "branded" ? `Branded Pack — ${fmt(BRANDED_COST)}` : "Nylon Bag — Complimentary"}`);
    lines.push(`Ice: Complimentary`);
    if (delivMode === "car" && zoneObj) {
      lines.push(`Delivery area: ${zoneObj.label}`);
      lines.push(`Delivery: Car delivery — fee to be confirmed by phone`);
    } else {
      lines.push(`Delivery: Customer's own arrangement — no delivery fee`);
    }
    lines.push(`TOTAL (excl. delivery): ${fmt(grandTotal)}`);
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
            Six health goals. Ten drinks. Every bottle is backed by food science you can read.
            Build a crate around what your body actually needs.
          </p>
        </div>
      </div>

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-6 -mt-6 mb-10 max-w-5xl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800 leading-relaxed">
          <strong>General wellness information only</strong> — not a treatment plan, not a substitute for medical advice.
          The science cited is from peer-reviewed research on ingredients, not on our specific products.
          Consult your doctor or dietitian before making dietary changes, especially if you take medication.
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-5xl">

        {/* ── Min order note ─────────────────────────────────────── */}
        <div className="mb-8 bg-muted/50 border border-border rounded-2xl px-5 py-4 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Minimum order rules:</strong>{" "}
          Single-drink categories need at least <strong>6 bottles</strong>. Two-drink categories: pick one drink — still <strong>6 bottles</strong> minimum. Pick both — each needs at least <strong>5 bottles</strong> (smallest split = 10 total).
          <span className="ml-2 inline-flex items-center gap-1 text-primary font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Ice always included, complimentary.</span>
        </div>

        {/* ── 6 Category cards ──────────────────────────────────── */}
        <h2 className="text-2xl font-display font-black mb-6">Choose your health goals</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
          {CATEGORIES.map((cat) => {
            const q      = qtys[cat.id];
            const err    = errors[cat.id];
            const isOpen = !!open[cat.id];
            const bothOn = cat.drinks.length > 1 && q[0] > 0 && q[1] > 0;
            const inCart = globalCart.some((l) => l.id.startsWith(`crate-${cat.id}`));

            return (
              <div
                key={cat.id}
                className={[
                  "bg-card border rounded-2xl overflow-hidden transition-shadow",
                  inCart ? "border-primary/50 shadow-lg" : "border-border",
                ].join(" ")}
              >
                {/* Card photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img src={asset(cat.heroImg)} alt={cat.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[10px] bg-primary text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {cat.goal}
                    </span>
                    <h3 className="font-display font-bold text-white text-xl mt-2 leading-tight drop-shadow">{cat.title}</h3>
                  </div>
                  {inCart && (
                    <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Added
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">

                  {/* ── Science benefit — prominent ── */}
                  <div className="bg-primary/6 border border-primary/20 rounded-xl px-4 py-3 mb-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">What the science says</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{cat.benefit}</p>
                    {!isOpen && cat.detail && (
                      <button
                        type="button"
                        onClick={() => toggleOpen(cat.id)}
                        className="mt-2 text-xs text-primary font-semibold hover:underline"
                      >
                        Read more →
                      </button>
                    )}
                    {isOpen && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-2 border-t border-primary/10 pt-2">{cat.detail}</p>
                    )}
                  </div>

                  {/* Drink preview chips (collapsed) */}
                  {!isOpen && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {cat.drinks.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5 bg-muted rounded-full px-2.5 py-1">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-background shrink-0">
                            <img src={asset(d.img)} alt={d.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-foreground font-medium">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleOpen(cat.id)}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                  >
                    <span>{isOpen ? "Close" : "Select quantities & order"}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-4">
                      {cat.drinks.map((drink, di) => (
                        <div key={drink.name} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                            <img src={asset(drink.img)} alt={drink.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">{drink.name}</p>
                            <p className="text-xs text-muted-foreground">{fmt(drink.pricePerBottle)} / bottle · 500ml</p>
                            <p className="text-[10px] text-primary mt-0.5">
                              {bothOn ? "Min 5 each (split order)" : "Min 6 bottles"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button type="button" onClick={() => setQty(cat.id, di, q[di] - 1)} disabled={q[di] === 0}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-bold text-sm">{q[di]}</span>
                            <button type="button" onClick={() => setQty(cat.id, di, q[di] + 1)}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="w-16 text-right shrink-0">
                            <span className="text-sm font-bold">
                              {q[di] > 0 ? fmt(q[di] * drink.pricePerBottle) : <span className="text-muted-foreground/30">—</span>}
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                        {err ? (
                          <div className="flex items-center gap-1.5 text-amber-700 text-xs min-w-0">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ) : <span />}
                        <button type="button" onClick={() => addToCrate(cat)}
                          className="shrink-0 px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                          style={{ background: "#0F9E0F" }}>
                          + Add to Cart
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
        {crateItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 border border-dashed border-border rounded-2xl">
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your crate is empty — tap a card above to select quantities.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Your Crate</h2>
              <span className="ml-auto text-xs text-muted-foreground">{crateItems.length} crate{crateItems.length === 1 ? "" : "s"}</span>
            </div>

            <div className="p-5 space-y-3">

              {/* Cart lines */}
              {crateItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3.5 bg-muted/40 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">{item.menuItemName}</p>
                    {item.crateLines?.map((d) => (
                      <p key={d.name} className="text-xs text-muted-foreground">
                        {d.name}: {d.qty} × {fmt(d.pricePerBottle)} = <strong>{fmt(d.qty * d.pricePerBottle)}</strong>
                      </p>
                    ))}
                  </div>
                  <span className="font-bold text-sm shrink-0">{fmt(item.price)}</span>
                  <button type="button" onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0" aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* ── Customer details ── */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">Your Details</p>
                  <span className="text-destructive text-xs font-bold">*required</span>
                </div>
                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Full name *"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number *"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Delivery address *"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />

                  {/* Alt recipient toggle */}
                  <button
                    type="button"
                    onClick={() => setHasAlt((v) => !v)}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
                  >
                    <span className="text-muted-foreground">Someone else is receiving this order</span>
                    <span className="text-xs text-muted-foreground">{hasAlt ? "▲ optional" : "▼ optional"}</span>
                  </button>
                  {hasAlt && (
                    <div className="pl-3 border-l-2 border-border space-y-2.5">
                      <input
                        type="text"
                        placeholder="Recipient's name"
                        value={altName}
                        onChange={(e) => setAltName(e.target.value)}
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                      <input
                        type="tel"
                        placeholder="Recipient's phone"
                        value={altPhone}
                        onChange={(e) => setAltPhone(e.target.value)}
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Packaging (optional) ── */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">Packaging</p>
                  <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">optional</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  We always package in a clean nylon bag at no charge. Upgrade to a branded pack if you're gifting or want the AHmazing Foods presentation.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { val: "nylon"   as const, label: "Nylon Bag",    sub: "Clean & practical", cost: NYLON_COST,   free: true  },
                    { val: "branded" as const, label: "Branded Pack", sub: "Gift-ready, logo-printed", cost: BRANDED_COST, free: false },
                  ] as const).map((opt) => (
                    <button key={opt.val} type="button" onClick={() => setPackaging(opt.val)}
                      className={[
                        "py-3 px-4 rounded-xl text-left text-sm border transition-all",
                        packaging === opt.val
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/40",
                      ].join(" ")}>
                      <span className="font-bold block">{opt.label}</span>
                      <span className={["text-xs flex items-center gap-1", packaging === opt.val ? "text-background/70" : "text-muted-foreground/70"].join(" ")}>
                        {opt.sub}
                        {opt.free
                          ? <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">FREE</span>
                          : <span>· +{fmt(opt.cost)}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Delivery ── */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">Delivery</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Wellness Drink Crates travel by car — bottles and ice need a vehicle, not a bike.
                </p>
                <div className="space-y-2">
                  {/* Car Delivery */}
                  <button type="button" onClick={() => setDelivMode("car")}
                    className={[
                      "w-full flex items-center gap-3 py-3 px-4 rounded-xl text-left text-sm border-2 transition-all",
                      delivMode === "car"
                        ? "border-amber-500 bg-amber-50"
                        : "border-border hover:border-amber-400/60",
                    ].join(" ")}>
                    <span className={["w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                      delivMode === "car" ? "border-amber-500 bg-amber-500" : "border-muted-foreground/30"].join(" ")}>
                      {delivMode === "car" && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span>
                      <span className="font-bold block">🚗 Car Delivery</span>
                      <span className="text-xs text-muted-foreground">Select your area — fee confirmed before delivery</span>
                    </span>
                  </button>

                  {/* Car zone picker — expands when Car is selected */}
                  {delivMode === "car" && (
                    <div className="ml-4 pl-3 border-l-2 border-amber-300 space-y-1.5 py-1">
                      <p className="text-xs text-muted-foreground mb-2">Pick your delivery area so we can look up the fee before calling you.</p>
                      {CAR_ZONES.map((zone) => {
                        const sel = carZone === zone.id;
                        const [tierPart, areaPart] = zone.label.split(" — ");
                        return (
                          <button key={zone.id} type="button" onClick={() => setCarZone(zone.id)}
                            className={["w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all",
                              sel ? "border-amber-500 bg-amber-50" : "border-border hover:border-amber-400/50"].join(" ")}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={["w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center",
                                sel ? "border-amber-500 bg-amber-500" : "border-muted-foreground/30"].join(" ")}>
                                {sel && <Check className="w-2 h-2 text-white" />}
                              </span>
                              <span className="text-xs leading-snug min-w-0">
                                <span className="font-semibold">{tierPart}</span>
                                <span className="text-muted-foreground"> — {areaPart}</span>
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
                              Contact Us
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Own Arrangement */}
                  <button type="button" onClick={() => { setDelivMode("own"); setCarZone(""); }}
                    className={[
                      "w-full flex items-center gap-3 py-3 px-4 rounded-xl text-left text-sm border-2 transition-all",
                      delivMode === "own"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40",
                    ].join(" ")}>
                    <span className={["w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                      delivMode === "own" ? "border-primary bg-primary" : "border-muted-foreground/30"].join(" ")}>
                      {delivMode === "own" && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span>
                      <span className="font-bold block">My Own Arrangement</span>
                      <span className="text-xs text-muted-foreground">I'll collect or arrange my own delivery — no delivery fee</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* ── Totals ── */}
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
                  <span className="text-primary font-semibold">Complimentary</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Packaging ({packaging === "branded" ? "Branded Pack" : "Nylon Bag"})</span>
                  <span className={packaging === "nylon" ? "font-semibold text-primary" : "font-semibold"}>
                    {packaging === "nylon" ? "Complimentary" : fmt(BRANDED_COST)}
                  </span>
                </div>
                {delivMode === "car" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold text-amber-700 text-xs">Call office for pricing</span>
                  </div>
                )}
                {delivMode === "own" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold text-primary text-xs">No fee — own arrangement</span>
                  </div>
                )}
                {!delivMode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-xs text-muted-foreground italic">Select option above →</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border text-base font-bold">
                  <span>Total {delivMode === "car" ? <span className="text-xs font-normal text-muted-foreground">(excl. delivery)</span> : ""}</span>
                  <span className="text-primary">{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Order button */}
              {!canOrder ? (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mt-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {!customerReady
                      ? "Fill in your name, phone, and delivery address above to continue."
                      : !delivMode
                      ? "Select a delivery option above to continue."
                      : "Select your delivery area above to continue."}
                  </span>
                </div>
              ) : (
                <a href={buildMessage()} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 mt-1"
                  style={{ background: "#25D366" }}>
                  <MessageCircle className="w-4 h-4" />
                  Order on WhatsApp
                </a>
              )}
              <div className="flex items-center gap-1.5 justify-center text-xs text-primary mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ahmazing Cuisine · FCMB 1009414545 · payment details in message</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
