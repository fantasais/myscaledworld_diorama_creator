import type { BomLine, CartItem, CartState, Environment, Scale, SceneObject } from "@/types";
import { create } from "zustand";

let _counter = 0;
function uid(): string {
  return `cart-${Date.now()}-${++_counter}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addProduct(product, qty = 1) {
    set((state) => {
      const existing = state.items.find(
        (i) => i.type === "product" && i.product?.id === product.id,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === existing.id
              ? {
                  ...i,
                  quantity: i.quantity + qty,
                  totalPrice: (i.quantity + qty) * i.unitPrice,
                }
              : i,
          ),
        };
      }
      const item: CartItem = {
        id: uid(),
        type: "product",
        product,
        quantity: qty,
        unitPrice: product.price,
        totalPrice: product.price * qty,
      };
      return { items: [...state.items, item] };
    });
  },

  addConfiguredKit(
    bom: BomLine[],
    environment: Environment,
    scale: Scale,
    kitName?: string,
    sceneObjects: SceneObject[] = [],
    projectId: string | null = null,
  ) {
    const total = bom.reduce((sum, l) => sum + l.totalPrice, 0);
    const envLabel =
      environment === "indian_garage" ? "Indian Garage" : "Indian Fuel Station";
    const item: CartItem = {
      id: uid(),
      type: "configured_kit",
      kitName: kitName ?? `${envLabel} Diorama Kit`,
      projectId,
      sceneObjects,
      environment,
      scale,
      bom,
      quantity: 1,
      unitPrice: total,
      totalPrice: total,
    };
    set((state) => ({ items: [...state.items, item] }));
  },

  updateQuantity(id: string, qty: number) {
    if (qty < 1) return;
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? { ...i, quantity: qty, totalPrice: i.unitPrice * qty }
          : i,
      ),
    }));
  },

  removeItem(id: string) {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  clearCart() {
    set({ items: [] });
  },

  total() {
    return get().items.reduce((sum, i) => sum + i.totalPrice, 0);
  },
}));

