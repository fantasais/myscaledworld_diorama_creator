import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { Settings2, ShoppingCart, X } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ENV_LABEL: Record<string, string> = {
  indian_garage: "Indian Garage",
  indian_fuel_station: "Indian Fuel Station",
};

const CATEGORY_EMOJI: Record<Product["category"], string> = {
  base: "🏗️",
  wall: "🧱",
  structure: "🏛️",
  accessory: "🔧",
  decal: "🎨",
  kit: "📦",
};

export function ProductDetailModal({
  product,
  open,
  onClose,
}: ProductDetailModalProps) {
  const addProduct = useCartStore((s) => s.addProduct);
  const navigate = useNavigate();

  if (!product) return null;

  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md bg-card border-border"
        data-ocid="shop.product_detail.dialog"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="font-display text-lg font-semibold text-foreground pr-6">
              {product.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Preview */}
        <div className="aspect-video bg-secondary/50 rounded-lg border border-border flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-5xl">{CATEGORY_EMOJI[product.category]}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {product.scale}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {product.scale}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {categoryLabel}
          </Badge>
          {product.environments.map((env) => (
            <Badge
              key={env}
              variant="outline"
              className="font-mono text-xs border-primary/30 text-primary/80"
            >
              {ENV_LABEL[env]}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        {/* Price + actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="font-mono font-bold text-xl text-foreground">
            {formatPrice(product.price)}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              onClick={() => {
                onClose();
                navigate({ to: "/builder" });
              }}
              data-ocid="shop.product_detail.use_in_builder_button"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Builder
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              onClick={() => {
                addProduct(product);
                onClose();
              }}
              data-ocid="shop.product_detail.add_to_cart_button"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
