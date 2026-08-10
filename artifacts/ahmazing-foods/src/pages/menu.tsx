import { useLocation, Link } from "wouter";
import { useListMenuItems, ListMenuItemsCategory } from "@workspace/api-client-react";
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
      {/* Dark brown header banner */}
      <div className="bg-[#2A1810] text-white pt-12 pb-20 rounded-b-[3rem] shadow-xl mb-0">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">{titles[category as keyof typeof titles] || category}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
            {descriptions[category as keyof typeof descriptions] || "Explore our menu options below."}
          </p>
        </div>
      </div>

      {/* Banner photo */}
      {bannerImg && (
        <div className="container mx-auto px-4 md:px-6 max-w-6xl -mt-12 mb-10">
          <div className="rounded-3xl overflow-hidden shadow-2xl h-60 md:h-80 border-4 border-white">
            <img src={asset(bannerImg)} alt={titles[category as keyof typeof titles] || category} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">

        {/* ── COOLER QUOTE NOTE (soups only) ───────────────────────────── */}
        {category === "soups" && (
          <div className="mb-10 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50/90 px-6 py-4 shadow-sm">
            <MessageCircle className="w-5 h-5 mt-0.5 shrink-0 text-green-700" />
            <p className="text-sm text-green-900 leading-relaxed">
              <strong>Planning a cooler for an event?</strong> Message us on{" "}
              <a
                href="https://wa.me/2348105506052?text=Hi%2C%20I%27d%20like%20a%20quote%20for%20a%20cooler%20size%20soup%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline text-green-800 hover:text-green-950"
              >
                WhatsApp
              </a>{" "}
              with your guest count and soup choice — we'll send you an accurate quote rather than a flat listed price.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col space-y-4 bg-white p-6 rounded-3xl border border-border">
                <Skeleton className="h-56 rounded-2xl w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <h3 className="text-2xl font-bold text-destructive mb-2">Could not load menu</h3>
            <p className="text-muted-foreground">Check your connection and try again.</p>
          </div>
        ) : !menuItems?.length ? (
          <div className="text-center py-24 bg-card rounded-3xl border border-border">
            <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
            <p className="text-muted-foreground">This category is coming soon — check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {menuItems.filter(item => item.available).map((item) => {
              const rawImg = item.imageUrl || (item as any).image_url;
              return (
                <div key={item.id} className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col p-6 gap-5">
                  <div className="aspect-[16/10] bg-muted relative overflow-hidden rounded-2xl">
                    {rawImg ? (
                      <WatermarkedImage
                        src={rawImg.startsWith("/") ? rawImg : rawImg.startsWith("assets/") ? `${BASE}${rawImg}` : `/${rawImg}`}
                        alt={item.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-5xl">🍲</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 gap-3">
                    <h3 className="text-2xl font-bold font-display leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

                    {item.sizes.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          {item.sizes.length === 1 ? "Price" : "Sizes & Prices"}
                        </p>
                        <div className="space-y-2.5">
                          {item.sizes.map((size) => {
                            const isContactUs = size.price === 0;
                            return (
                              <div key={size.label} className="flex items-center justify-between gap-3 text-sm py-0.5">
                                <span className="text-foreground font-medium min-w-0 flex-1 truncate">{size.label}</span>
                                {isContactUs ? (
                                  <a
                                    href="https://wa.me/2348105506052?text=Hi%2C%20I%27d%20like%20a%20quote%20for%20a%20cooler%20size%20soup%20order"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-xs font-bold px-4 py-1.5 rounded-full text-white hover:opacity-90 transition-opacity flex items-center gap-1"
                                    style={{ background: "#0F9E0F" }}
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" /> Contact Us
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-bold text-foreground text-sm">{formatNaira(size.price)}</span>
                                    <Link
                                      href={`/book?cat=${encodeURIComponent(category)}&item=${encodeURIComponent(item.name)}&size=${encodeURIComponent(size.label)}`}
                                      className="shrink-0 text-xs font-bold px-4 py-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
                                      style={{ background: "#0F9E0F" }}
                                    >
                                      Order →
                                    </Link>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {item.proteins.length > 0 && (
                      <div className="pt-3 border-t border-border/50">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Add Protein</p>
                        <div className="grid grid-cols-2 gap-2">
                          {item.proteins.map((protein) => (
                            <div key={protein.name} className="flex items-center justify-between text-xs bg-muted/60 border border-border/40 rounded-xl px-3 py-2">
                              <span className="text-foreground font-medium truncate">{protein.name}</span>
                              <span className="font-bold text-foreground shrink-0 ml-1">+{formatNaira(protein.extraCost)}</span>
                            </div>
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
