import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { Settings2, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onDetails?: (product: Product) => void;
  index?: number;
}

const CATEGORY_COLORS: Record<Product["category"], string> = {
  base: "bg-sky-950/60 text-sky-300 border-sky-800",
  wall: "bg-indigo-950/60 text-indigo-300 border-indigo-800",
  structure: "bg-violet-950/60 text-violet-300 border-violet-800",
  accessory: "bg-amber-950/60 text-amber-300 border-amber-800",
  decal: "bg-emerald-950/60 text-emerald-300 border-emerald-800",
  kit: "bg-primary/10 text-primary border-primary/30",
};

export function ProductCard({
  product,
  onDetails,
  index = 0,
}: ProductCardProps) {
  const addProduct = useCartStore((s) => s.addProduct);
  const navigate = useNavigate();

  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <Card
      data-ocid={`shop.product_card.item.${index + 1}`}
      className="group flex flex-col bg-card border border-border hover:border-primary/40 transition-smooth overflow-hidden"
    >
      {/* Thumbnail */}
      <button
        type="button"
        className="aspect-[4/3] w-full bg-secondary/50 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={() => onDetails?.(product)}
        aria-label={`View details for ${product.name}`}
      >
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
          <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center">
            <span className="text-2xl select-none">
              {product.category === "base"
                ? "🏗️"
                : product.category === "wall"
                  ? "🧱"
                  : product.category === "structure"
                    ? "🏛️"
                    : product.category === "accessory"
                      ? "🔧"
                      : product.category === "decal"
                        ? "🎨"
                        : "📦"}
            </span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {product.scale}
          </span>
        </div>
      </button>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-foreground leading-tight line-clamp-2">
            {product.name}
          </h3>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${
              CATEGORY_COLORS[product.category]
            }`}
          >
            {categoryLabel}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-mono font-bold text-foreground text-base">
            {formatPrice(product.price)}
          </span>
          <Badge
            variant="outline"
            className="font-mono text-xs border-muted text-muted-foreground"
          >
            {product.scale}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 text-xs gap-1.5 border-border hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
            onClick={() => {
              navigate({ to: "/builder" });
            }}
            data-ocid={`shop.use_in_builder_button.${index + 1}`}
          >
            <Settings2 className="w-3 h-3" />
            Use in Builder
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
            onClick={() => addProduct(product)}
            data-ocid={`shop.add_to_cart_button.${index + 1}`}
          >
            <ShoppingCart className="w-3 h-3" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
