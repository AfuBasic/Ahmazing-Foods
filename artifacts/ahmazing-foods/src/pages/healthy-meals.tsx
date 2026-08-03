import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Leaf, AlertCircle, CalendarDays, Truck, Star, ShoppingBag } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;

const BRAND_GREEN = "#0F9E0F";

// ── Picks shown on this page (woven narrative) ────────────────────────────────

const breakfastPicks = [
  {
    name: "Moin-moin × Pap",
    why: "Made from beans, moin-moin is high in protein and fiber with a lower glycemic index than bread or eba. Pap (ogi) is gentle on the stomach and hydrating.",
    order: "The Protein Power",
    href: "/breakfast",
  },
  {
    name: "Boiled Yam × Egg Stew",
    why: "Boiled yam (not fried) releases energy more steadily than processed carbs. Egg stew adds protein to keep you full through the morning.",
    order: "The Hearty Plate",
    href: "/breakfast",
  },
  {
    name: "Oatmeal × Fresh Fruit",
    why: "Oats are one of the best slow-release breakfast options. Paired with fresh fruit instead of sugar, this is a genuinely clean start.",
    order: "The Sweet Start",
    href: "/breakfast",
  },
];

const lunchPicks = [
  {
    name: "Edikang Ikong Soup",
    why: "One of Nigeria's most vegetable-dense soups — packed with ugu leaves and waterleaf. Choose fish protein for the lightest version.",
    href: "/soups",
  },
  {
    name: "Onugbu Soup (Bitterleaf)",
    why: "Bitterleaf has long been associated with detoxifying properties. A smaller swallow alongside it makes for a well-balanced meal.",
    href: "/soups",
  },
  {
    name: "Efo-Riro",
    why: "Spinach-based and lower in fat than most. A solid daily soup choice — especially with fish.",
    href: "/soups",
  },
];

const dinnerPicks = [
  {
    name: "Oha Soup",
    why: "Lighter than Egusi, with good vegetable content from the oha leaf. A smaller swallow keeps dinner from being too heavy.",
    href: "/soups",
  },
  {
    name: "Ewedu × Amala (small portion)",
    why: "Ewedu is one of Nigeria's lowest-fat soups. Paired with a modest amount of amala and abula, this is a genuinely light but satisfying dinner.",
    href: "/soups",
  },
  {
    name: "Banga Soup",
    why: "Palm fruit contains carotenoids and antioxidants. The natural oils in palm fruit are different from processed fats — one of our more nourishing options.",
    href: "/soups",
  },
];


const rotation = [
  { day: "Day 1", breakfast: "Plantain & Egg Sauce",      lunch: "Plantain Porridge & Fish", dinner: "Vegetable Soup"           },
  { day: "Day 2", breakfast: "Oat Pap & Groundnuts",      lunch: "Brown Rice Jollof",        dinner: "Grilled Fish & Ofada Rice" },
  { day: "Day 3", breakfast: "Wheat Bread & Baked Akara", lunch: "Beans & Vegetable Sauce",  dinner: "Okra Soup"                },
  { day: "Day 4", breakfast: "Plantain & Egg Sauce",      lunch: "Brown Rice Jollof",        dinner: "Okra Soup"                },
  { day: "Day 5", breakfast: "Oat Pap & Groundnuts",      lunch: "Beans & Vegetable Sauce",  dinner: "Vegetable Soup"           },
  { day: "Day 6", breakfast: "Wheat Bread & Baked Akara", lunch: "Plantain Porridge & Fish", dinner: "Grilled Fish & Ofada Rice" },
];

// ── Full 15-item à la carte menu ─────────────────────────────────────────────

const menuPool: {
  group: string;
  sub: string;
  items: { name: string; desc: string; price: string; waText: string; img: string }[];
}[] = [
  {
    group: "Breakfast",
    sub: "",
    items: [
      {
        name: "Boiled Unripe Plantain or Yam & Egg Sauce",
        desc: "Unripe plantain or boiled yam (lower GI than ripe or fried) with a light pepper-and-onion egg sauce. Served with our mini drinks.",
        price: "₦15,750",
        waText: "Hi, I'd like to order Boiled Unripe Plantain or Yam and Egg Sauce",
        img: "healthy-meals/plantain-egg-sauce.png",
      },
      {
        name: "Unsweetened Oat Pap with Roasted Groundnuts",
        desc: "Traditional pap made with oats, no added sugar, topped with roasted peanuts. Served with our mini drinks.",
        price: "₦12,250",
        waText: "Hi, I'd like to order Oat Pap with Roasted Groundnuts",
        img: "healthy-meals/oat-pap-groundnuts.png",
      },
      {
        name: "Whole Wheat Bread, Baked Akara & Cucumber",
        desc: "Whole wheat bread, lightly-oiled baked akara, fresh cucumber slices. Served with our mini drinks.",
        price: "₦14,000",
        waText: "Hi, I'd like to order Whole Wheat Bread with Baked Akara",
        img: "healthy-meals/wheat-bread-akara.png",
      },
    ],
  },
  {
    group: "Lunch",
    sub: "",
    items: [
      {
        name: "Unripe Plantain Porridge with Grilled Fish",
        desc: "Unripe plantain, spinach or ugu, light palm oil, grilled (not fried) fish.",
        price: "₦15,000",
        waText: "Hi, I'd like to order Unripe Plantain Porridge with Grilled Fish",
        img: "healthy-meals/plantain-grilled-fish.png",
      },
      {
        name: "Brown Rice Jollof with Grilled Chicken & Vegetables",
        desc: "Unpolished brown rice, grilled chicken, side of steamed vegetables.",
        price: "₦16,000",
        waText: "Hi, I'd like to order Brown Rice Jollof with Grilled Chicken",
        img: "healthy-meals/brown-rice-jollof.png",
      },
      {
        name: "Beans & Vegetable Sauce",
        desc: "Beans porridge with ugu or spinach, moderate palm oil, side of unripe plantain.",
        price: "₦13,000",
        waText: "Hi, I'd like to order Beans and Vegetable Sauce",
        img: "healthy-meals/beans-veg-sauce.png",
      },
    ],
  },
  {
    group: "Dinner",
    sub: "",
    items: [
      {
        name: "Vegetable Soup with Small Swallow",
        desc: "Ugu/efo riro style soup, lean fish or chicken, controlled swallow portion.",
        price: "₦18,750",
        waText: "Hi, I'd like to order Vegetable Soup with Small Swallow",
        img: "healthy-meals/veg-soup-swallow.png",
      },
      {
        name: "Grilled Fish with Ofada Rice & Cucumber",
        desc: "Grilled fish, modest portion of unpolished ofada rice, fresh cucumber slices on the side.",
        price: "₦21,250",
        waText: "Hi, I'd like to order Grilled Fish with Ofada Rice",
        img: "healthy-meals/ofada-grilled-fish.png",
      },
      {
        name: "Okra Soup with Lean Protein",
        desc: "Fibre-rich okra soup, lean protein, small portion of swallow.",
        price: "₦18,750",
        waText: "Hi, I'd like to order Okra Soup with Lean Protein",
        img: "healthy-meals/okra-soup-protein.png",
      },
    ],
  },
];

// ── PLAN CONFIG ───────────────────────────────────────────────────────────────
const PLANS = {
  single:  { label: "Single Day", rate: 20000, minDays: 1, maxDays: 1  },
  weekly:  { label: "Weekly",     rate: 15000, minDays: 4, maxDays: 7  },
  twoweek: { label: "Two-Week",   rate: 14000, minDays: 7, maxDays: 14 },
  monthly: { label: "Monthly",    rate: 13500, minDays: 14, maxDays: 28 },
} as const;

type PlanKey = keyof typeof PLANS;

export default function HealthyMealsPage() {
  // ── PLAN BUILDER STATE ─────────────────────────────────────────────────────
  const [mealsPerDay, setMealsPerDay] = useState<1 | 2 | 3>(1);
  const [planKey, setPlanKey]         = useState<PlanKey>("single");
  const [daysCount, setDaysCount]     = useState(1);
  const [firstDate, setFirstDate]     = useState("");
  const [firstTime, setFirstTime]     = useState("");

  const selectedPlan = PLANS[planKey];

  // Clamp days to new plan's range when plan changes
  useEffect(() => {
    setDaysCount(PLANS[planKey].minDays);
  }, [planKey]);

  const planTotal      = selectedPlan.rate * mealsPerDay * daysCount;
  const firstDropValue = selectedPlan.rate * mealsPerDay * Math.min(3, daysCount);

  const rushInfo = useMemo(() => {
    if (!firstDate || !firstTime) return { isRush: false, blocked: false };
    const deliveryDt = new Date(`${firstDate}T${firstTime}`);
    const now        = new Date();
    const hoursOut   = (deliveryDt.getTime() - now.getTime()) / 3600000;
    if (hoursOut < 12) return { isRush: false, blocked: true };
    if (hoursOut < 24) return { isRush: true,  blocked: false };
    return { isRush: false, blocked: false };
  }, [firstDate, firstTime]);

  const rushFee   = rushInfo.isRush ? Math.min(20000, Math.round(firstDropValue * 0.5)) : 0;
  const grandTotal = planTotal + rushFee;
  const todayStr   = new Date().toISOString().split("T")[0];

  const waHref = useMemo(() => {
    const lines: string[] = [
      `Hi, I'd like to order the Healthy Meals ${selectedPlan.label} plan.`,
      ``,
      `Meals per day: ${mealsPerDay}`,
      `Plan duration: ${daysCount} day${daysCount > 1 ? "s" : ""}`,
      `Rate: ₦${selectedPlan.rate.toLocaleString()}/meal`,
      `Plan subtotal: ₦${planTotal.toLocaleString()}`,
    ];
    if (firstDate) lines.push(`First delivery: ${firstDate}${firstTime ? " at " + firstTime : ""}`);
    if (rushFee > 0) lines.push(`Rush fee (first drop only): ₦${rushFee.toLocaleString()}`);
    lines.push(`Grand total: ₦${grandTotal.toLocaleString()}`);
    lines.push("", "Payment details:", "Account Name: Ahmazing Cuisine", "Bank: FCMB", "Account Number: 1009414545");
    return `https://wa.me/2348105506052?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [selectedPlan, mealsPerDay, daysCount, planTotal, firstDate, firstTime, rushFee, grandTotal]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-5 h-5 opacity-60" />
            <span className="text-background/60 text-sm font-medium uppercase tracking-wider">Healthy Meals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Eating well<br />the Nigerian way
          </h1>
          <p className="text-xl text-background/75 max-w-2xl leading-relaxed">
            Nigerian food is not the enemy of healthy eating. A full day's meals — breakfast, lunch,
            dinner — delivered on a schedule, or ordered individually any time.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 space-y-20">

        {/* Disclaimer */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 mb-1">Please read before ordering.</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              Healthy Meals are prepared with lower sugar, lower sodium, and higher-fibre ingredients and cooking
              methods — choices commonly recommended for people managing diabetes or high blood pressure. This is a
              homemade meal service, <strong>not a medical treatment plan, prescription, or diagnosis</strong>, and
              it does not replace advice from your doctor or a registered dietitian. Please consult your healthcare
              provider before starting any new eating plan, especially if you take medication for diabetes or blood pressure.
            </p>
          </div>
        </div>

        {/* ── SUBSCRIPTION PLANS ──────────────────────────────────────────── */}
        <section id="plans">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5" style={{ color: BRAND_GREEN }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_GREEN }}>Build Your Plan</span>
            </div>
            <h2 className="text-3xl font-bold font-display mb-3">Pick your meals, pick your length</h2>
            <p className="text-muted-foreground max-w-2xl">
              Choose how many meals a day you want, then how long —
              the rate per meal drops the longer you commit.
            </p>
          </div>

          {/* ── INTERACTIVE PLAN BUILDER ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

            {/* Controls */}
            <div className="space-y-6">

              {/* Meals per day */}
              <div>
                <label className="block text-sm font-bold mb-2">Meals per day</label>
                <div className="flex gap-2">
                  {([1, 2, 3] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMealsPerDay(n)}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                        mealsPerDay === n
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                    >
                      {n} meal{n > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Mix and match meals across breakfast, lunch and dinner.</p>
              </div>

              {/* Plan length */}
              <div>
                <label className="block text-sm font-bold mb-2">Plan length</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, plan]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPlanKey(key)}
                      className={`py-3 px-4 rounded-xl text-left border-2 transition-all ${
                        planKey === key
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <div className="font-bold text-sm">{plan.label}</div>
                      <div className="text-xs font-bold mt-0.5" style={{ color: BRAND_GREEN }}>
                        ₦{plan.rate.toLocaleString()}/meal
                      </div>
                      {plan.minDays < plan.maxDays && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {plan.minDays}–{plan.maxDays} days
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Days count */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Number of days{" "}
                  {selectedPlan.minDays < selectedPlan.maxDays ? (
                    <span className="font-normal text-muted-foreground">
                      ({selectedPlan.minDays}–{selectedPlan.maxDays})
                    </span>
                  ) : (
                    <span className="font-normal text-muted-foreground">(fixed at 1)</span>
                  )}
                </label>
                <input
                  type="number"
                  value={daysCount}
                  min={selectedPlan.minDays}
                  max={selectedPlan.maxDays}
                  disabled={planKey === "single"}
                  onChange={(e) => {
                    const v = Math.min(
                      selectedPlan.maxDays,
                      Math.max(selectedPlan.minDays, parseInt(e.target.value) || selectedPlan.minDays)
                    );
                    setDaysCount(v);
                  }}
                  className="w-full h-11 rounded-xl border-2 border-border px-4 font-bold text-base focus:border-primary focus:outline-none disabled:opacity-50 disabled:bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Rate per meal is the same for any number of days within a plan — only the total changes.
                </p>
              </div>

              {/* First delivery */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  First delivery date & time <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={firstDate}
                    min={todayStr}
                    onChange={(e) => setFirstDate(e.target.value)}
                    className="h-11 rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none text-sm w-full"
                  />
                  <input
                    type="time"
                    value={firstTime}
                    min="09:00"
                    max="21:00"
                    onChange={(e) => setFirstTime(e.target.value)}
                    className="h-11 rounded-xl border-2 border-border px-3 focus:border-primary focus:outline-none text-sm w-full"
                  />
                </div>
                {rushInfo.blocked && (
                  <p className="text-xs font-bold text-red-600 mt-1.5">
                    ⚠ Less than 12 hours' notice — please choose a later time or date.
                  </p>
                )}
                {rushInfo.isRush && (
                  <p className="text-xs font-bold mt-1.5" style={{ color: "#D9A441" }}>
                    Rush fee applies to first drop (12–24 hrs notice): ₦{rushFee.toLocaleString()}
                    {rushFee < 20000 ? " (capped at 50% of first-drop value)" : " flat"}.
                    Rest of plan unaffected.
                  </p>
                )}
                {!rushInfo.blocked && !rushInfo.isRush && firstDate && firstTime && (
                  <p className="text-xs text-emerald-700 font-medium mt-1.5">✓ No rush fee — more than 24 hours' notice.</p>
                )}
              </div>
            </div>

            {/* Summary ticket + CTA */}
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Your Plan</span>
                  <span>{selectedPlan.label}</span>
                </div>
                <div className="space-y-2.5 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate per meal</span>
                    <span className="font-bold">₦{selectedPlan.rate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>
                      {mealsPerDay} meal{mealsPerDay > 1 ? "s" : ""}/day × {daysCount} day{daysCount > 1 ? "s" : ""}
                    </span>
                    <span className="font-medium text-foreground">₦{planTotal.toLocaleString()}</span>
                  </div>
                  {rushFee > 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Rush fee (first drop only)</span>
                      <span className="font-bold">₦{rushFee.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-border">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-2xl" style={{ color: BRAND_GREEN }}>
                    ₦{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center w-full py-3.5 rounded-2xl font-bold text-base text-white transition-opacity hover:opacity-90 ${rushInfo.blocked ? "opacity-40 pointer-events-none" : ""}`}
                style={{ background: BRAND_GREEN }}
              >
                Order This Plan via WhatsApp
              </a>
              <p className="text-xs text-muted-foreground text-center">
                Sends your plan details and bank transfer info straight to WhatsApp to confirm your order.
              </p>
            </div>
          </div>

          {/* Advice box */}
          <div className="rounded-2xl border border-border bg-muted/50 p-5 mb-10 flex gap-4">
            <Star className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Why the rate drops with commitment — and why there's a minimum.</strong>{" "}
              A single day is a no-commitment, one-off order. Weekly, Two-Week, and Monthly rates are lower because
              we're planning and cooking in bulk — the longer you commit, the more that saves us, and we pass it back.
              Each plan has a minimum (Weekly: 4 days, Two-Week: 7 days, Monthly: 14 days) so the discount stays tied
              to genuine bulk planning, not just a lower price on a small order.
              Rush fee — if your first delivery is within 24 hours — applies to the first drop only.
              The rest of your plan runs at the normal rate.
            </div>
          </div>

          {/* Delivery logistics */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#0F9E0F22" }}>
              <Truck className="w-5 h-5" style={{ color: BRAND_GREEN }} />
            </div>
            <div>
              <h4 className="font-bold font-display text-lg mb-2">How delivery works</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                A full week of food in one delivery isn't realistic for freshness — so every plan delivers in
                <strong className="text-foreground"> two drops per week</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted p-4">
                  <p className="font-bold mb-1">Drop 1 — Days 1 to 3</p>
                  <p className="text-muted-foreground">Delivered at the start of your plan, portioned and labelled by meal and day, ready to refrigerate.</p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <p className="font-bold mb-1">Drop 2 — Days 4 to 7</p>
                  <p className="text-muted-foreground">Delivered mid-week so nothing sits in your fridge longer than a few days before you eat it.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Two-Week and Monthly plans repeat this same two-drop pattern each week throughout the subscription.
                Meals arrive in fridge-safe, labelled containers — refrigerate on arrival, reheat before eating.
              </p>
            </div>
          </div>
        </section>

        {/* ── 15-ITEM MENU POOL ───────────────────────────────────────────── */}
        <section id="pool">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="w-5 h-5" style={{ color: BRAND_GREEN }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_GREEN }}>What's in a Healthy Day</span>
            </div>
            <h2 className="text-3xl font-bold font-display mb-3">The fifteen dishes your plan rotates through</h2>
            <p className="text-muted-foreground max-w-2xl">
              Every subscription pulls from this menu — no two days repeat unnecessarily. Prefer to skip the subscription?
              Order any single item below on its own.
            </p>
          </div>

          {menuPool.map((group) => (
            <div key={group.group} className="mb-12">
              <h3 className="text-2xl font-bold font-display mb-1">{group.group}</h3>
              {group.sub && <p className="text-sm text-muted-foreground mb-4">{group.sub}</p>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-3"
                  >
                    <div className="rounded-xl overflow-hidden mb-1" style={{ height: 80 }}>
                      {item.img ? (
                        <img
                          src={asset(item.img)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-4xl"
                          style={{ background: "#f5f5f5", border: "1px dashed #ddd" }}
                        >
                          🥗
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold font-display leading-tight">{item.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.desc}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-border">
                      <span className="font-bold text-lg">{item.price}</span>
                      <a
                        href={`https://wa.me/2348105506052?text=${encodeURIComponent(item.waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold px-4 py-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
                        style={{ background: BRAND_GREEN }}
                      >
                        Order
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── HEALTHY PICKS ───────────────────────────────────────────────── */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display mb-2">Breakfast picks</h2>
            <p className="text-muted-foreground">A good morning starts before you're hungry. These fill you up without the crash.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {breakfastPicks.map((p) => (
              <div key={p.name} className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#0F9E0F22" }}>
                  <Leaf className="w-5 h-5" style={{ color: BRAND_GREEN }} />
                </div>
                <h3 className="font-display font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.why}</p>
                <Link href={p.href} className="text-sm font-bold hover:underline" style={{ color: BRAND_GREEN }}>
                  Order {p.order} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display mb-2">Lunch picks</h2>
            <p className="text-muted-foreground">The midday meal matters. These keep energy steady without the afternoon slump.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lunchPicks.map((p) => (
              <div key={p.name} className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#0F9E0F22" }}>
                  <Leaf className="w-5 h-5" style={{ color: BRAND_GREEN }} />
                </div>
                <h3 className="font-display font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.why}</p>
                <Link href={p.href} className="text-sm font-bold hover:underline" style={{ color: BRAND_GREEN }}>
                  See soups →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display mb-2">Dinner picks</h2>
            <p className="text-muted-foreground">Lighter in the evening — your body processes food differently at night.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dinnerPicks.map((p) => (
              <div key={p.name} className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#0F9E0F22" }}>
                  <Leaf className="w-5 h-5" style={{ color: BRAND_GREEN }} />
                </div>
                <h3 className="font-display font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.why}</p>
                <Link href={p.href} className="text-sm font-bold hover:underline" style={{ color: BRAND_GREEN }}>
                  See soups →
                </Link>
              </div>
            ))}
          </div>
        </section>


        {/* ── 6-DAY ROTATION TABLE ────────────────────────────────────────── */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display mb-2">A 6-day sample rotation</h2>
            <p className="text-muted-foreground">
              A practical week of eating — drawn entirely from what we actually cook.
              This is a starting point, not a rigid plan. Adjust portions to your own body and lifestyle.
            </p>
          </div>
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-foreground text-background">
                  <tr>
                    {["Day", "Breakfast", "Lunch", "Dinner"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rotation.map((row, i) => (
                    <tr key={row.day} className={i % 2 === 0 ? "bg-background" : "bg-muted/40"}>
                      <td className="px-4 py-3 font-bold">{row.day}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.breakfast}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.lunch}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.dinner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Swallow portions: keep to a fist-size or less per meal. Protein: where soups allow, choose fish over red meat most days.
          </p>
          <div className="mt-6 text-center">
            <a href="#plans" className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-bold text-white hover:opacity-90 transition-opacity" style={{ background: BRAND_GREEN }}>
              See Subscription Plans ↑
            </a>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-muted border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Ready to book a healthy meal?</h3>
            <p className="text-muted-foreground">Every pot is cooked fresh once you book. No shortcuts, no MSG.</p>
          </div>
          <Link
            href="/book"
            className="shrink-0 rounded-full px-8 py-3 font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: BRAND_GREEN }}
          >
            Book Your Meal
          </Link>
        </div>

      </div>
    </div>
  );
}
