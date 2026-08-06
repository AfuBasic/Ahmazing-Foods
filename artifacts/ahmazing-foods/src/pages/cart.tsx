import { useCart } from '@/context/cart-context';
import { formatNaira } from '@/lib/format';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Trash2, ArrowRight, Plus, Minus, ChefHat, ArrowLeft, UtensilsCrossed } from 'lucide-react';

export default function CartPage() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQty, clearCart } = useCart();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[85vh] py-10 px-4 md:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header breadcrumb & title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Cart</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Your Food Cart
            {cartCount > 0 && (
              <span className="text-base font-normal bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
        </div>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Clear Cart
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-6 max-w-lg mx-auto shadow-sm">
          <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <ShoppingBag className="w-10 h-10 stroke-1" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-foreground">Your cart is currently empty</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Explore our authentic soups, stews, breakfast plates, and wellness crates to build your order.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-full px-8 h-12 font-bold shadow-md">
              <Link href="/book">
                <ChefHat className="w-4 h-4 mr-2" /> Book Meal Plan
              </Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full px-8 h-12">
              <Link href="/soups">Explore Menu</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const proteinsText = item.selectedProteins && item.selectedProteins.length > 0
                ? item.selectedProteins.map((p) => `${p.name}${p.qty > 1 ? ` ×${p.qty}` : ''}`).join(', ')
                : null;

              return (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-foreground leading-snug">{item.menuItemName}</h3>
                      <p className="text-sm text-muted-foreground">
                        Size: <span className="font-medium text-foreground">{item.selectedSize}</span>
                      </p>
                      {proteinsText && (
                        <p className="text-xs text-muted-foreground">
                          Proteins: <span className="text-foreground font-medium">{proteinsText}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Controls */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <div className="flex items-center gap-2 border border-border rounded-full p-1 bg-background">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.itemQty - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.itemQty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.itemQty + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">{formatNaira(item.price)}</p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-destructive hover:underline flex items-center gap-1 ml-auto mt-0.5"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex justify-between items-center text-sm text-muted-foreground">
              <Link href="/soups" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
                <Plus className="w-4 h-4" /> Add More Dishes
              </Link>
            </div>
          </div>

          {/* Cart Summary Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-xl font-bold font-display border-b border-border pb-4 text-foreground">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal ({cartCount})</span>
                <span className="font-medium text-foreground">{formatNaira(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery & Rush Fee</span>
                <span className="text-xs text-primary font-medium">Calculated at checkout</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center text-base font-bold">
                <span className="text-foreground">Estimated Total</span>
                <span className="text-2xl font-display text-primary">{formatNaira(cartTotal)}</span>
              </div>
            </div>

            <Button
              onClick={() => setLocation('/book')}
              className="w-full rounded-full h-12 font-bold text-base shadow-lg hover:shadow-xl transition-all"
              style={{ background: '#0F9E0F' }}
            >
              Proceed to Booking <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Delivery slots, pepper customization, and delivery address selection are confirmed in the booking step.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
