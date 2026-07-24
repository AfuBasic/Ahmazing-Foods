import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

const BRAND_GREEN = "#0F9E0F";

export default function SoupLessOilPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-background/70 hover:text-background mb-8 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ background: BRAND_GREEN }}>
              Cooking
            </span>
            <span className="text-background/60 text-sm">4 min read</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 leading-tight">
            How to Cook Nigerian Soups With Less Oil (Without Losing Flavour)
          </h1>
          <p className="text-xl text-background/75 leading-relaxed">
            Palm oil is at the heart of Nigerian cooking. But flavour and oil are not the same thing.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl">

        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 flex gap-4 mb-12">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong className="text-amber-900">Not medical advice.</strong> This article shares practical cooking tips.
            If you have a medical condition that requires specific dietary management, consult your doctor or dietitian.
          </p>
        </div>

        <div className="space-y-8 text-foreground">

          <p className="text-lg text-muted-foreground leading-relaxed">
            Most Nigerian cooks measure palm oil by the cup without thinking twice. And the results taste good —
            because they are good. The issue is not the oil itself; palm oil in moderation is not the villain it
            was made out to be in older Western nutrition writing. The issue is quantity. A cup of palm oil contains
            roughly 1,900 calories and a significant amount of saturated fat. When you are eating this daily,
            it adds up quickly.
          </p>

          <p className="text-lg text-muted-foreground leading-relaxed">
            The good news is that flavour in Nigerian soup comes from many places — not just the oil. Here is how
            to pull it back without making something that tastes like a compromise.
          </p>

          {[
            {
              title: "Build your flavour base first",
              body: `The most common reason people feel they need a lot of oil is that everything else in the pot
                     is underbuilt. If your stock is weak and your crayfish is not enough, the oil ends up carrying
                     the flavour load. Reverse this: make a proper stock from your proteins first (bone-in pieces take
                     longer but give more flavour), get your crayfish measurement right (it should be prominent, not an
                     afterthought), and dry your peppers down fully before adding oil. When the base is already flavourful,
                     you need less oil to feel like the soup is complete.`,
            },
            {
              title: "Render your proteins before adding to the pot",
              body: `If you are cooking chicken, beef or turkey, rendering them in a hot, dry pan first until the
                     outside is well-browned adds significant depth of flavour without adding any oil. This is the same
                     principle as browning meat in other cuisines — the Maillard reaction creates compounds that taste
                     rich and savoury. The soup will be more complex, and you will feel less need to compensate with oil.`,
            },
            {
              title: "Reduce in steps, not all at once",
              body: `If you currently use one cup of palm oil in a pot of egusi, going to a quarter cup overnight will
                     produce something that tastes and feels different to you. Your palate has calibrated to what it knows.
                     A better approach: reduce by 25% each time you make the soup. After a few weeks, you will have roughly
                     halved your oil without a single meal feeling like a sacrifice. This applies to stews as much as soups.`,
            },
            {
              title: "Use dry pepper, not wet",
              body: `Grinding peppers with water and adding them raw to hot oil creates a situation where the oil is
                     doing the work of cooking out the raw pepper taste. If you pre-roast your peppers or dry them down
                     in a pan first, you get more concentrated flavour and you need less oil to finish the cooking.
                     A blended pepper mix that has been cooked dry in a pan before it goes into the pot will also
                     last longer before going off.`,
            },
            {
              title: "Crayfish is not optional",
              body: `Crayfish (and stockfish or dried fish) are the umami backbone of Nigerian soups. They are what
                     makes the soup taste deeply savoury without depending entirely on palm oil. Many cooks who reduce
                     oil successfully compensate with a slightly more generous hand with crayfish. It is also worth
                     sourcing good-quality crayfish — the difference between fresh, properly dried crayfish and a stale
                     bag sitting on a shelf is significant in the finished soup.`,
            },
            {
              title: "Soups that naturally need less oil",
              body: `Some soups in the Nigerian repertoire are structurally lighter. Ewedu is essentially water-based
                     with no palm oil at all. Oha soup can be made with far less oil than egusi. Edikang Ikong, while
                     it traditionally uses a generous amount of palm oil, is vegetable-heavy enough that reducing the
                     oil still leaves you with something substantial. If you are trying to manage oil intake, these are
                     worth cooking more often.`,
            },
          ].map(({ title, body }) => (
            <div key={title} className="border-l-4 pl-6" style={{ borderColor: BRAND_GREEN }}>
              <h2 className="text-xl font-bold font-display mb-3">{title}</h2>
              <p className="text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}

          <div className="bg-muted rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-2">What we do at AHmazing</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We cook every soup to order in small batches, which means we are not holding pots that have been sitting
              and thickening (and where cooks sometimes add oil to loosen things back up). Our portions of palm oil
              are measured, not free-poured. We do not use MSG or artificial seasonings — which means our crayfish
              and stockfish work harder. If you have specific dietary requirements, add them in the notes field when
              you book and we will do our best to accommodate.
            </p>
          </div>

        </div>

        {/* Cross-links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/mindful-meals" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Also see</p>
            <p className="font-bold">Mindful Meals</p>
            <p className="text-sm text-muted-foreground mt-1">Soup picks chosen for their lighter profile</p>
          </Link>
          <Link href="/soups" className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order</p>
            <p className="font-bold">Soups</p>
            <p className="text-sm text-muted-foreground mt-1">Fresh, cooked to order in small batches</p>
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
