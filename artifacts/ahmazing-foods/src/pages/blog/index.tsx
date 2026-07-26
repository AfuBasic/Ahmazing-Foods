import { Link } from "wouter";
import { BookOpen, ArrowRight } from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const asset = (p: string) => `${BASE}assets/${p}`;
const BRAND_GREEN = "#0F9E0F";

const articles = [
  {
    slug: "diabetes-friendly-nigerian-foods",
    title: "5 Nigerian Foods That Are Naturally Diabetes-Friendly",
    excerpt:
      "Managing blood sugar does not mean giving up Nigerian food. Several dishes in our everyday repertoire already work in your favour — here are five worth knowing about.",
    readTime: "5 min read",
    tag: "Wellness Guide",
    img: asset("food-egusi-hands.jpg"),
  },
  {
    slug: "nigerian-soups-less-oil",
    title: "How to Cook Nigerian Soups With Less Oil (Without Losing Flavour)",
    excerpt:
      "Palm oil is at the heart of Nigerian cooking. But flavour and oil are not the same thing. Here is how to reduce the oil without reducing the taste.",
    readTime: "4 min read",
    tag: "Cooking Technique",
    img: asset("food-hero-soup.jpg"),
  },
  {
    slug: "heart-healthy-nigerian-kitchen",
    title: "What Makes a Meal 'Heart-Healthy'? A Nigerian Kitchen Guide",
    excerpt:
      "Heart-healthy gets used a lot in wellness circles — usually about salads and grilled chicken. Nigerian cooking has more to offer here than most people realise.",
    readTime: "5 min read",
    tag: "Wellness Guide",
    img: asset("food-egusi-top.jpg"),
  },
];

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-foreground text-background pt-16 pb-24 rounded-b-[3rem] shadow-xl mb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 opacity-60" />
            <span className="text-background/60 text-sm font-medium uppercase tracking-wider">Blog</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">
            Food, health<br />and the Nigerian kitchen
          </h1>
          <p className="text-xl text-background/75 max-w-2xl leading-relaxed">
            Practical articles on eating well without leaving behind the food that matters to you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="group block">
              <article className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={a.img}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                      style={{ background: BRAND_GREEN }}
                    >
                      {a.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">{a.readTime}</span>
                  </div>
                  <h2 className="font-display font-bold text-xl leading-snug mb-3 group-hover:text-primary transition-colors">
                    {a.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{a.excerpt}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-bold" style={{ color: BRAND_GREEN }}>
                    Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Cross-link to Healthy Meals */}
        <div className="mt-16 rounded-2xl bg-muted border border-border p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold font-display mb-2">Looking for meal suggestions?</h3>
            <p className="text-muted-foreground">Our Healthy Meals page picks specific dishes from our menu that work harder for your health.</p>
          </div>
          <Link
            href="/healthy-meals"
            className="shrink-0 rounded-full px-8 py-3 font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: BRAND_GREEN }}
          >
            See Healthy Meals
          </Link>
        </div>
      </div>
    </div>
  );
}
