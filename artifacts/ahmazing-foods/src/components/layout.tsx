import { useLocation } from "wouter";
import { Link } from "wouter";
import { ChefHat, Menu, X, ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Exact brand hex values — do not approximate with Tailwind classes
const BRAND_RED = "#C81212";
const BRAND_GREEN = "#0F9E0F";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md text-white" style={{ background: BRAND_RED }}>
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

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Contact bar — brand red, full width */}
      <div className="w-full text-white text-sm py-2 px-4" style={{ background: BRAND_RED }}>
        <div className="container mx-auto flex flex-wrap items-center gap-x-6 gap-y-1">
          <a href="tel:+2348105506052" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>+234 (810)-550-6052</span>
          </a>
          <a href="mailto:ahmazingcuisine@gmail.com" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>ahmazingcuisine@gmail.com</span>
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Lagos State</span>
          </span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50">
            <div className="p-2 rounded-lg shadow-sm text-white" style={{ background: BRAND_RED }}>
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
            {/* CTA — brand green */}
            <a
              href="/book"
              className="rounded-full px-6 py-2.5 font-bold text-white shadow-md hover:shadow-lg transition-all hover:opacity-90 text-sm"
              style={{ background: BRAND_GREEN }}
            >
              Book Now
            </a>
          </nav>

          {/* Mobile Toggle — rendered above overlay */}
          <button
            className="md:hidden p-2 text-foreground relative z-[60]"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav — solid white, above all content */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col md:hidden"
            style={{ backgroundColor: "#ffffff", top: 0 }}
          >
            {/* Close button inside overlay */}
            <div className="flex items-center justify-between px-4 h-20 border-b border-border">
              <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
                <div className="p-2 rounded-lg text-white" style={{ background: BRAND_RED }}>
                  <ChefHat className="w-6 h-6" />
                </div>
                <span className="font-display font-bold text-2xl tracking-tight text-foreground">
                  AHmazing Foods
                </span>
              </Link>
              <button
                className="p-2 text-foreground"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col px-6 pt-8 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-2xl font-display font-semibold py-4 border-b border-border/50 transition-colors",
                    location === link.href ? "text-primary" : "text-foreground"
                  )}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-6 mt-8">
              <a
                href="/book"
                className="flex items-center justify-center w-full rounded-full py-4 text-lg font-bold text-white shadow-lg"
                style={{ background: BRAND_GREEN }}
                onClick={closeMenu}
              >
                Book Your Meal
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-md text-white" style={{ background: BRAND_RED }}>
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
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a href="tel:+2348105506052" className="hover:text-primary transition-colors">+234 (810)-550-6052</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:ahmazingcuisine@gmail.com" className="hover:text-primary transition-colors">ahmazingcuisine@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Lagos State, Nigeria</span>
              </li>
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
