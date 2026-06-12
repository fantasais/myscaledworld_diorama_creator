import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useBuilderStore } from "@/store/builderStore";
import { useCartStore } from "@/store/cartStore";
import type { BomLine } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

function buildBomLines(
  store: ReturnType<typeof useBuilderStore.getState>,
): BomLine[] {
  const lines: BomLine[] = [];
  if (store.selectedBase) {
    lines.push({
      product: store.selectedBase,
      quantity: 1,
      unitPrice: store.selectedBase.price,
      totalPrice: store.selectedBase.price,
    });
  }
  if (store.selectedWall) {
    lines.push({
      product: store.selectedWall,
      quantity: 1,
      unitPrice: store.selectedWall.price,
      totalPrice: store.selectedWall.price,
    });
  }
  for (const item of Object.values(store.accessories)) {
    if (item.quantity > 0) {
      lines.push({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
      });
    }
  }
  return lines;
}

export function BomSummary() {
  const store = useBuilderStore();
  const addConfiguredKit = useCartStore((s) => s.addConfiguredKit);
  const navigate = useNavigate();

  const bom = buildBomLines(store);
  const total = bom.reduce((s, l) => s + l.totalPrice, 0);
  const canAdd = !!store.environment && !!store.selectedBase;
  const hasAny = bom.length > 0;

  function handleAddToCart() {
    if (!store.environment) return;
    addConfiguredKit(bom, store.environment, "1:64");
    store.reset();
    toast.success("Kit added to cart!", {
      description: "Your configured diorama kit is ready for checkout.",
    });
    navigate({ to: "/cart" });
  }

  function handleClearAll() {
    store.reset();
    toast.info("Scene cleared.", {
      description: "All parts have been removed.",
    });
  }

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
      data-ocid="bom.panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Bill of Materials
        </h3>
        <div className="flex items-center gap-2">
          {bom.length > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              {bom.length} items
            </span>
          )}
          {hasAny && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs text-destructive/80 hover:text-destructive transition-colors px-1.5 py-0.5 rounded hover:bg-destructive/10"
                  data-ocid="bom.clear_all_button"
                  title="Clear all parts and reset scene"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="bom.clear_dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset the scene?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all selected parts, clear the 3D scene, and
                    reset all quantities to zero. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="bom.clear_cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="bom.clear_confirm_button"
                  >
                    Yes, reset scene
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {bom.length === 0 ? (
        <div
          className="flex flex-col items-center py-5 text-center"
          data-ocid="bom.empty_state"
        >
          <span className="text-2xl mb-2">📦</span>
          <p className="text-xs text-muted-foreground">
            No components selected yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/30">
          {bom.map((line, i) => (
            <div
              key={line.product.id}
              className="flex items-center gap-2 py-2"
              data-ocid={`bom.line.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {line.product.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {line.product.category} &times; {line.quantity}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-foreground shrink-0">
                {formatPrice(line.totalPrice)}
              </span>
            </div>
          ))}
        </div>
      )}

      {bom.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="font-mono font-bold text-foreground text-base">
            {formatPrice(total)}
          </span>
        </div>
      )}

      <Button
        type="button"
        disabled={!canAdd}
        onClick={handleAddToCart}
        className="w-full gap-2 mt-1"
        data-ocid="bom.add_kit_button"
      >
        <ShoppingCart className="w-4 h-4" />
        Add Complete Kit to Cart
      </Button>

      {!canAdd && store.environment && (
        <p className="text-xs text-muted-foreground text-center -mt-1">
          Select a base module to continue.
        </p>
      )}
      {!store.environment && (
        <p className="text-xs text-muted-foreground text-center -mt-1">
          Choose an environment to begin.
        </p>
      )}
    </div>
  );
}
