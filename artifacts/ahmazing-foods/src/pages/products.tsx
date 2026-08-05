import { Link } from "wouter";
import { ShoppingBag } from "lucide-react";

import { WatermarkedImage } from "@/components/ui/watermarked-image";
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
    heading: "Drinks & Wellness",
    sub: "Cold-pressed and brewed in small batches. All 500ml.",
    products: [
      { name: "Zobo Drink",              size: "Hibiscus infusion · 500ml",        price: "₦2,900", img: "products/zobo.jpg" },
      { name: "Yogurt Drink",            size: "Probiotic · 500ml",                price: "₦3,300", img: "products/yoghurt.jpg" },
      { name: "Ginger Immune Booster",   size: "Ginger · Lemon · Honey · 500ml",  price: "₦3,200", img: "products/ginger_immune_booster.jpg" },
      { name: "Turmeric Immune Booster", size: "Turmeric · Ginger · 500ml",       price: "₦3,200", img: "products/Turmeric.jpg" },
      { name: "Pineapple Ginger Drink",  size: "500ml",                            price: "₦2,900", img: "products/pineapple_ginger_lemon.jpg" },
      { name: "Tiger Nut Milk",          size: "Plant-based · 500ml",              price: "₦3,300", img: "products/tigernut.jpg" },
      { name: "Kale Cleanser",           size: "Kale · Cucumber · Apple · 500ml", price: "₦3,700", img: "products/kale.jpg" },
      { name: "Lemon Honey Cleanser",    size: "Lemon · Honey · Cayenne · 500ml", price: "₦3,100", img: "products/lemon__honey.jpg" },
      { name: "Orange Juice",            size: "100% natural · 500ml",            price: "₦2,900", img: "products/orange.jpg" },
      { name: "Carrot Juice",            size: "100% carrot juice · 500ml",       price: "₦3,300", img: "products/carrot.jpg" },
    ],
  },
  {
    heading: "Seeds & Spices",
    sub: "Sourced fresh and packed in small quantities. Great for home cooking.",
    products: [
      { name: "Chili Pepper",       size: "Dried · ground fine",              price: "₦2,000", img: "" },
      { name: "Cameroon Pepper",    size: "Bold heat · coarsely ground",      price: "₦2,500", img: "" },
      { name: "Soya Mix",            size: "Soya-based seasoning blend",        price: "₦2,500", img: "" },
      { name: "Cinnamon Powder",    size: "Ground cinnamon · warming spice",  price: "₦2,000", img: "" },
      { name: "Chia Seeds",         size: "High-fibre · packed with omega-3", price: "₦3,500", img: "" },
      { name: "Melon Seed",         size: "Egusi · sun-dried whole",          price: "₦3,000", img: "" },
    ],
  },
  {
    heading: "Snacks",
    sub: "Made in-house or sourced locally. Nothing artificial.",
    products: [
      { name: "Cashew Nuts",                       size: "Roasted · lightly salted",             price: "₦2,800", img: "products/cashew_nuts.jpg" },
      { name: "Roasted Peanuts",                   size: "Classic roasted groundnuts",            price: "₦1,800", img: "products/roasted_peanut.jpg" },
      { name: "Coated Peanuts",                    size: "Crunchy peanut coating",                price: "₦2,000", img: "products/coated-peanuts.jpg" },
      { name: "Chin Chin",                         size: "Classic Nigerian biscuit snack",        price: "₦2,800", img: "products/chinchin.jpg" },
      { name: "Corn Sticks",                       size: "Light & crunchy corn puffs",            price: "₦4,000", img: "products/corn_sticks.jpg" },
      { name: "Plantain Chips — Toasted & Crunchy", size: "Unripe plantain · lightly salted",    price: "₦2,200", img: "products/plantain__chips.jpg" },
      { name: "Plantain Chips — Ripe & Spicy",     size: "Ripe plantain · spiced",               price: "₦2,200", img: "products/plantain_ripe.jpg" },
      { name: "Yogurt Mix — Seed & Nut Blend",     size: "Mix-in for yogurt · nuts & seeds",     price: "₦2,800", img: "products/yogurt-mix.jpg" },
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
            Cold-pressed drinks, seeds, spices, and homemade snacks — no MSG, no preservatives.
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
                      <WatermarkedImage
                        src={asset(p.img)}
                        alt={p.name}
                        imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
