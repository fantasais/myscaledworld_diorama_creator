import type {
  BuilderStore,
  Environment,
  ItemTransform,
  Product,
  SavedProject,
  Scale,
  SceneObject,
  SelectedItem,
} from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_TRANSFORM: ItemTransform = { posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: 0, rotZ: 0 };

function uid(prefix = "project"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultTransformFor(product: Product, instanceIndex = 0): ItemTransform {
  if (product.defaultPosition || product.defaultRotation) {
    return {
      posX: product.defaultPosition?.x ?? instanceIndex * 1.5,
      posY: product.defaultPosition?.y ?? 0,
      posZ: product.defaultPosition?.z ?? instanceIndex * 0.5,
      rotX: product.defaultRotation?.x ?? 0,
      rotY: product.defaultRotation?.y ?? 0,
      rotZ: product.defaultRotation?.z ?? 0,
    };
  }

  if (product.category === "base") return { posX: 0, posY: -0.26, posZ: 0, rotX: 0, rotY: 0, rotZ: 0 };
  if (product.category === "wall" || product.category === "structure") {
    return { posX: 0, posY: 0.3, posZ: -2.5, rotX: 0, rotY: 0, rotZ: 0 };
  }

  return { ...DEFAULT_TRANSFORM, posX: instanceIndex * 1.5 - 1.5, posZ: instanceIndex * 0.5 };
}

function buildSceneObjects(state: {
  selectedBase: Product | null;
  selectedWall: Product | null;
  accessories: Record<string, SelectedItem>;
}): SceneObject[] {
  const objects: SceneObject[] = [];

  if (state.selectedBase) {
    objects.push({
      id: `${state.selectedBase.id}:base`,
      kind: "base",
      productId: state.selectedBase.id,
      product: state.selectedBase,
      instanceIndex: 0,
      quantity: 1,
      transform: defaultTransformFor(state.selectedBase, 0),
      locked: true,
    });
  }

  if (state.selectedWall) {
    objects.push({
      id: `${state.selectedWall.id}:wall`,
      kind: state.selectedWall.category === "structure" ? "structure" : "wall",
      productId: state.selectedWall.id,
      product: state.selectedWall,
      instanceIndex: 0,
      quantity: 1,
      transform: defaultTransformFor(state.selectedWall, 0),
      locked: true,
    });
  }

  for (const item of Object.values(state.accessories)) {
    for (let i = 0; i < item.quantity; i++) {
      const instanceId = `${item.product.id}:${i}`;
      objects.push({
        id: instanceId,
        kind: "accessory",
        productId: item.product.id,
        product: item.product,
        instanceIndex: i,
        quantity: 1,
        transform: item.transforms[instanceId] ?? defaultTransformFor(item.product, i),
      });
    }
  }

  return objects;
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      scale: "1:64",
      environment: null,
      selectedBase: null,
      selectedWall: null,
      accessories: {},
      savedProjects: [],
      activeProjectId: null,

      setScale(scale: Scale) {
        set({ scale });
      },

      setEnvironment(env: Environment) {
        set({
          environment: env,
          selectedBase: null,
          selectedWall: null,
          accessories: {},
          activeProjectId: null,
        });
      },

      setBase(product: Product | null) {
        set({ selectedBase: product, activeProjectId: null });
      },

      setWall(product: Product | null) {
        set({ selectedWall: product, activeProjectId: null });
      },

      setAccessoryQty(product: Product, qty: number) {
        if (qty <= 0) {
          set((state) => {
            const next = { ...state.accessories };
            delete next[product.id];
            return { accessories: next, activeProjectId: null };
          });
          return;
        }
        set((state) => {
          const existing: SelectedItem = state.accessories[product.id] ?? {
            product,
            quantity: 0,
            transforms: {},
          };
          const transforms = { ...existing.transforms };
          for (let i = 0; i < qty; i++) {
            const key = `${product.id}:${i}`;
            if (!transforms[key]) transforms[key] = defaultTransformFor(product, i);
          }
          for (const key of Object.keys(transforms)) {
            const idx = Number.parseInt(key.split(":")[1] ?? "0", 10);
            if (idx >= qty) delete transforms[key];
          }
          return {
            activeProjectId: null,
            accessories: {
              ...state.accessories,
              [product.id]: { product, quantity: qty, transforms },
            },
          };
        });
      },

      updateTransform(productId: string, instanceIndex: number, t: Partial<ItemTransform>) {
        set((state) => {
          const item = state.accessories[productId];
          if (!item) return state;
          const key = `${productId}:${instanceIndex}`;
          return {
            activeProjectId: null,
            accessories: {
              ...state.accessories,
              [productId]: {
                ...item,
                transforms: {
                  ...item.transforms,
                  [key]: {
                    ...(item.transforms[key] ?? defaultTransformFor(item.product, instanceIndex)),
                    ...t,
                  },
                },
              },
            },
          };
        });
      },

      removeAccessoryInstance(productId: string, instanceIndex: number) {
        set((state) => {
          const item = state.accessories[productId];
          if (!item) return state;

          const nextQuantity = Math.max(0, item.quantity - 1);
          const nextAccessories = { ...state.accessories };

          if (nextQuantity === 0) {
            delete nextAccessories[productId];
            return { accessories: nextAccessories, activeProjectId: null };
          }

          const nextTransforms: Record<string, ItemTransform> = {};
          let nextIndex = 0;
          for (let oldIndex = 0; oldIndex < item.quantity; oldIndex++) {
            if (oldIndex === instanceIndex) continue;
            const oldKey = `${productId}:${oldIndex}`;
            const newKey = `${productId}:${nextIndex}`;
            nextTransforms[newKey] =
              item.transforms[oldKey] ?? defaultTransformFor(item.product, nextIndex);
            nextIndex++;
          }

          nextAccessories[productId] = {
            ...item,
            quantity: nextQuantity,
            transforms: nextTransforms,
          };

          return { accessories: nextAccessories, activeProjectId: null };
        });
      },

      getSceneObjects() {
        return buildSceneObjects(get());
      },

      saveProject(name: string) {
        const now = new Date().toISOString();
        const state = get();
        const existingId = state.activeProjectId;
        const project: SavedProject = {
          id: existingId ?? uid(),
          name: name.trim() || "Untitled Diorama Project",
          scale: state.scale,
          environment: state.environment,
          selectedBase: state.selectedBase,
          selectedWall: state.selectedWall,
          accessories: state.accessories,
          sceneObjects: buildSceneObjects(state),
          createdAt:
            state.savedProjects.find((p) => p.id === existingId)?.createdAt ?? now,
          updatedAt: now,
        };

        set((current) => ({
          activeProjectId: project.id,
          savedProjects: [
            project,
            ...current.savedProjects.filter((p) => p.id !== project.id),
          ],
        }));

        return project;
      },

      loadProject(projectId: string) {
        const project = get().savedProjects.find((p) => p.id === projectId);
        if (!project) return;
        set({
          scale: project.scale,
          environment: project.environment,
          selectedBase: project.selectedBase,
          selectedWall: project.selectedWall,
          accessories: project.accessories,
          activeProjectId: project.id,
        });
      },

      deleteProject(projectId: string) {
        set((state) => ({
          savedProjects: state.savedProjects.filter((p) => p.id !== projectId),
          activeProjectId: state.activeProjectId === projectId ? null : state.activeProjectId,
        }));
      },

      reset() {
        set({
          scale: "1:64",
          environment: null,
          selectedBase: null,
          selectedWall: null,
          accessories: {},
          activeProjectId: null,
        });
      },
    }),
    { name: "msw-builder-v2-projects" },
  ),
);

