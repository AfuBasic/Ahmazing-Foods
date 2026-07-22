import { useLocation } from "wouter";
import { Link } from "wouter";
import { ChefHat, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg">AHmazing Admin</span>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/admin" className={cn("transition-colors hover:text-primary", location === "/admin" ? "text-primary" : "text-muted-foreground")}>Dashboard</Link>
              <Link href="/admin/orders" className={cn("transition-colors hover:text-primary", location.startsWith("/admin/orders") ? "text-primary" : "text-muted-foreground")}>Orders</Link>
              <Link href="/" className="text-muted-foreground hover:text-primary ml-4 flex items-center gap-1">
                View Site <ArrowRight className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader location={location} />
      <main className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader({ location }: { location: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/soups", label: "Soups" },
    { href: "/stews", label: "Stews" },
    { href: "/breakfast", label: "Breakfast" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 z-50">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-foreground">
            AHmazing Foods
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-[15px] font-medium transition-all hover:text-primary",
                location === link.href ? "text-primary border-b-2 border-primary py-1" : "text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild className="rounded-full px-6 font-bold shadow-md hover:shadow-lg transition-all">
            <Link href="/book">Book Now</Link>
          </Button>
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-foreground z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-background pt-24 px-6 z-40 flex flex-col gap-6 md:hidden">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-2xl font-display font-semibold transition-colors",
                  location === link.href ? "text-primary" : "text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-8 pt-8 border-t border-border">
              <Button asChild size="lg" className="w-full rounded-full text-lg h-14">
                <Link href="/book" onClick={() => setMobileMenuOpen(false)}>Book Now</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl">AHmazing Foods</span>
            </div>
            <p className="text-background/70 text-sm max-w-sm">
              Authentic, fresh, and deeply Nigerian. Every pot starts only once you book. No storefront, no shortcuts.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Menu</h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li><Link href="/soups" className="hover:text-primary transition-colors">Rich Soups</Link></li>
              <li><Link href="/stews" className="hover:text-primary transition-colors">Hearty Stews</Link></li>
              <li><Link href="/breakfast" className="hover:text-primary transition-colors">Weekend Breakfast</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Contact & Info</h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li>Lagos, Nigeria</li>
              <li>Delivery within 24-48 hours</li>
              <li>Rush orders available</li>
              <li className="pt-4">
                <Link href="/admin" className="text-xs opacity-50 hover:opacity-100 transition-opacity">Admin Login</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-background/50">
          © {new Date().getFullYear()} AHmazing Foods. Built with craft.
        </div>
      </div>
    </footer>
  );
}