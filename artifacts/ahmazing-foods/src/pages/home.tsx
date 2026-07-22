import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Clock, Truck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#FFFBF5]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper-2.png')] opacity-30 mix-blend-multiply pointer-events-none"></div>
        <div className="container mx-auto px-4 md:px-6 pt-24 pb-32 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Flame className="w-4 h-4" />
              Cooked fresh to order in Lagos
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-display text-foreground leading-[1.1]">
              The taste of home,<br />
              <span className="text-primary">without the hassle.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Rich soups, hearty stews, and weekend breakfasts. No shortcuts, no batch-cooking. We start your pot only when you book your slot.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform w-full sm:w-auto">
                <Link href="/book">Book a Meal Slot</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto border-2">
                <Link href="/soups">Explore Menu</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="aspect-square rounded-full bg-secondary/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] blur-3xl -z-10"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-8 border-white">
              {/* Using a placeholder for a rich pot of soup - ideally a generated image */}
              <div className="w-full aspect-[4/3] bg-secondary flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
                 <div className="text-white/80 font-display text-2xl font-bold italic tracking-wider absolute bottom-6 left-6">
                    Freshly made.
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">What's in the kitchen?</h2>
            <p className="text-muted-foreground">Select a category to see our full menu and sizes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard 
              href="/soups"
              title="Rich Soups"
              desc="Egusi, Efo Riro, Afang, and more. Loaded with assorted meats."
              color="bg-secondary"
              textColor="text-secondary-foreground"
            />
            <CategoryCard 
              href="/stews"
              title="Hearty Stews"
              desc="Ayamase, Ofe Akwu, and classic tomato stews for your rice and yam."
              color="bg-primary"
              textColor="text-primary-foreground"
            />
            <CategoryCard 
              href="/breakfast"
              title="Weekend Breakfast"
              desc="Akara, Moi Moi, and Yam porridge to start your Saturday right."
              color="bg-accent"
              textColor="text-accent-foreground"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold font-display mb-4">How AHmazing works</h2>
            <p className="text-muted-foreground text-lg">We don't do fast food. We do good food, cooked just for you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10"></div>
            
            <div className="flex flex-col items-center text-center space-y-4 bg-background p-8 rounded-2xl shadow-sm border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display">1. Book Your Slot</h3>
              <p className="text-muted-foreground">Choose your meal, size, and preferred delivery date & time. Bookings close 24 hours prior (rush fees apply for late bookings).</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 bg-background p-8 rounded-2xl shadow-sm border border-border">
              <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-2">
                <Flame className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display">2. We Start Cooking</h3>
              <p className="text-muted-foreground">Your order isn't scooped from a large batch. We source fresh ingredients and cook your pot specifically for you.</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4 bg-background p-8 rounded-2xl shadow-sm border border-border">
              <div className="w-16 h-16 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center mb-2">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display">3. Fresh Delivery</h3>
              <p className="text-muted-foreground">Delivered hot or carefully cooled (your choice) right to your doorstep in Lagos, perfectly sealed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
          <ShieldCheck className="w-12 h-12 mx-auto mb-6 text-primary" />
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6">Ready for a taste of home?</h2>
          <p className="text-lg text-background/80 mb-10">
            Secure your slot for this weekend. Slots fill up fast, so book early to guarantee delivery.
          </p>
          <Button asChild size="lg" className="rounded-full h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 border-none">
            <Link href="/book">Start Booking</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ href, title, desc, color, textColor }: { href: string, title: string, desc: string, color: string, textColor: string }) {
  return (
    <Link href={href} className="group block h-full">
      <div className={cn("rounded-2xl p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden", color, textColor)}>
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
          <ArrowRight className="w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold font-display mb-4 mt-auto pt-16 relative z-10">{title}</h3>
        <p className="text-current/80 font-medium relative z-10">{desc}</p>
      </div>
    </Link>
  );
}
