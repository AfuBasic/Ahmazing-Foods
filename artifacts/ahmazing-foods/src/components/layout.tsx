import { useLocation } from "wouter";
import { Link } from "wouter";
import {
  Menu,
  X,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  UtensilsCrossed,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";

const BRAND_RED = "#C81212";
const BRAND_GREEN = "#0F9E0F";
const LOGO_SRC = `${import.meta.env.BASE_URL}assets/logo.png`;

// Meal sub-pages grouped under "Our Meals" dropdown
const MEAL_LINKS = [
  {
    href: "/breakfast",
    label: "Breakfast",
    desc: "Combo plates cooked fresh to order",
  },
  {
    href: "/soups",
    label: "Soups",
    desc: "Nigerian soups by the litre or cooler",
  },
  {
    href: "/stews",
    label: "Stews",
    desc: "Classic stews for families and events",
  },
  {
    href: "/healthy-meals",
    label: "Healthy Meals",
    desc: "Lower sugar, lower sodium — full Nigerian flavour",
  },
  {
    href: "/trays-platters",
    label: "Trays & Platters",
    desc: "Styled food trays for events and gifting",
  },
  {
    href: "/weekend-specials",
    label: "Weekend Specials",
    desc: "Vote for the dish you want this weekend",
  },
];

const MEAL_PATHS = MEAL_LINKS.map((l) => l.href);

// Top-level nav links (beside Our Meals)
const TOP_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/catering", label: "Catering" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={LOGO_SRC} alt="AHmazing Foods" className="h-8 w-auto" />
              <span className="font-display font-bold text-lg text-muted-foreground">
                Admin
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/admin"
                className={cn(
                  "transition-colors hover:text-primary",
                  location === "/admin"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className={cn(
                  "transition-colors hover:text-primary",
                  location.startsWith("/admin/orders")
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                Orders
              </Link>
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary ml-4 flex items-center gap-1"
              >
                View Site <ArrowRight className="w-4 h-4" />
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader location={location} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

// ── Our Meals desktop dropdown ────────────────────────────────────────────
function MealsDropdown({ location }: { location: string }) {
  const [open, setOpen] = useState(false);
  const isMealActive = MEAL_PATHS.some(
    (p) => location === p || location.startsWith(p + "/"),
  );

  return (
    <div
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setTimeout(() => setOpen(false), 120);
        }
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1 text-[14px] font-medium transition-all hover:text-primary focus:outline-none",
          isMealActive
            ? "text-primary border-b-2 border-primary py-1"
            : "text-foreground",
        )}
      >
        Our Meals{" "}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-border rounded-xl shadow-xl p-2 z-50">
          {MEAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors",
                location === link.href ? "bg-primary/5 text-primary" : "",
              )}
            >
              <UtensilsCrossed className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <span className="block font-semibold text-sm">
                  {link.label}
                </span>
                <span className="block text-xs text-muted-foreground leading-snug">
                  {link.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Site header ───────────────────────────────────────────────────────────
function SiteHeader({ location }: { location: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMealsOpen, setMobileMealsOpen] = useState(false);
  const { cartCount } = useCart();
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Contact bar */}
      <div
        className="w-full text-white text-sm py-2 px-4"
        style={{ background: BRAND_RED }}
      >
        <div className="container mx-auto flex flex-wrap items-center gap-x-6 gap-y-1">
          <a
            href="tel:+2348105506052"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" /> +234 (810)-550-6052
          </a>
          <a
            href="mailto:ahmazingfoodsorders@gmail.com"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />{" "}
            ahmazingfoodsorders@gmail.com
          </a>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> Lagos State
          </span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 z-50">
            <img src={LOGO_SRC} alt="AHmazing Foods" className="h-10 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Our Meals dropdown */}
            <MealsDropdown location={location} />

            {/* Top-level links */}
            {TOP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[14px] font-medium transition-all hover:text-primary",
                  location === link.href || location.startsWith(link.href + "/")
                    ? "text-primary border-b-2 border-primary py-1"
                    : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Cart Icon & Button */}
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-primary transition-colors flex items-center gap-1 bg-muted/50 rounded-full px-3.5 py-2 hover:bg-muted"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <span className="text-xs font-bold font-mono">Cart</span>
              {cartCount > 0 && (
                <span className="ml-1 bg-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Book CTA */}
            <Link
              href="/book"
              className="rounded-full px-6 py-2.5 font-bold text-white shadow-md hover:shadow-lg transition-all hover:opacity-90 text-sm"
              style={{ background: BRAND_GREEN }}
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile Cart & Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/cart"
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              title="View Cart"
            >
              <ShoppingBag className="w-6 h-6 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="p-2 text-foreground relative z-[60]"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col md:hidden"
            style={{ backgroundColor: "#ffffff", top: 0 }}
          >
            <div className="flex items-center justify-between px-4 h-20 border-b border-border">
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={closeMenu}
              >
                <img
                  src={LOGO_SRC}
                  alt="AHmazing Foods"
                  className="h-10 w-auto"
                />
              </Link>
              <button
                className="p-2 text-foreground"
                onClick={closeMenu}
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col px-6 pt-6 gap-1 overflow-y-auto">
              {/* Our Meals expandable */}
              <button
                onClick={() => setMobileMealsOpen((o) => !o)}
                className={cn(
                  "flex items-center justify-between text-xl font-display font-semibold py-3 border-b border-border/50",
                  MEAL_PATHS.some((p) => location === p)
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                Our Meals
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    mobileMealsOpen && "rotate-180",
                  )}
                />
              </button>
              {mobileMealsOpen && (
                <div className="pl-4 pb-2 space-y-0.5">
                  {MEAL_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      className={cn(
                        "block py-2.5 text-lg font-medium border-b border-border/30",
                        location === link.href
                          ? "text-primary"
                          : "text-foreground/80",
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Top-level links */}
              {TOP_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xl font-display font-semibold py-3 border-b border-border/50 transition-colors",
                    location === link.href ? "text-primary" : "text-foreground",
                  )}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-6 mt-6">
              <Link
                href="/book"
                className="flex items-center justify-center w-full rounded-full py-4 text-lg font-bold text-white shadow-lg"
                style={{ background: BRAND_GREEN }}
                onClick={closeMenu}
              >
                Book Your Meal
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

// ── Site footer ───────────────────────────────────────────────────────────
function SiteFooter() {
  return (
    <footer className="bg-foreground text-background py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="mb-6">
              <img
                src={LOGO_SRC}
                alt="AHmazing Foods"
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-background/70 text-sm max-w-sm">
              Authentic, fresh, and deeply Nigerian. Every pot starts only once
              you book. No storefront, no shortcuts.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Menu</h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li>
                <Link
                  href="/breakfast"
                  className="hover:text-primary transition-colors"
                >
                  Breakfast
                </Link>
              </li>
              <li>
                <Link
                  href="/soups"
                  className="hover:text-primary transition-colors"
                >
                  Rich Soups
                </Link>
              </li>
              <li>
                <Link
                  href="/stews"
                  className="hover:text-primary transition-colors"
                >
                  Hearty Stews
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-primary transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/trays-platters"
                  className="hover:text-primary transition-colors"
                >
                  Trays & Platters
                </Link>
              </li>
              <li>
                <Link
                  href="/healthy-meals"
                  className="hover:text-primary transition-colors"
                >
                  Healthy Meals
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/catering"
                  className="hover:text-primary transition-colors"
                >
                  Catering
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-lg mb-6">
              Contact & Info
            </h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <a
                  href="tel:+2348105506052"
                  className="hover:text-primary transition-colors"
                >
                  +234 (810)-550-6052
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a
                  href="mailto:ahmazingfoodsorders@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  ahmazingfoodsorders@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Lagos State, Nigeria</span>
              </li>
              <li className="pt-4">
                <Link
                  href="/admin"
                  className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                >
                  Admin Login
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/partners"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors border border-primary/30 hover:border-primary/60 rounded-full px-3 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  Partners &amp; Investors
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-background/50 space-y-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 text-xs font-mono text-background/70">
              <span className="font-sans font-medium text-background/60">
                Pay to:
              </span>
              Ahmazing Cuisine · FCMB ·
              <strong className="text-background/90 tracking-widest">
                1009414545
              </strong>
            </span>
          </div>
          <p>© {new Date().getFullYear()} AHmazing Foods · Lagos, Nigeria</p>
          <p className="text-background/35 text-xs">
            Site built by{" "}
            <a
              href="https://www.brandsenvoy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/50 hover:text-primary transition-colors underline underline-offset-2"
            >
              Brand Envoy Africa
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
