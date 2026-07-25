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

const snackPicks = [
  { name: "Tiger Nut Milk", note: "Dairy-free, naturally sweet. A prebiotic drink that supports gut health.", href: "/products" },
  { name: "Zobo Drink (no sugar added)", note: "Hibiscus tea. Studies suggest it may support healthy blood pressure when consumed without added sugar.", href: "/products" },
  { name: "Roasted Peanuts (small handful)", note: "Healthy fats and plant protein. Satiating without spiking blood sugar.", href: "/products" },
  { name: "Fresh Pawpaw", note: "Low in sugar, rich in vitamin C and digestive enzymes. One of the most gut-friendly fruits.", href: "/products" },
  { name: "Kale Cleanser Drink", note: "Kale, cucumber and apple — a green drink with real greens in it.", href: "/products" },
  { name: "Cashew Nuts", note: "Good fats and minerals. Keep to a small handful — around 10–15 nuts — as a snack between meals.", href: "/products" },
];

const rotation = [
  { day: "Monday",    breakfast: "Oatmeal × Fresh Fruit",   lunch: "Edikang Ikong",       dinner: "Oha Soup",             snack: "Tiger Nut Milk" },
  { day: "Tuesday",   breakfast: "Moin-moin × Pap",         lunch: "Onugbu Soup",          dinner: "Ewedu × small Amala",  snack: "Zobo (no sugar)" },
  { day: "Wednesday", breakfast: "Boiled Yam × Egg Stew",   lunch: "Egusi Soup",           dinner: "Banga Soup",           snack: "Roasted Peanuts" },
  { day: "Thursday",  breakfast: "Oatmeal × Fresh Fruit",   lunch: "Edikang Ikong",        dinner: "Oha Soup",             snack: "Fresh Pawpaw" },
  { day: "Friday",    breakfast: "Moin-moin × Pap",         lunch: "Efo-Riro",             dinner: "Onugbu Soup",          snack: "Kale Cleanser" },
  { day: "Saturday",  breakfast: "Boiled Yam × Egg Stew",   lunch: "Okro Soup",            dinner: "Ewedu × small Amala",  snack: "Cashew Nuts" },
];

// ── Full 15-item à la carte menu ─────────────────────────────────────────────

const menuPool: {
  group: string;
  sub: string;
  items: { name: string; desc: string; price: string; waText: string }[];
}[] = [
  {
    group: "Breakfast",
    sub: "",
    items: [
      {
        name: "Boiled Unripe Plantain & Egg Sauce",
        desc: "Unripe plantain (lower GI than ripe) with a light pepper-and-onion egg sauce.",
        price: "₦4,500",
        waText: "Hi, I'd like to order Boiled Unripe Plantain and Egg Sauce",
      },
      {
        name: "Unsweetened Oat Pap with Roasted Groundnuts",
        desc: "Traditional pap made with oats, no added sugar, topped with roasted peanuts.",
        price: "₦3,500",
        waText: "Hi, I'd like to order Oat Pap with Roasted Groundnuts",
      },
      {
        name: "Whole Wheat Bread, Baked Akara & Cucumber",
        desc: "Whole wheat bread, lightly-oiled baked akara, fresh cucumber slices.",
        price: "₦4,000",
        waText: "Hi, I'd like to order Whole Wheat Bread with Baked Akara",
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
        price: "₦7,500",
        waText: "Hi, I'd like to order Unripe Plantain Porridge with Grilled Fish",
      },
      {
        name: "Brown Rice Jollof with Grilled Chicken & Vegetables",
        desc: "Unpolished brown rice, grilled chicken, side of steamed vegetables.",
        price: "₦8,000",
        waText: "Hi, I'd like to order Brown Rice Jollof with Grilled Chicken",
      },
      {
        name: "Beans & Vegetable Sauce",
        desc: "Beans porridge with ugu or spinach, moderate palm oil, side of unripe plantain.",
        price: "₦6,500",
        waText: "Hi, I'd like to order Beans and Vegetable Sauce",
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
        price: "₦7,500",
        waText: "Hi, I'd like to order Vegetable Soup with Small Swallow",
      },
      {
        name: "Grilled Fish with Ofada Rice & Vegetables",
        desc: "Grilled fish, modest portion of unpolished ofada rice, mixed steamed vegetables.",
        price: "₦8,500",
        waText: "Hi, I'd like to order Grilled Fish with Ofada Rice",
      },
      {
        name: "Okra Soup with Lean Protein",
        desc: "Fibre-rich okra soup, lean protein, small portion of swallow.",
        price: "₦7,500",
        waText: "Hi, I'd like to order Okra Soup with Lean Protein",
      },
    ],
  },
  {
    group: "Snacks",
    sub: "Several of these overlap with our Products page — same items, repositioned as unsweetened/unsalted.",
    items: [
      {
        name: "Roasted Peanuts (Unsalted)",
        desc: "Lightly roasted with no added salt.",
        price: "₦1,800",
        waText: "Hi, I'd like to order Unsalted Roasted Peanuts",
      },
      {
        name: "Garden Egg & Groundnut Paste",
        desc: "Fresh garden egg with a natural groundnut paste dip.",
        price: "₦2,000",
        waText: "Hi, I'd like to order Garden Egg and Groundnut Paste",
      },
      {
        name: "Cucumber & Carrot Sticks with Peanut Butter",
        desc: "Fresh-cut cucumber and carrot sticks with natural peanut butter.",
        price: "₦2,500",
        waText: "Hi, I'd like to order Cucumber and Carrot Sticks with Peanut Butter",
      },
      {
        name: "Unsweetened Zobo",
        desc: "Hibiscus drink, no added sugar.",
        price: "₦1,500",
        waText: "Hi, I'd like to order Unsweetened Zobo",
      },
      {
        name: "Tiger Nut Milk (Unsweetened)",
        desc: "Dairy-free, naturally sweet, no added sugar.",
        price: "₦2,200",
        waText: "Hi, I'd like to order Unsweetened Tiger Nut Milk",
      },
      {
        name: "Baked Plantain Chips (Unripe)",
        desc: "Unripe plantain baked, not fried, with minimal oil.",
        price: "₦1,800",
        waText: "Hi, I'd like to order Baked Unripe Plantain Chips",
      },
    ],
  },
];

export default function HealthyMealsPage() {
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
            dinner and a snack — delivered on a schedule, or ordered individually any time.
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
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_GREEN }}>Subscribe</span>
            </div>
            <h2 className="text-3xl font-bold font-display mb-3">Choose how far ahead you want to plan</h2>
            <p className="text-muted-foreground max-w-2xl">
              Every plan includes a full day's meals — breakfast, lunch, dinner and a snack — rotated for variety.
              Prices are per day; the longer you commit, the lower the daily rate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[
              { name: "Weekly",   days: 7,  perDay: "₦19,000", total: "₦133,000", saving: "~9% saved",  popular: false },
              { name: "Two-Week", days: 14, perDay: "₦17,500", total: "₦245,000", saving: "~17% saved", popular: true  },
              { name: "Monthly",  days: 28, perDay: "₦16,000", total: "₦448,000", saving: "~24% saved", popular: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 p-6 flex flex-col gap-4 ${plan.popular ? "border-primary shadow-lg" : "border-border"}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold font-display">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.days} days</p>
                </div>
                <div>
                  <span className="text-3xl font-bold">{plan.perDay}</span>
                  <span className="text-muted-foreground text-sm"> / day</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">{plan.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saving</span>
                    <span className="font-bold" style={{ color: BRAND_GREEN }}>{plan.saving}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/2348105506052?text=${encodeURIComponent(
                    `Hi, I'd like to subscribe to the Healthy Meals ${plan.name} plan.\n\nTotal: ${plan.total}\n\nPayment details:\nAccount Name: Ahmazing Cuisine\nBank: FCMB\nAccount Number: 1009414545`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto block text-center rounded-full py-2.5 font-bold text-sm transition-opacity hover:opacity-90"
                  style={plan.popular
                    ? { background: BRAND_GREEN, color: "#fff" }
                    : { background: "transparent", border: "2px solid #ddd", color: "inherit" }}
                >
                  Subscribe via WhatsApp
                </a>
              </div>
            ))}
          </div>

          {/* Single day note */}
          <p className="text-sm text-muted-foreground mb-6">
            Not ready to subscribe? A single day, no commitment, is{" "}
            <strong className="text-foreground">₦21,000</strong> — or order any individual item from the menu below.
          </p>

          {/* Advice box */}
          <div className="rounded-2xl border border-border bg-muted/50 p-5 mb-10 flex gap-4">
            <Star className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Why there's no "daily" subscription.</strong>{" "}
              A subscription's value is the discount you get for planning ahead. Ordering one day at a time
              already works with no sign-up — that's the ₦21,000 single-day option above. We start real
              subscriptions at a week, because that's the shortest commitment where pre-planning your cooking
              and delivery actually saves you anything.
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
                  <p className="font-bold mb-1">Drop 1 — Start of week</p>
                  <p className="text-muted-foreground">Days 1–3 meals delivered together, packed in labelled, fridge-safe containers.</p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <p className="font-bold mb-1">Drop 2 — Mid-week</p>
                  <p className="text-muted-foreground">Days 4–7 meals. Refrigerate on arrival, reheat before eating.</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Two-Week and Monthly plans repeat this same two-drop pattern each week throughout the subscription.
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
                    {/* placeholder — no photos for healthy meals items */}
                    <div
                      className="rounded-xl flex items-center justify-center text-muted-foreground/20 text-4xl mb-1"
                      style={{ height: 80, background: "#f5f5f5", border: "1px dashed #ddd" }}
                    >
                      🥗
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

        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-display mb-2">Snacks worth having</h2>
            <p className="text-muted-foreground">Six things that tide you over between meals without undoing the work.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snackPicks.map((s) => (
              <div key={s.name} className="bg-muted rounded-2xl p-5 flex gap-4 items-start">
                <span className="text-xl mt-0.5">🌿</span>
                <div>
                  <Link href={s.href} className="font-bold text-sm hover:underline">{s.name}</Link>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.note}</p>
                </div>
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
                    {["Day", "Breakfast", "Lunch", "Dinner", "Snack"].map((h) => (
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
                      <td className="px-4 py-3 text-muted-foreground">{row.snack}</td>
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
