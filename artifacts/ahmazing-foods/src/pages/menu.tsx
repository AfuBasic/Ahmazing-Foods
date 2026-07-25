import { useLocation, Link } from "wouter";
import { useListMenuItems, ListMenuItemsCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import { ArrowLeft, Leaf } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;
const BRAND_GREEN = "#0F9E0F";

const bannerImages: Record<string, string> = {
  soups:     "food-egusi-hands.jpg",
  stews:     "food-jollof-fish.jpg",
  breakfast: "food-akara-pap.jpg",
};

const healthyPicks: Record<string, Array<{ name: string; why: string }>> = {
  soups: [
    { name: "Edikang Ikong (Vegetable Soup)", why: "One of Nigeria's most vegetable-dense soups — loaded with ugu and waterleaf. Choose fish protein for the lightest version." },
    { name: "Onugbu Soup (Bitterleaf)",        why: "Bitterleaf has long been associated with detoxifying properties. Pair with a smaller portion of swallow for a well-balanced meal." },
    { name: "Efo-Riro",                         why: "Spinach-based and lower in fat than most. A solid daily soup choice — especially with fish." },
  ],
  stews: [
    { name: "Peppered Chicken Stew",  why: "Chicken is leaner than beef. A good everyday protein choice in a well-spiced base." },
    { name: "Peppered Turkey Stew",   why: "Turkey is one of the leanest proteins available. The pepper-based stew adds flavour without extra fat." },
    { name: "Ata Din-Din (Fried Pepper Stew)", why: "Rich in pepper, which is high in vitamin C and antioxidants. Bold flavour with a clean base." },
  ],
  breakfast: [
    { name: "The Classic Nigerian",  why: "Akara is made from beans — high protein, high fiber, lower glycemic index than most breakfast carbs." },
    { name: "The Sweet Start",       why: "Oats + fresh fruit: slow-release energy and natural sugars only. One of the most considered breakfast options available." },
    { name: "The Hearty Plate",      why: "Boiled yam (not fried) with egg stew: fills you up steadily and adds good protein from the eggs." },
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
    stews: "Classic Nigerian stews cooked fresh in small batches, sized for a family meal or a full event.",
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
        ) : !menuItems?.length ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border">
            <h3 className="text-2xl font-bold mb-2">Nothing here yet</h3>
            <p className="text-muted-foreground">This category is coming soon — check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.filter(item => item.available).map((item) => (
              <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl.startsWith("assets/") ? `${BASE}${item.imageUrl}` : item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
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
                        {item.sizes.map((size) => (
                          <div key={size.label} className="flex items-center justify-between gap-2 text-sm">
                            {item.sizes.length > 1 && (
                              <span className="text-foreground min-w-0 flex-1 truncate">{size.label}</span>
                            )}
                            <span className="font-bold shrink-0">{formatNaira(size.price)}</span>
                            <Link
                              href={`/book?cat=${encodeURIComponent(category)}&item=${encodeURIComponent(item.name)}&size=${encodeURIComponent(size.label)}`}
                              className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
                              style={{ background: "#0F9E0F" }}
                            >
                              Book →
                            </Link>
                          </div>
                        ))}
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
            ))}
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
