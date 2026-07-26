import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;

interface Product {
  name: string;
  size: string;
  price: string;
  img: string;
}

const groups: { heading: string; sub: string; products: Product[] }[] = [
  {
    heading: "Seeds & Spices",
    sub: "Ground and whole spices — no fillers, no additives.",
    products: [
      { name: "Chili Pepper",    size: "Ground · 100g",  price: "₦2,000", img: "" },
      { name: "Cameroon Pepper", size: "Ground · 100g",  price: "₦2,500", img: "" },
      { name: "Soya Mix",        size: "200g",            price: "₦2,500", img: "" },
      { name: "Cinnamon Powder", size: "100g",            price: "₦2,000", img: "" },
      { name: "Chia Seeds",      size: "150g",            price: "₦3,500", img: "" },
      { name: "Melon Seed",      size: "200g",            price: "₦3,000", img: "" },
    ],
  },
  {
    heading: "Snacks",
    sub: "High-protein, no-preservative snacking.",
    products: [
      { name: "Roasted Peanuts",               size: "Lightly salted · 200g",  price: "₦1,800", img: "roasted_peanut.jpg" },
      { name: "Plantain Chips — Toasted & Crunchy", size: "150g",              price: "₦2,200", img: "plantain__chips.jpg" },
      { name: "Plantain Chips — Ripe & Spicy",    size: "150g",               price: "₦2,200", img: "plantain_ripe.jpg" },
      { name: "Coated Peanuts",                size: "Spicy BBQ · 200g",       price: "₦2,000", img: "peanut_spicy.jpg" },
      { name: "Yogurt Mix — Seed & Nut Blend", size: "200g",                  price: "₦2,800", img: "parfait__toppings.jpg" },
      { name: "Chin Chin",                     size: "200g",                   price: "₦2,800", img: "chinchin.jpg" },
      { name: "Corn Sticks",                   size: "200g",                   price: "₦4,000", img: "corn_sticks.jpg" },
      { name: "Cashew Nuts",                   size: "Roasted · 200g",         price: "₦2,800", img: "cashew_nuts.jpg" },
    ],
  },
  {
    heading: "Drinks & Wellness",
    sub: "Cold-pressed and brewed in small batches. All 500ml.",
    products: [
      { name: "Zobo Drink",              size: "Hibiscus infusion · 500ml",        price: "₦2,000", img: "zobo.jpg" },
      { name: "Yogurt Drink",            size: "Probiotic · 500ml",                price: "₦2,800", img: "yoghurt.jpg" },
      { name: "Ginger Immune Booster",   size: "Ginger · Lemon · Honey · 500ml",  price: "₦2,000", img: "ginger_immune_booster.jpg" },
      { name: "Turmeric Immune Booster", size: "Turmeric · Ginger · 500ml",       price: "₦2,000", img: "Turmeric.jpg" },
      { name: "Pineapple Ginger Drink",  size: "500ml",                            price: "₦2,500", img: "pineapple_ginger_lemon.jpg" },
      { name: "Tiger Nut Milk",          size: "Plant-based · 500ml",              price: "₦2,500", img: "tigernut.jpg" },
      { name: "Kale Cleanser",           size: "Kale · Cucumber · Apple · 500ml", price: "₦2,200", img: "kale.jpg" },
      { name: "Lemon Honey Cleanser",    size: "Lemon · Honey · Cayenne · 500ml", price: "₦3,000", img: "lemon__honey.jpg" },
      { name: "Orange Juice",            size: "100% natural · 500ml",            price: "₦3,000", img: "orange.jpg" },
      { name: "Carrot Juice",            size: "100% carrot juice · 500ml",       price: "₦3,000", img: "carrot.jpg" },
    ],
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Page header */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-5 h-5 opacity-60" />
            <span className="text-background/60 text-sm font-medium uppercase tracking-wider">Products</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Take a piece of<br />AHmazing home
          </h1>
          <p className="text-xl text-background/75 max-w-2xl leading-relaxed">
            Spices, snacks, bottled drinks and seeds — made with real ingredients, no MSG, no preservatives.
            Tap <strong className="text-background">Order →</strong> on any item to go straight to the booking cart.
          </p>
        </div>
      </div>

      {/* Product groups */}
      <div className="container mx-auto px-4 md:px-6 space-y-20">
        {groups.map((group) => (
          <section key={group.heading}>
            <div className="mb-10">
              <h2 className="text-3xl font-bold font-display mb-2">{group.heading}</h2>
              <p className="text-muted-foreground">{group.sub}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {group.products.map((p) => (
                <div
                  key={p.name}
                  className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="aspect-square bg-muted overflow-hidden">
                    {p.img ? (
                      <img
                        src={asset(`products/${p.img}`)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs text-center px-4">
                        Photo coming soon
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-[15px] leading-tight mb-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 flex-1">{p.size}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-base">{p.price}</span>
                      <Link
                        href={`/book?cat=products&item=${encodeURIComponent(p.name)}&size=Standard`}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
                        style={{ background: "#0F9E0F" }}
                      >
                        Order →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Bottom CTA */}
        <div className="rounded-2xl bg-muted border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Want a fresh meal too?</h3>
            <p className="text-muted-foreground">Book a soup, stew or breakfast cooked to order for you.</p>
          </div>
          <Link
            href="/book"
            className="shrink-0 rounded-full px-8 py-3 font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: "#0F9E0F" }}
          >
            Book Your Meal
          </Link>
        </div>
      </div>
    </div>
  );
}
