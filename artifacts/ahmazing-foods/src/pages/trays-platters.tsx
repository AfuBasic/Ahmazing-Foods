import { useState } from "react";
import { WatermarkedImage } from "@/components/ui/watermarked-image";
import { Link } from "wouter";
import { GlassWater, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";

const WA_NUMBER = "2348105506052";

// ── Constants ─────────────────────────────────────────────────────────────────

const DRINK_OPTIONS = [
  "Zobo Drink",
  "Yogurt Drink",
  "Ginger Immune Booster",
  "Turmeric Immune Booster",
  "Pineapple Ginger Drink",
  "Tiger Nut Milk",
  "Kale Cleanser",
  "Lemon Honey Cleanser",
  "Orange Juice",
  "Carrot Juice",
] as const;

const WINE_OPTIONS = ["White Wine", "Red Wine", "Non-Alcoholic Wine"] as const;
type WineOption = typeof WINE_OPTIONS[number];

type SubsectionType = "platters" | "trays" | "packages";
const REQUIRED_DRINKS: Record<SubsectionType, number> = {
  platters: 2,
  trays: 4,
  packages: 2,
};

// ── Data ──────────────────────────────────────────────────────────────────────

interface Item {
  name: string;
  size?: string;
  price: string;
  contains: string;
  img?: string;
  requiredDrinks?: number;   // overrides section default; 0 = no drink picker
  fixedDrinks?: string[];    // Premium tier: fixed drinks list, no picker
}

interface Subsection {
  type: SubsectionType;
  heading: string;
  sub: string;
  items: Item[];
}

const SUBSECTIONS: Subsection[] = [
  {
    type: "trays",
    heading: "Trays",
    sub: "Curated gift trays for a single person or as a special gesture. Choose exactly 4 complimentary drinks — no wine.",
    items: [
      {
        name: "Classic Tray",
        price: "₦120,000",
        contains: "Fruit salad, coleslaw, peppered fried fish (2 pcs), jollof rice, chocolates, water (1 bottle)",
        img: "/assets/trays/classic-tray.jpg",
      },
      {
        name: "Deluxe Tray",
        price: "₦145,000",
        contains: "Fruit salad, coleslaw, jollof rice, small chops, 2 peppered chicken thighs, Pringles & chocolates, biscuits, water (1 bottle)",
        img: "/assets/trays/deluxe-tray.jpg",
      },
      {
        name: "Grand Tray",
        price: "₦170,000",
        contains: "Coleslaw, fruit salad, 10″ cake, jollof rice, fried rice, fried plantain, half peppered chicken, water (2 bottles)",
        img: "/assets/trays/grand-tray.jpg",
      },
      {
        name: "Ultimate Tray",
        price: "₦190,000",
        contains: "Coleslaw, fruit salad, 10″ cake, jollof rice, fried rice, spaghetti, small chops, chocolate/chips/biscuits, half peppered chicken, pancakes, water (2 bottles)",
        img: "/assets/trays/ultimate-tray.jpg",
      },
    ],
  },
  {
    type: "packages",
    heading: "Packages",
    sub: "Small chops packs — perfect for a party table. Starter and Mini are standalone. Full includes 2 complimentary drinks of your choice. Premium comes with 7 curated drinks included. No wine on any tier.",
    items: [
      {
        name: "Small Chops — Starter",
        price: "₦18,000",
        contains: "10 samosas, 10 spring rolls, 30 puff puff, 20 mosa, 5 peppered beef bites, 5 peppered gizzard, 5 sausages, 5 mini corn dogs",
        img: "/assets/small-chops/starter.png",
        requiredDrinks: 0,
      },
      {
        name: "Small Chops — Mini",
        price: "₦30,000",
        contains: "30 samosas, 30 spring rolls, 80 puff puff, 40 mosa, 50 peppered beef bites",
        img: "/assets/small-chops/mini.png",
        requiredDrinks: 0,
      },
      {
        name: "Small Chops — Full",
        price: "₦55,000",
        contains: "45 samosas, 40 spring rolls, 5 spring rolls with prawns & mayo, 80 puff puff, 30 mosa, 40 peppered beef bites, 10 peppered chicken, 15 peppered gizzard, 5 grilled snail, 5 sausages, 5 mini corn dogs",
        img: "/assets/small-chops/full.png",
        requiredDrinks: 2,
      },
      {
        name: "Small Chops — Premium",
        price: "₦150,000",
        contains: "60 samosas, 50 spring rolls, 10 spring rolls with prawns & mayo, 60 puff puff, 20 peppered beef bites, 20 peppered chicken, 10 peppered turkey, 15 peppered gizzard, 10 grilled snail, 8 sausages, 10 mini corn dogs",
        img: "/assets/small-chops/premium.png",
        requiredDrinks: 0,
        fixedDrinks: [
          "Carrot Juice",
          "Zobo Drink",
          "Yogurt Drink",
          "Pineapple Ginger Drink",
          "Ginger Immune Booster",
          "Pure Still Water (×2)",
        ],
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function cardKey(item: Item) {
  return `${item.name}___${item.size ?? ""}`;
}

function buildWaMessage(item: Item, type: SubsectionType, wine: WineOption | "", drinks: string[]): string {
  const lines = [
    "Hi! I'd like to order:",
    "",
    `🎉 ${item.name}${item.size ? ` (${item.size})` : ""} — ${item.price}`,
    `📋 Contains: ${item.contains}`,
  ];
  if (type === "platters" && wine) lines.push(`🍷 Wine choice: ${wine}`);
  if (item.fixedDrinks && item.fixedDrinks.length > 0) {
    lines.push("", `🥤 Included drinks (${item.fixedDrinks.length}):`, ...item.fixedDrinks.map((d) => `  • ${d}`));
  } else if (drinks.length > 0) {
    lines.push("", `🥤 Free drinks (${drinks.length}):`, ...drinks.map((d) => `  • ${d}`));
  }
  lines.push(
    "",
    "💳 Payment details:",
    "Account Name: Ahmazing Cuisine",
    "Bank: FCMB",
    "Account Number: 1009414545",
    "",
    "Please confirm my order and share delivery / pickup details. Thank you!"
  );
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface CardProps {
  item: Item;
  type: SubsectionType;
  wine: WineOption | "";
  drinks: string[];
  onWineChange: (w: WineOption | "") => void;
  onDrinkToggle: (d: string) => void;
}

function TrayCard({ item, type, wine, drinks, onWineChange, onDrinkToggle }: CardProps) {
  const required = item.requiredDrinks !== undefined ? item.requiredDrinks : REQUIRED_DRINKS[type];
  const wineOk = type !== "platters" || wine !== "";
  const drinksOk = drinks.length === required;
  const ready = wineOk && drinksOk;

  const missing: string[] = [];
  if (!wineOk) missing.push("select a wine");
  const diff = required - drinks.length;
  if (diff > 0) missing.push(`choose ${diff} more drink${diff > 1 ? "s" : ""}`);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-video bg-muted overflow-hidden">
        {item.img ? (
          <WatermarkedImage
            src={item.img}
            alt={item.name}
            imgClassName="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-xs font-medium">Photo coming soon</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div>
          <h3 className="font-display font-bold text-[16px] leading-tight">{item.name}</h3>
          {item.size && <p className="text-xs font-semibold text-primary mt-0.5">{item.size}</p>}
          <p className="text-2xl font-bold mt-1">{item.price}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <span className="font-semibold text-foreground">Contains: </span>{item.contains}
          </p>
        </div>

        {/* Wine selector (platters only) */}
        {type === "platters" && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
              Wine choice <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {WINE_OPTIONS.map((w) => (
                <button
                  key={w}
                  onClick={() => onWineChange(wine === w ? "" : w)}
                  className={[
                    "text-xs font-medium px-3 py-1.5 rounded-full border transition-all",
                    wine === w
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40",
                  ].join(" ")}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fixed drinks list — Premium tier only */}
        {item.fixedDrinks && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
              Included Drinks
            </label>
            <ul className="space-y-1.5">
              {item.fixedDrinks.map((d) => (
                <li key={d} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9E0F] shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Drink picker — Full tier (exactly 2) */}
        {!item.fixedDrinks && required > 0 && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
              Pick {required} free drink{required > 1 ? "s" : ""}{" "}
              <span className="text-destructive">*</span>
              {drinks.length > 0 && (
                <span className="ml-2 font-normal text-muted-foreground normal-case tracking-normal">
                  ({drinks.length}/{required} chosen)
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DRINK_OPTIONS.map((d) => {
                const selected = drinks.includes(d);
                const full = !selected && drinks.length >= required;
                return (
                  <button
                    key={d}
                    onClick={() => onDrinkToggle(d)}
                    disabled={full}
                    className={[
                      "text-xs px-2.5 py-1 rounded-full border transition-all",
                      selected
                        ? "bg-[#0F9E0F] text-white border-[#0F9E0F]"
                        : full
                        ? "border-border text-muted-foreground/40 cursor-not-allowed"
                        : "border-border text-muted-foreground hover:border-[#0F9E0F]/60",
                    ].join(" ")}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Validation + Order button */}
        <div className="mt-auto pt-2 border-t border-border">
          {!ready ? (
            <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Please {missing.join(" and ")} before ordering.</span>
            </div>
          ) : (
            <a
              href={buildWaMessage(item, type, wine, drinks)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              Order on WhatsApp
            </a>
          )}
          {ready && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#0F9E0F]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selections confirmed — ready to order</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TraysAndPlattersPage() {
  const [wineChoices, setWineChoices] = useState<Record<string, WineOption | "">>({});
  const [drinkSelections, setDrinkSelections] = useState<Record<string, string[]>>({});

  function getWine(item: Item): WineOption | "" {
    return wineChoices[cardKey(item)] ?? "";
  }

  function getDrinks(item: Item): string[] {
    return drinkSelections[cardKey(item)] ?? [];
  }

  function handleWineChange(item: Item, w: WineOption | "") {
    setWineChoices((prev) => ({ ...prev, [cardKey(item)]: w }));
  }

  function handleDrinkToggle(item: Item, drink: string, required: number) {
    const key = cardKey(item);
    const current = drinkSelections[key] ?? [];
    if (current.includes(drink)) {
      setDrinkSelections((prev) => ({ ...prev, [key]: current.filter((d) => d !== drink) }));
    } else if (current.length < required) {
      setDrinkSelections((prev) => ({ ...prev, [key]: [...current, drink] }));
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page header */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <GlassWater className="w-5 h-5 opacity-60" />
            <span className="text-background/60 text-sm font-medium uppercase tracking-wider">Trays & Platters</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Trays &amp;<br />Platters
          </h1>
          <p className="text-xl text-background/75 max-w-2xl leading-relaxed">
            For gifting, celebrations and gatherings — sized between a single meal and a fully catered event.
            Every item includes complimentary drinks.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="container mx-auto px-4 md:px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Pick your item", body: "Browse Platters, Trays, or Packages below." },
            { step: "2", title: "Pick your free drinks", body: "Choose your complimentary drinks from the list — the Order button unlocks once your selection is complete." },
            { step: "3", title: "Order on WhatsApp", body: "Your complete order details are pre-filled — just hit send to confirm with us." },
          ].map(({ step, title, body }) => (
            <div key={step} className="rounded-2xl bg-muted/50 border border-border px-5 py-4 flex gap-4">
              <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-sm shrink-0">
                {step}
              </div>
              <div>
                <p className="font-bold text-sm mb-1">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subsections */}
      <div className="container mx-auto px-4 md:px-6 space-y-20">
        {SUBSECTIONS.map((section) => (
          <section key={section.heading}>
            <div className="mb-10">
              <h2 className="text-3xl font-bold font-display mb-2">{section.heading}</h2>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">{section.sub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {section.items.map((item) => (
                <TrayCard
                  key={cardKey(item)}
                  item={item}
                  type={section.type}
                  wine={getWine(item)}
                  drinks={getDrinks(item)}
                  onWineChange={(w) => handleWineChange(item, w)}
                  onDrinkToggle={(d) => handleDrinkToggle(item, d, item.requiredDrinks !== undefined ? item.requiredDrinks : REQUIRED_DRINKS[section.type])}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-muted border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Need a full catered event?</h3>
            <p className="text-muted-foreground">Our catering service covers everything from setup to service for larger events.</p>
          </div>
          <Link
            href="/catering#catering-form"
            className="shrink-0 rounded-full px-8 py-3 font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: "#0F9E0F" }}
          >
            View Catering
          </Link>
        </div>
      </div>
    </div>
  );
}
