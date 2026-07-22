import { useLocation, Link } from "wouter";
import { useListMenuItems, ListMenuItemsCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira } from "@/lib/format";
import { ArrowLeft } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;

const bannerImages: Record<string, string> = {
  soups:     "food-egusi-hands.jpg",
  stews:     "food-jollof-fish.jpg",
  breakfast: "food-akara-pap.jpg",
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
    breakfast: "Weekend Breakfast"
  };

  const descriptions = {
    soups: "Every soup comes garnished with dried fish, stockfish and cowhide. Add extra protein below to customise further.",
    stews: "Classic Nigerian stews cooked fresh in small batches, sized for a family meal or a full event.",
    breakfast: "Savour fresh, authentic breakfast options. Every plate is cooked to order and delivered in your chosen window."
  };

  const bannerImg = bannerImages[category];

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
            <p className="text-muted-foreground mb-6">There was a problem fetching the menu items.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : menuItems?.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-2xl border border-border">
            <h3 className="text-2xl font-bold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">Check back later for new additions to this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {menuItems?.map(item => (
              <div key={item.id} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row">
                {/* Visual Placeholder */}
                <div className="w-full sm:w-2/5 min-h-[200px] bg-muted relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                       <span className="font-display font-bold text-foreground/20 text-4xl truncate max-w-[80%]">AH</span>
                    </div>
                  )}
                  {!item.available && (
                    <div className="absolute top-4 left-4 bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Sold Out
                    </div>
                  )}
                </div>
                
                <div className="p-6 sm:p-8 w-full sm:w-3/5 flex flex-col">
                  <h3 className="text-2xl font-bold font-display mb-2 text-foreground">{item.name}</h3>
                  <p className="text-muted-foreground mb-6 flex-1 text-sm">{item.description}</p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Sizes</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.sizes.map(size => (
                          <div key={size.label} className="bg-muted px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2">
                            <span>{size.label}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-primary">{formatNaira(size.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {item.proteins && item.proteins.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Proteins</h4>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-muted-foreground">
                          {item.proteins.map((p, idx) => (
                            <span key={p.name}>
                              {p.name} <span className="text-xs opacity-70">({formatNaira(p.extraCost)})</span>
                              {idx < item.proteins.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    asChild 
                    className="w-full mt-auto rounded-xl"
                    disabled={!item.available}
                  >
                    <Link href={`/book?item=${item.id}`}>
                      {item.available ? "Book This" : "Currently Unavailable"}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}