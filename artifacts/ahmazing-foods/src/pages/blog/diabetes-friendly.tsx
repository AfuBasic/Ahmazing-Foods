import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

const BRAND_GREEN = "#0F9E0F";

export default function DiabetesFriendlyPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-background/70 hover:text-background mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ background: BRAND_GREEN }}>
              Nutrition
            </span>
            <span className="text-background/60 text-sm">5 min read</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
            5 Nigerian Foods That Are Naturally Diabetes-Friendly
          </h1>
          <p className="text-xl text-background/75 leading-relaxed">
            Managing blood sugar does not mean giving up Nigerian food. Several dishes in our everyday
            repertoire already work in your favour.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl">

        {/* Disclaimer */}
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 flex gap-4 mb-12">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong className="text-amber-900">Not medical advice.</strong> This article is for general information only.
            If you have diabetes or are managing your blood sugar, please work with your doctor or a registered dietitian
            before making changes to your diet.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-10 text-foreground">

          <p className="text-lg text-muted-foreground leading-relaxed">
            The common assumption is that Nigerian food — heavy on carbohydrates, palm oil, and starchy swallows — is
            difficult territory for people managing blood sugar. That assumption is not entirely wrong, but it is not
            the whole picture either. A number of traditional Nigerian dishes are genuinely good choices, and understanding
            which ones helps you eat well without feeling like you are making sacrifices.
          </p>

          {[
            {
              n: "1",
              food: "Moin-moin",
              body: `Moin-moin is made from ground beans (usually black-eyed peas), which puts it in a completely different
                     nutritional category from most Nigerian staples. Beans are high in protein and fiber, and they have a
                     significantly lower glycemic index than white rice, eba, pounded yam or white bread. A portion of
                     moin-moin will not spike your blood sugar the way the same weight of eba would. Paired with pap (ogi),
                     which is hydrating and light, this is one of the most sensible breakfasts for blood sugar management.`,
              link: { label: "Order The Protein Power (moin-moin + akara + pap)", href: "/breakfast" },
            },
            {
              n: "2",
              food: "Bitterleaf Soup (Onugbu)",
              body: `Bitterleaf has a long history of use in traditional medicine across West Africa, and some research
                     supports its use in blood sugar management — though the evidence is still developing and not conclusive.
                     What is clear is that bitterleaf soup is one of the less starchy options on a typical Nigerian menu.
                     Paired with a smaller-than-usual portion of swallow, or eaten with unripe plantain (which has a lower
                     GI than ripe plantain), it is a solid lunch or dinner choice. The stockfish and dried fish add protein
                     without adding carbs.`,
              link: { label: "Order Onugbu Soup", href: "/soups" },
            },
            {
              n: "3",
              food: "Tiger Nut Milk",
              body: `Tiger nut milk (sometimes called kunun aya) is a drink made from tiger nuts — not a nut at all, but a
                     small tuber. It is naturally sweet and dairy-free, and while it does contain natural sugars, it tends
                     to have a lower glycemic impact than equivalent volumes of soft drinks or commercially sweetened drinks.
                     It is also a prebiotic drink, which means it feeds the good bacteria in your gut. If you are buying or
                     ordering tiger nut milk, make sure there is no added sugar — it does not need any.`,
              link: { label: "See Tiger Nut Milk in Products", href: "/products" },
            },
            {
              n: "4",
              food: "Zobo (Unsweetened Hibiscus Tea)",
              body: `Zobo (zoborodo) is made from dried hibiscus flowers steeped in water. Several studies have looked at
                     hibiscus extract's effects on blood pressure and blood sugar, with some promising results — though the
                     research is not yet definitive, and most of it is on concentrated extracts rather than drink portions.
                     What zobo unambiguously is: a deeply flavoured, hydrating, naturally caffeine-free drink. When made
                     without added sugar, it is an excellent alternative to fizzy drinks or heavily sweetened beverages.
                     If you are buying commercially prepared zobo, check the sugar content — it varies widely.`,
              link: { label: "See Zobo Drink in Products", href: "/products" },
            },
            {
              n: "5",
              food: "Ewedu Soup",
              body: `Ewedu (jute leaf) soup is one of the lightest options in the Nigerian soup repertoire. It is low in
                     fat, low in carbohydrates on its own, and high in vitamins A and C. The challenge with ewedu is what
                     it is served with — a very large portion of amala alongside it offsets its lightness. The practical
                     approach: have the ewedu with a genuinely small portion of swallow, or pair it with the gbegiri (bean
                     soup) combination, which adds protein and fiber. That pairing — ewedu and gbegiri — is one of the
                     most nutritionally complete combinations in Yoruba cuisine.`,
              link: { label: "Order Soups", href: "/soups" },
            },
          ].map(({ n, food, body, link }) => (
            <div key={n} className="border-l-4 pl-6" style={{ borderColor: BRAND_GREEN }}>
              <h2 className="text-2xl font-bold font-display mb-3">
                {n}. {food}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">{body}</p>
              <Link href={link.href} className="text-sm font-bold hover:underline" style={{ color: BRAND_GREEN }}>
                {link.label} →
              </Link>
            </div>
          ))}

          <div className="bg-muted rounded-2xl p-6 mt-8">
            <h3 className="font-bold text-lg mb-2">A note on swallow portions</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The soups above are all reasonable choices. The bigger variable is the swallow alongside them.
              Eba, fufu, pounded yam and amala are all high in carbohydrates and can spike blood sugar quickly.
              Keeping the portion to a fist-size or less — and giving the soup itself more space on the plate —
              is usually the single biggest dietary adjustment a person managing blood sugar can make in Nigerian food.
            </p>
          </div>

        </div>

        {/* Cross-links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/healthy-meals" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Also see</p>
            <p className="font-bold">Healthy Meals</p>
            <p className="text-sm text-muted-foreground mt-1">Specific meal picks from our menu</p>
          </Link>
          <Link href="/soups" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order</p>
            <p className="font-bold">Soups</p>
            <p className="text-sm text-muted-foreground mt-1">Onugbu, Efo-Riro, Ewedu and more</p>
          </Link>
          <Link href="/blog" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Back to</p>
            <p className="font-bold">All articles</p>
            <p className="text-sm text-muted-foreground mt-1">More on food and health</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
