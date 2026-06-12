import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/data/products";
import type { Order } from "@/types";
import { Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Package, Settings2, Store } from "lucide-react";
import { motion } from "motion/react";

const ENV_LABELS: Record<string, string> = {
  indian_garage: "Indian Garage",
  indian_fuel_station: "Indian Fuel Station",
};

export function ConfirmationPage() {
  const { orderId } = useParams({ strict: false }) as { orderId: string };
  const raw = sessionStorage.getItem(`order-${orderId}`);
  const order: Order | null = raw ? (JSON.parse(raw) as Order) : null;

  if (!order) {
    return (
      <>
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground mb-6">
            Order not found. It may have expired or the link is invalid.
          </p>
          <Link to="/">
            <Button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Return Home
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const kits = order.items.filter((i) => i.type === "configured_kit");
  const products = order.items.filter((i) => i.type === "product");

  return (
    <>
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
            data-ocid="confirmation.header"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-2">
              Order Confirmed
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Your modular diorama kit order has been created.
            </h1>
            <p className="text-muted-foreground max-w-md">
              We've received your order and it's now being processed. You'll
              receive a confirmation shortly.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-background">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            {/* Order reference */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6"
              data-ocid="confirmation.order_reference"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    Order Reference
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    #{order.orderId}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/40 text-primary bg-primary/5 font-mono text-xs px-3 py-1.5"
                >
                  Confirmed
                </Badge>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="font-mono text-xs text-muted-foreground">
                  Shipping to: {order.shipping.line1}, {order.shipping.city},{" "}
                  {order.shipping.state} – {order.shipping.pincode}
                </p>
              </div>
            </motion.div>

            {/* Configured kits */}
            {kits.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + idx * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6"
                data-ocid={`confirmation.kit.${idx + 1}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-semibold text-foreground">
                      {item.kitName}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.environment && (
                        <span className="font-mono text-xs text-primary">
                          {ENV_LABELS[item.environment]}
                        </span>
                      )}
                      {item.scale && (
                        <span className="font-mono text-xs text-muted-foreground">
                          &bull; {item.scale}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOM table */}
                {item.bom && item.bom.length > 0 && (
                  <div
                    className="flex flex-col gap-1.5 mb-4"
                    data-ocid={`confirmation.kit_bom.${idx + 1}`}
                  >
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                      Bill of Materials
                    </p>
                    {item.bom.map((line, li) => (
                      <div
                        key={line.product.id}
                        className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-background/60 border border-border/40"
                        data-ocid={`confirmation.bom_line.${li + 1}`}
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

                <Separator className="bg-border mb-4" />
                <div className="flex justify-between items-center">
                  <span className="font-display text-sm font-semibold text-foreground">
                    Kit Subtotal
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {formatPrice(item.totalPrice)}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Individual products */}
            {products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="bg-card border border-border rounded-2xl p-6"
                data-ocid="confirmation.products_section"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/60 border border-border flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Individual Modules
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {products.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex justify-between gap-2 py-2 px-3 rounded-lg bg-background/60 border border-border/40"
                      data-ocid={`confirmation.product.${idx + 1}`}
                    >
                      <div className="min-w-0">
                        <p className="font-display text-xs font-medium text-foreground">
                          {item.product?.name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground shrink-0">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Order total */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-primary/5 border border-primary/25 rounded-2xl p-6"
              data-ocid="confirmation.total_section"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">
                    Order Total
                  </p>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {formatPrice(order.total)}
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="flex flex-col sm:flex-row gap-3"
              data-ocid="confirmation.actions"
            >
              <Link to="/builder" className="flex-1">
                <Button
                  type="button"
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold transition-smooth"
                  data-ocid="confirmation.build_another_button"
                >
                  <Settings2 className="w-4 h-4" />
                  Build Another Kit
                </Button>
              </Link>
              <Link to="/shop" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-smooth"
                  data-ocid="confirmation.browse_shop_button"
                >
                  <Store className="w-4 h-4" />
                  Browse More Modules
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
