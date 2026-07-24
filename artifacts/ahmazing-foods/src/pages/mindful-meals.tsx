import { Link } from "wouter";
import { Leaf, AlertCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;

const BRAND_GREEN = "#0F9E0F";

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
    why: "One of Nigeria's most vegetable-dense soups — packed with ugu leaves and waterleaf. Choose fish as your protein for the lightest version.",
    href: "/soups",
  },
  {
    name: "Onugbu Soup (Bitterleaf)",
    why: "Bitterleaf has long been used in traditional medicine for its detoxifying properties. A smaller swallow alongside it makes for a balanced, filling meal.",
    href: "/soups",
  },
  {
    name: "Efo-Riro",
    why: "Spinach-based and rich in iron, this Yoruba stew is lower in fat than most. Pair with a modest portion of rice or swallow.",
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
    why: "Palm fruit contains carotenoids and antioxidants. The natural oils in palm fruit are different from processed fats — this is one of our more nourishing options.",
    href: "/soups",
  },
];

const snackPicks = [
  { name: "Tiger Nut Milk", note: "Dairy-free, naturally sweet. A prebiotic drink that supports gut health.", href: "/products" },
  { name: "Zobo Drink (no sugar added)", note: "Hibiscus tea. Studies suggest it may support healthy blood pressure when consumed without added sugar.", href: "/products" },
  { name: "Roasted Peanuts (small handful)", note: "Healthy fats and plant protein. Satiating without spiking blood sugar.", href: "/products" },
  { name: "Fresh Pawpaw", note: "Low in sugar, rich in vitamin C and digestive enzymes (papain). One of the most gut-friendly fruits.", href: "/products" },
  { name: "Kale Cleanser Drink", note: "Kale, cucumber and apple — a green drink with real greens in it.", href: "/products" },
  { name: "Cashew Nuts", note: "Good fats and minerals. Keep to a small handful — around 10–15 nuts — as a snack between meals.", href: "/products" },
];

const rotation = [
  { day: "Monday",    breakfast: "Oatmeal × Fresh Fruit",      lunch: "Edikang Ikong",        dinner: "Oha Soup",                snack: "Tiger Nut Milk" },
  { day: "Tuesday",   breakfast: "Moin-moin × Pap",            lunch: "Onugbu Soup",           dinner: "Ewedu × small Amala",     snack: "Zobo (no sugar)" },
  { day: "Wednesday", breakfast: "Boiled Yam × Egg Stew",      lunch: "Egusi Soup",            dinner: "Banga Soup",              snack: "Roasted Peanuts" },
  { day: "Thursday",  breakfast: "Oatmeal × Fresh Fruit",      lunch: "Edikang Ikong",         dinner: "Oha Soup",                snack: "Fresh Pawpaw" },
  { day: "Friday",    breakfast: "Moin-moin × Pap",            lunch: "Efo-Riro",              dinner: "Onugbu Soup",             snack: "Kale Cleanser" },
  { day: "Saturday",  breakfast: "Boiled Yam × Egg Stew",      lunch: "Okro Soup",             dinner: "Ewedu × small Amala",     snack: "Cashew Nuts" },
];

export default function MindfulMealsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-5 h-5 opacity-60" />
            <span className="text-background/60 text-sm font-medium uppercase tracking-wider">Mindful Meals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Eating well<br />the Nigerian way
          </h1>
          <p className="text-xl text-background/75 max-w-2xl leading-relaxed">
            Nigerian food is not the enemy of healthy eating. These picks are drawn from our actual menu
            — real dishes, cooked the same way, chosen because they genuinely work for you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 space-y-20">

        {/* Disclaimer */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 mb-1">This is not a medical nutrition plan.</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              These are general, practical suggestions based on common nutritional principles — not prescriptions.
              If you have diabetes, hypertension, heart disease or any condition that affects your diet,
              speak to your doctor or a registered dietitian before making changes. What works for one
              person may not work for another.
            </p>
          </div>
        </div>

        {/* Breakfast Picks */}
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

        {/* Lunch Picks */}
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

        {/* Dinner Picks */}
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

        {/* Snack Picks */}
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

        {/* 6-Day Rotation */}
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
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-muted border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Ready to book a mindful meal?</h3>
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
