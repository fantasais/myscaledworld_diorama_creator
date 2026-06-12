import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Minus,
  Package,
  Plus,
  Settings2,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const ENV_LABELS: Record<string, string> = {
  indian_garage: "Indian Garage",
  indian_fuel_station: "Indian Fuel Station",
};

function KitBomExpand({ item }: { item: CartItem }) {
  const [open, setOpen] = useState(false);
  if (!item.bom || item.bom.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
        data-ocid="cart.bom_expand_button"
      >
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        {open ? "Hide" : "View"} bill of materials ({item.bom.length} module
        {item.bom.length !== 1 ? "s" : ""})
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-1.5" data-ocid="cart.bom_list">
          {item.bom.map((line, idx) => (
            <div
              key={line.product.id}
              className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-lg bg-background/60 border border-border/40"
              data-ocid={`cart.bom_line.${idx + 1}`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-xs font-medium text-foreground truncate">
                  {line.product.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground capitalize">
                  {line.product.category} &bull; qty {line.quantity}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-foreground shrink-0">
                {formatPrice(line.totalPrice)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CartItemRow({ item, index }: { item: CartItem; index: number }) {
  const { updateQuantity, removeItem } = useCartStore();
  const isKit = item.type === "configured_kit";

  return (
    <div
      className="bg-card border border-border rounded-2xl p-5"
      data-ocid={`cart.item.${index + 1}`}
    >
      <div className="flex items-start gap-4">
        {/* Icon badge */}
        <div
          className={cn(
            "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border",
            isKit
              ? "bg-primary/10 border-primary/30"
              : "bg-secondary/50 border-border",
          )}
        >
          {isKit ? (
            <Settings2 className="w-5 h-5 text-primary" />
          ) : (
            <Package className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h3 className="font-display text-sm font-semibold text-foreground truncate">
                {isKit ? item.kitName : item.product?.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {isKit && item.environment && (
                  <Badge
                    variant="outline"
                    className="font-mono text-xs border-primary/30 text-primary bg-primary/5 px-2 py-0"
                  >
                    {ENV_LABELS[item.environment]}
                  </Badge>
                )}
                {item.scale && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.scale}
                  </span>
                )}
                {isKit && (
                  <Badge
                    variant="secondary"
                    className="font-mono text-xs px-2 py-0"
                  >
                    Configured Kit
                  </Badge>
                )}
              </div>
            </div>
            <span className="font-mono font-bold text-foreground shrink-0">
              {formatPrice(item.totalPrice)}
            </span>
          </div>

          {/* Quantity + remove */}
          <div className="flex items-center gap-3 mt-4">
            {!isKit && (
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-ocid={`cart.qty_decrease.${index + 1}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span
                  className="w-7 text-center font-mono text-xs font-bold text-foreground"
                  data-ocid={`cart.qty_value.${index + 1}`}
                >
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-ocid={`cart.qty_increase.${index + 1}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {isKit && (
              <span className="font-mono text-xs text-muted-foreground">
                Qty: 1 (configured kit)
              </span>
            )}
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="ml-auto flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 rounded px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid={`cart.remove_button.${index + 1}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>

          {/* BOM expansion for kits */}
          {isKit && <KitBomExpand item={item} />}
        </div>
      </div>
    </div>
  );
}

export function CartPage() {
  const { items, total } = useCartStore();
  const navigate = useNavigate();
  const cartTotal = total();

  return (
    <>
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <span className="font-mono text-xs text-primary uppercase tracking-widest mb-1 block">
            Order Flow
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            Your Cart
          </h1>
        </div>
      </div>

      <div className="bg-background">
        <div className="container mx-auto px-4 py-10">
          {items.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              data-ocid="cart.empty_state"
            >
              <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
                <ShoppingCart className="w-9 h-9 text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                Your cart is empty
              </h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Configure a diorama kit or add individual modules to get
                started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/builder">
                  <Button
                    type="button"
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
                    data-ocid="cart.start_building_button"
                  >
                    <Settings2 className="w-4 h-4" />
                    Start Building
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-border hover:border-primary/40"
                    data-ocid="cart.browse_shop_button"
                  >
                    Browse Shop
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items list */}
              <div
                className="lg:col-span-2 flex flex-col gap-4"
                data-ocid="cart.items_list"
              >
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  {items.length} item{items.length !== 1 ? "s" : ""} in cart
                </p>
                {items.map((item, i) => (
                  <CartItemRow key={item.id} item={item} index={i} />
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div
                  className="bg-card border border-border rounded-2xl p-6 sticky top-24"
                  data-ocid="cart.order_summary"
                >
                  <h2 className="font-display text-base font-semibold text-foreground mb-5">
                    Order Summary
                  </h2>

                  <div className="flex flex-col gap-3 mb-5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-2 text-sm"
                      >
                        <span className="text-muted-foreground truncate min-w-0 flex-1">
                          {item.type === "configured_kit"
                            ? item.kitName
                            : item.product?.name}
                          {item.quantity > 1 && (
                            <span className="font-mono text-xs ml-1">
                              ×{item.quantity}
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs font-bold text-foreground shrink-0">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-border mb-5" />

                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display text-sm font-semibold text-foreground">
                      Subtotal
                    </span>
                    <span className="font-mono font-bold text-xl text-foreground">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>

                  <p className="font-mono text-xs text-muted-foreground mb-5">
                    Shipping calculated at checkout
                  </p>

                  <Button
                    type="button"
                    className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold transition-smooth"
                    onClick={() => navigate({ to: "/checkout" })}
                    data-ocid="cart.checkout_button"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <div className="mt-4 text-center">
                    <Link to="/shop">
                      <button
                        type="button"
                        className="font-mono text-xs text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors duration-150"
                        data-ocid="cart.continue_shopping_link"
                      >
                        Continue shopping
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
