import { Link } from "wouter";
import { MessageCircle, ShoppingBag } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;

const WA = "https://wa.me/2348105506052";
const waLink = (item: string) =>
  `${WA}?text=${encodeURIComponent(`Hi, I'd like to order ${item}`)}`;

interface Product {
  name: string;
  size: string;
  price: string;
  img: string;
}

const groups: { heading: string; sub: string; products: Product[] }[] = [
  {
    heading: "Pantry & Sauces",
    sub: "Bold, ready-to-use bases for your own cooking.",
    products: [
      { name: "Smoky Jollof Base",           size: "Glass jar · 250g",         price: "₦4,500",  img: "" },
      { name: "Hibiscus Ginger Concentrate", size: "Glass bottle · 250ml",     price: "₦3,000",  img: "" },
      { name: "Premium Pepper Mix",          size: "Stand-up pouch · 150g",    price: "₦3,500",  img: "" },
      { name: "Suya Marinade",               size: "Spout pouch · 200g",       price: "₦3,000",  img: "" },
      { name: "Coconut Curry Base",          size: "Resealable pouch · 200g",  price: "₦4,000",  img: "" },
    ],
  },
  {
    heading: "Snacks",
    sub: "High-protein, no-preservative snacking.",
    products: [
      { name: "Roasted Peanuts",               size: "Lightly salted · 200g",    price: "₦1,800",  img: "roasted_peanut.jpg" },
      { name: "Coconut Shavings",              size: "Toasted & crunchy · 150g", price: "₦2,200",  img: "" },
      { name: "Coated Peanuts",                size: "Spicy BBQ · 200g",         price: "₦2,000",  img: "peanut_spicy.jpg" },
      { name: "Yogurt Mix — Seed & Nut Blend", size: "200g",                     price: "₦2,800",  img: "parfait__toppings.jpg" },
      { name: "Kwili Kwili",                   size: "Spicy & crunchy · 200g",   price: "₦2,000",  img: "kwilikwili.jpg" },
      { name: "Cashew Nuts",                   size: "Roasted & delicious · 200g",price: "₦2,800", img: "cashew_nuts.jpg" },
      { name: "Corn Sticks",                   size: "Crispy & delicious · 200g",price: "₦1,500",  img: "corn_sticks.jpg" },
      { name: "Chin Chin",                     size: "Crunchy & delicious · 200g",price: "₦1,500", img: "chinchin.jpg" },
      { name: "Plantain Chips — Ripe & Spicy", size: "150g",                     price: "₦1,800",  img: "plantain_ripe.jpg" },
      { name: "Plantain Chips — Toasted & Crunchy", size: "150g",               price: "₦1,800",  img: "plantain__chips.jpg" },
    ],
  },
  {
    heading: "Drinks & Wellness",
    sub: "Cold-pressed and brewed in small batches. All 500ml.",
    products: [
      { name: "Zobo Drink",              size: "Hibiscus infusion · 500ml",            price: "₦1,500",  img: "zobo.jpg" },
      { name: "Yogurt Drink",            size: "Probiotic · 500ml",                    price: "₦1,800",  img: "yoghurt.jpg" },
      { name: "Ginger Immune Booster",   size: "Ginger · Lemon · Honey · 500ml",      price: "₦2,000",  img: "ginger_immune_booster.jpg" },
      { name: "Turmeric Immune Booster", size: "Turmeric · Ginger · 500ml",           price: "₦2,000",  img: "Turmeric.jpg" },
      { name: "Pineapple Ginger Drink",  size: "500ml",                               price: "₦1,800",  img: "pineapple_ginger_lemon.jpg" },
      { name: "Tiger Nut Milk",          size: "Plant-based · 500ml",                 price: "₦2,200",  img: "tigernut.jpg" },
      { name: "Kale Cleanser",           size: "Kale · Cucumber · Apple · 500ml",     price: "₦2,200",  img: "kale.jpg" },
      { name: "Lemon Honey Cleanser",    size: "Lemon · Honey · Cayenne · 500ml",     price: "₦1,800",  img: "lemon__honey.jpg" },
      { name: "Carrot Boost",            size: "100% carrot juice · 500ml",           price: "₦1,800",  img: "carrot.jpg" },
      { name: "Orange Drink",            size: "100% natural · 500ml",               price: "₦1,800",  img: "orange.jpg" },
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
            Sauces, snacks and bottled drinks — made with real ingredients, no MSG, no preservatives.
            Tap <strong className="text-background">Order</strong> on any item to send a WhatsApp message directly to our kitchen.
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
                    <img
                      src={asset(`products/${p.img}`)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-[15px] leading-tight mb-1">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 flex-1">{p.size}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary text-base">{p.price}</span>
                      <a
                        href={waLink(p.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white transition-opacity hover:opacity-90"
                        style={{ background: "#25D366" }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Order
                      </a>
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
