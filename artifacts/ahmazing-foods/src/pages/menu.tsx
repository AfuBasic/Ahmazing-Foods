import { useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useListMenuItems, ListMenuItemsCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import { ArrowLeft, Leaf, MessageCircle } from "lucide-react";
import { WatermarkedImage } from "@/components/ui/watermarked-image";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;
const BRAND_GREEN = "#0F9E0F";

const bannerImages: Record<string, string> = {
  soups:     "food-egusi-hands.jpg",
  stews:     "stews/classic-tomato-stew.webp",
  breakfast: "food-akara-pap.jpg",
};

const FALLBACK_BREAKFAST_ITEMS = [
  {
    id: 101,
    category: "breakfast",
    name: "Classic Nigerian",
    description: "Serves 2–3. Akara, pap, boiled eggs, fried plantain, and more.",
    sizes: [{ label: "Standard Portion", price: 22000 }],
    proteins: [],
    available: true,
    imageUrl: "assets/breakfast/classic-nigerian.png",
  },
  {
    id: 102,
    category: "breakfast",
    name: "Hearty Plate",
    description: "Serves 2–3. Yam, plantain, egg stew, sausages, side salad, and more.",
    sizes: [{ label: "Standard Portion", price: 22000 }],
    proteins: [],
    available: true,
    imageUrl: "assets/breakfast/hearty-plate.png",
  },
  {
    id: 103,
    category: "breakfast",
    name: "Sweet Start",
    description: "Serves 2–3. Oats, fresh fruit bowl, boiled egg, and more.",
    sizes: [{ label: "Standard Portion", price: 25000 }],
    proteins: [],
    available: true,
    imageUrl: "assets/breakfast/sweet-start.png",
  },
  {
    id: 104,
    category: "breakfast",
    name: "Protein Power",
    description: "Serves 2–3. Moin-moin, akara, pap, boiled eggs, fried plantain, and more.",
    sizes: [{ label: "Standard Portion", price: 25000 }],
    proteins: [],
    available: true,
    imageUrl: "assets/breakfast/protein-power.png",
  },
];

const healthyPicks: Record<string, Array<{ name: string; why: string }>> = {
  soups: [
    { name: "Edikang Ikong (Vegetable Soup)", why: "Nigeria's most vegetable-dense soup — loaded with ugu and waterleaf. Ask us to reduce the oil and use fish protein for the lightest version." },
    { name: "Okro Soup",                       why: "High-fibre and filling, with a natural thickening that means less oil is needed. Pairs especially well with fish or any lean protein." },
    { name: "Oha Soup",                         why: "Traditional, leafy, and relatively light on oil. A smart everyday choice — particularly good with smaller swallow portions." },
  ],
  stews: [
    { name: "Classic Tomato Stew",      why: "Tomato-based with most of the flavour from fresh peppers. Ask for a lighter-oil version — it's still full of flavour and one of the best everyday options." },
    { name: "Ayamase (Ofada Stew)",     why: "Rich in green tatashe peppers, which are high in vitamin C and antioxidants. Available in a lighter, reduced-oil version on request." },
    { name: "Peppered Chicken Stew",    why: "Leaner protein than red meat — ask us to prepare with less oil for a lighter, high-protein option that still carries the full pepper flavour." },
  ],
  breakfast: [
    { name: "Classic Nigerian",  why: "Akara is a high-protein bean cake, and pap (ogi) is gentle on digestion. Grilled shrimp and smoked fish add lean protein without heavy oil — a filling, balanced Lagos morning." },
    { name: "Sweet Start",       why: "Oats release energy slowly; the fruit bowl delivers natural sugars, fibre and antioxidants without a crash. Greek yogurt adds gut-friendly probiotics — genuinely one of the cleanest options on the menu." },
    { name: "Protein Power",     why: "Turkey bacon, eggs, chicken sausages and baked beans together cover all essential amino acids. Whole wheat bread and roasted potatoes add complex carbs for sustained energy — ideal before a full day." },
  ],
};

export default function MenuPage() {
  const [location] = useLocation();
  
  // Extract category from location (e.g. "/soups" -> "soups")
  const path = location.replace('/', '');
  const category = path as ListMenuItemsCategory;

  const { data: menuItems, isLoading, error } = useListMenuItems(
    { category },
    { query: { queryKey: ["menuItems", category] } }
  );

  const displayItems = useMemo(() => {
    if (menuItems && menuItems.length > 0) return menuItems;
    if (category === "breakfast") return FALLBACK_BREAKFAST_ITEMS;
    return menuItems ?? [];
  }, [menuItems, category]);

  const titles = {
    soups: "Rich Soups",
    stews: "Hearty Stews",
    breakfast: "Breakfast Combos",
  };

  const descriptions = {
    soups: "Every soup comes garnished with dried fish, stockfish and cowhide. Add extra protein below to customise further.",
    stews: "Classic Nigerian stews cooked fresh in small batches. 3 Litres (Medium), 5 Litres (Large), or Extra Large for bigger gatherings.",
    breakfast: "Generously-portioned combo plates — sized so one pack is a proper sit-down meal. Cooked fresh to order.",
  };

  const bannerImg = bannerImages[category];
  const picks = healthyPicks[category] ?? [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-0">
        <div className="container mx-auto px-4 md:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-background/70 hover:text-background mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">{titles[category as keyof typeof titles] || category}</h1>
          <p className="text-xl text-background/80 max-w-2xl leading-relaxed">
            {descriptions[category as keyof typeof descriptions] || "Explore our menu options below."}
          </p>
        </div>
      </div>

      {/* Banner photo */}
      {bannerImg && (
        <div className="container mx-auto px-4 md:px-6 -mt-12 mb-12">
          <div className="rounded-2xl overflow-hidden shadow-xl h-56 md:h-72">
            <img src={asset(bannerImg)} alt={titles[category as keyof typeof titles] || category} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6">

        {/* ── COOLER QUOTE NOTE (soups only) ───────────────────────────── */}
        {category === "soups" && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
            <MessageCircle className="w-5 h-5 mt-0.5 shrink-0 text-green-700" />
            <p className="text-sm text-green-900 leading-relaxed">
              <strong>Planning a cooler for an event?</strong> Message us on{" "}
              <a
                href="https://wa.me/2348105506052?text=Hi%2C%20I%27d%20like%20a%20quote%20for%20a%20cooler%20size%20soup%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                WhatsApp
              </a>{" "}
              with your guest count and soup choice — we'll send you an accurate quote rather than a flat listed price.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col space-y-4">
                <Skeleton className="h-64 rounded-2xl w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border">
            <h3 className="text-2xl font-bold text-destructive mb-2">Could not load menu</h3>
            <p className="text-muted-foreground">Check your connection and try again.</p>
          </div>
        ) : !displayItems.length ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
            <p className="text-muted-foreground">This category is coming soon — check back shortly.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${category === "breakfast" ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"} gap-8`}>
            {displayItems.filter(item => item.available).map((item, idx) => {
              if (category === "breakfast") {
                const priceVal = item.sizes[0]?.price ?? 22000;
                const sizeLabel = item.sizes[0]?.label ?? "Standard Portion";

                return (
                  <div key={item.id} className="bg-card rounded-3xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      {/* Top-left combo badge */}
                      <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border/50 rounded-xl px-3 py-1.5 shadow-md flex flex-col">
                        <span className="font-bold text-xs uppercase text-foreground">{idx + 1}. {item.name}</span>
                        <span className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">BREAKFAST COMBO</span>
                      </div>

                      {/* Red tag overlay badge */}
                      <div className="absolute top-4 right-4 z-10 bg-[#C81212] text-white font-bold text-xs px-3 py-1 rounded-full shadow-md tracking-tight">
                        {formatNaira(priceVal)}
                      </div>

                      {item.imageUrl ? (
                        <WatermarkedImage
                          src={item.imageUrl.startsWith("assets/") ? `${BASE}${item.imageUrl}` : item.imageUrl}
                          alt={item.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-6xl">🥞</div>
                      )}
                    </div>

                    <div className="p-6 md:p-8 flex flex-col flex-1 gap-3">
                      <h3 className="text-2xl font-bold font-display leading-tight text-foreground">{item.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>

                      <div className="mt-4 pt-4 border-t border-border/70 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">PRICE</p>
                          <p className="text-xl font-bold text-foreground">{formatNaira(priceVal)}</p>
                        </div>
                        <Link
                          href={`/book?cat=breakfast&item=${encodeURIComponent(item.name)}&size=${encodeURIComponent(sizeLabel)}`}
                          className="rounded-full px-6 py-2.5 font-bold text-white text-sm shadow-md hover:shadow-lg transition-all hover:opacity-90 flex items-center gap-1"
                          style={{ background: BRAND_GREEN }}
                        >
                          Book →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {item.imageUrl ? (
                      <WatermarkedImage
                        src={item.imageUrl.startsWith("assets/") ? `${BASE}${item.imageUrl}` : item.imageUrl}
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-5xl">🍲</div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1 gap-3">
                    <h3 className="text-xl font-bold font-display leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

                    {item.sizes.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          {item.sizes.length === 1 ? "Price" : "Sizes & Prices"}
                        </p>
                        <div className="space-y-2">
                          {item.sizes.map((size) => {
                            const isContactUs = size.price === 0;
                            return (
                              <div key={size.label} className="flex items-center justify-between gap-2 text-sm">
                                {item.sizes.length > 1 && (
                                  <span className="text-foreground min-w-0 flex-1 truncate">{size.label}</span>
                                )}
                                {isContactUs ? (
                                  <a
                                    href="https://wa.me/2348105506052?text=Hi%2C%20I%27d%20like%20a%20quote%20for%20a%20cooler%20size%20soup%20order"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full text-white hover:opacity-90 transition-opacity flex items-center gap-1"
                                    style={{ background: "#25D366" }}
                                  >
                                    <MessageCircle className="w-3 h-3" /> Contact Us
                                  </a>
                                ) : (
                                  <>
                                    <span className="font-bold shrink-0">{formatNaira(size.price)}</span>
                                    <Link
                                      href={`/book?cat=${encodeURIComponent(category)}&item=${encodeURIComponent(item.name)}&size=${encodeURIComponent(size.label)}`}
                                      className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
                                      style={{ background: "#0F9E0F" }}
                                    >
                                      Book →
                                    </Link>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {item.proteins.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Add Protein</p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.proteins.map((protein) => (
                            <span key={protein.name} className="inline-flex items-center text-xs bg-muted rounded-full px-2.5 py-1 gap-1">
                              {protein.name}
                              <span className="font-bold text-foreground">+{formatNaira(protein.extraCost)}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── HEALTHY PICKS SECTION ───────────────────────────────────── */}
        {picks.length > 0 && (
          <section className="mt-20 pt-16 border-t border-border">
            <div className="flex items-start justify-between gap-6 mb-10 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5" style={{ color: BRAND_GREEN }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BRAND_GREEN }}>Healthy Picks</span>
                </div>
                <h2 className="text-3xl font-bold font-display mb-2">The healthier choices on this menu</h2>
                <p className="text-muted-foreground max-w-xl">
                  Not a diet plan — just specific dishes from this category that are nutritionally worth knowing about.
                </p>
              </div>
              <Link
                href="/healthy-meals"
                className="shrink-0 rounded-full px-6 py-2.5 font-bold text-white text-sm hover:opacity-90 transition-opacity"
                style={{ background: BRAND_GREEN }}
              >
                Full Healthy Meals Guide →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {picks.map((pick) => (
                <div
                  key={pick.name}
                  className="rounded-2xl border-2 p-5 flex flex-col gap-3"
                  style={{ borderColor: BRAND_GREEN + "40", background: BRAND_GREEN + "08" }}
                >
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 shrink-0" style={{ color: BRAND_GREEN }} />
                    <span className="font-bold text-sm leading-tight">{pick.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pick.why}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
