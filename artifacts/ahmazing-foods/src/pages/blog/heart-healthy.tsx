import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

const BRAND_GREEN = "#0F9E0F";

export default function HeartHealthyPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-background/70 hover:text-background mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ background: BRAND_GREEN }}>
              Wellness
            </span>
            <span className="text-background/60 text-sm">5 min read</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
            What Makes a Meal 'Heart-Healthy'? A Nigerian Kitchen Guide
          </h1>
          <p className="text-xl text-background/75 leading-relaxed">
            Heart-healthy gets used a lot in wellness circles — usually about salads and grilled chicken.
            Nigerian cooking has more to offer here than most people realise.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl">

        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 flex gap-4 mb-12">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong className="text-amber-900">Not medical advice.</strong> This article is for general information only.
            If you have heart disease, hypertension or any cardiovascular condition, please consult your doctor
            or a registered dietitian before making changes to your diet.
          </p>
        </div>

        <div className="space-y-8 text-foreground">

          <p className="text-lg text-muted-foreground leading-relaxed">
            The phrase "heart-healthy" has been hijacked by the wellness industry to mean a plate of steamed broccoli
            and a skinless chicken breast. That is a narrow and, frankly, culturally exclusive definition. The actual
            nutritional principles behind heart health — more fiber, more vegetables, leaner proteins, less sodium,
            controlled saturated fat — are achievable in a Nigerian kitchen without abandoning the food that is
            central to daily life.
          </p>

          {[
            {
              title: "Fibre is protective",
              body: `Dietary fibre reduces LDL cholesterol (the kind associated with cardiovascular risk) by interfering
                     with its absorption in the gut. Nigerian food has some excellent fibre sources that are easy to
                     overlook: beans, in all their forms — moin-moin, akara, ewa agoyin — are high in soluble fibre.
                     Vegetables in soups (ugu, waterleaf, oha, bitterleaf, spinach in Efo-Riro) contribute meaningfully.
                     Oatmeal, which appears on our breakfast menu as part of The Sweet Start, is one of the most
                     studied fibre sources for heart health.`,
            },
            {
              title: "Lean protein over large portions of red meat",
              body: `This is not a call to cut out beef or goat meat — both are part of Nigerian food culture and eaten
                     in context. The relevant principle is portion and frequency. Fish (croaker, tilapia, catfish)
                     contains unsaturated fats that are actually supportive of heart health. Chicken and turkey are
                     leaner than beef. In practice: if you are eating soup daily, choosing fish protein most days
                     and red meat a few times a week is a reasonable balance. When you order from us, the protein
                     add-on is where that choice happens.`,
            },
            {
              title: "Sodium is the hidden variable",
              body: `Most Nigerian seasoning cubes are very high in sodium. Salt is a significant driver of high blood
                     pressure in people who are sodium-sensitive, and hypertension is a major risk factor for heart
                     disease. The traditional alternatives — crayfish, stockfish, dried fish, locust beans (iru or
                     ogiri) — deliver deep, complex flavour without the sodium load of seasoning cubes. We do not use
                     MSG at AHmazing Foods, and we season with restraint. If you are managing sodium intake, you can
                     ask for lower seasoning in your notes when you book.`,
            },
            {
              title: "The palm oil question",
              body: `Palm oil is not the villain it was made out to be in 1990s nutrition science, which was heavily
                     influenced by the vegetable oil industry. It contains both saturated and unsaturated fats, as well
                     as vitamin E and carotenoids. The honest position is: palm oil in reasonable quantities is not
                     a major heart health problem for most people. The concern arises when quantities are very high
                     and the rest of the diet is also high in saturated fat and sodium. If you are concerned, the
                     practical adjustment is portion (see the previous article on cooking with less oil) rather
                     than elimination.`,
            },
            {
              title: "Portion size is the most underrated lever",
              body: `A bowl of Onugbu soup with stockfish, a small protein, and a fist-sized portion of eba is a
                     nutritionally reasonable meal. The same soup with a very large mound of eba adds several hundred
                     calories of refined carbohydrate that will spike blood sugar and, over time, contribute to
                     metabolic risk. The swallow is where portion awareness matters most in Nigerian food. You do
                     not have to eat less soup — eat more of the soup and less of the swallow.`,
            },
            {
              title: "Soups and stews that work harder",
              body: `Edikang Ikong is one of the most vegetable-dense soups on our menu — ugu and waterleaf in
                     significant quantities. Efo-Riro (spinach-based) follows closely. Oha and Ewedu are structurally
                     lighter. Banga soup, despite its palm oil base, contains natural antioxidants from the palm fruit.
                     These are not miracle foods — but if you are going to eat soup daily, some choices
                     are better than others, and these are the ones we would point to.`,
            },
          ].map(({ title, body }) => (
            <div key={title} className="border-l-4 pl-6" style={{ borderColor: BRAND_GREEN }}>
              <h2 className="text-xl font-bold font-display mb-3">{title}</h2>
              <p className="text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}

          <div className="bg-muted rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-2">The honest summary</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No single meal will fix or cause heart disease. What matters is the pattern over time —
              more vegetables, more fiber, leaner proteins more often, less sodium, controlled portions of
              starchy swallows. Nigerian food supports all of these when chosen and prepared thoughtfully.
              It does not require abandoning anything fundamental. It requires paying attention.
            </p>
          </div>

        </div>

        {/* Cross-links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/healthy-meals" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Also see</p>
            <p className="font-bold">Healthy Meals</p>
            <p className="text-sm text-muted-foreground mt-1">Specific picks from our menu</p>
          </Link>
          <Link href="/soups" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order</p>
            <p className="font-bold">Soups</p>
            <p className="text-sm text-muted-foreground mt-1">Edikang Ikong, Efo-Riro and more</p>
          </Link>
          <Link href="/breakfast" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order</p>
            <p className="font-bold">Breakfast</p>
            <p className="text-sm text-muted-foreground mt-1">The Sweet Start — oats + fruit</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
