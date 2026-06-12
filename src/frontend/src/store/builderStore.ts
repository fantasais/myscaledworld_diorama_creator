import type {
  BuilderStore,
  Environment,
  ItemTransform,
  Product,
  SelectedItem,
} from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_TRANSFORM: ItemTransform = { posX: 0, posY: 0, posZ: 0, rotY: 0 };

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set) => ({
      environment: null,
      selectedBase: null,
      selectedWall: null,
      accessories: {},

      setEnvironment(env: Environment) {
        set({
          environment: env,
          selectedBase: null,
          selectedWall: null,
          accessories: {},
        });
      },

      setBase(product: Product | null) {
        set({ selectedBase: product });
      },

      setWall(product: Product | null) {
        set({ selectedWall: product });
      },

      setAccessoryQty(product: Product, qty: number) {
        if (qty <= 0) {
          set((state) => {
            const next = { ...state.accessories };
            delete next[product.id];
            return { accessories: next };
          });
          return;
        }
        set((state) => {
          const existing: SelectedItem = state.accessories[product.id] ?? {
            product,
            quantity: 0,
            transforms: {},
          };
          // build transforms for new instances
          const transforms = { ...existing.transforms };
          for (let i = 0; i < qty; i++) {
            const key = `${product.id}:${i}`;
            if (!transforms[key]) {
              transforms[key] = { ...DEFAULT_TRANSFORM, posX: i * 1.5 };
            }
          }
          // remove transforms for removed instances
          for (const key of Object.keys(transforms)) {
            const idx = Number.parseInt(key.split(":")[1] ?? "0", 10);
            if (idx >= qty) delete transforms[key];
          }
          return {
            accessories: {
              ...state.accessories,
              [product.id]: { product, quantity: qty, transforms },
            },
          };
        });
      },

      updateTransform(
        productId: string,
        instanceIndex: number,
        t: Partial<ItemTransform>,
      ) {
        set((state) => {
          const item = state.accessories[productId];
          if (!item) return state;
          const key = `${productId}:${instanceIndex}`;
          return {
            accessories: {
              ...state.accessories,
              [productId]: {
                ...item,
                transforms: {
                  ...item.transforms,
                  [key]: {
                    ...(item.transforms[key] ?? DEFAULT_TRANSFORM),
                    ...t,
                  },
                },
              },
            },
          };
        });
      },

      reset() {
        set({
          environment: null,
          selectedBase: null,
          selectedWall: null,
          accessories: {},
        });
      },
    }),
    { name: "msw-builder-v1" },
  ),
);
