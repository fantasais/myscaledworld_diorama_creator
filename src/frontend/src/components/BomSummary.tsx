import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/products";
import { useBuilderStore } from "@/store/builderStore";
import { useCartStore } from "@/store/cartStore";
import type { BomLine } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

function buildBomLines(
  store: ReturnType<typeof useBuilderStore.getState>,
): BomLine[] {
  const lines: BomLine[] = [];
  if (store.selectedBase && store.baseQuantity > 0) {
    lines.push({
      product: store.selectedBase,
      quantity: store.baseQuantity,
      unitPrice: store.selectedBase.price,
      totalPrice: store.selectedBase.price * store.baseQuantity,
    });
  }
  if (store.selectedWall && store.wallQuantity > 0) {
    lines.push({
      product: store.selectedWall,
      quantity: store.wallQuantity,
      unitPrice: store.selectedWall.price,
      totalPrice: store.selectedWall.price * store.wallQuantity,
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
  const canAdd = !!store.environment && !!store.selectedBase && store.baseQuantity > 0;

  function handleAddToCart() {
    if (!store.environment) return;
    const sceneObjects = store.getSceneObjects();
    const activeProject = store.savedProjects.find(
      (project) => project.id === store.activeProjectId,
    );
    addConfiguredKit(
      bom,
      store.environment,
      store.scale,
      activeProject?.name,
      sceneObjects,
      store.activeProjectId,
    );
    store.reset();
    toast.success("Kit added to cart!", {
      description: "Your configured diorama kit is ready for checkout.",
    });
    navigate({ to: "/cart" });
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3 rounded-xl border border-border bg-card p-4"
      data-ocid="bom.panel"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Bill of Materials
        </h3>
        {bom.length > 0 && (
          <span className="font-mono text-xs text-muted-foreground">
            {bom.length} BOM lines · {store.getSceneObjects().length} scene objects
          </span>
        )}
      </div>

      {bom.length === 0 ? (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center py-5 text-center"
          data-ocid="bom.empty_state"
        >
          <span className="text-2xl mb-2">📦</span>
          <p className="text-xs text-muted-foreground">
            No components selected yet.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 divide-y divide-border/30">
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

