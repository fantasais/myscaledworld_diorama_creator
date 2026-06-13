import type {
  BuilderStore,
  Environment,
  ItemTransform,
  Product,
  SavedProject,
  Scale,
  SceneObject,
  SceneObjectKind,
  SelectedItem,
} from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEFAULT_TRANSFORM: ItemTransform = {
  posX: 0,
  posY: 0,
  posZ: 0,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
};

function uid(prefix = "project"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function instanceKey(productId: string, instanceIndex: number): string {
  return `${productId}:${instanceIndex}`;
}

function clampQty(qty: number, max = 99): number {
  return Math.max(0, Math.min(max, Number.isFinite(qty) ? Math.floor(qty) : 0));
}

function baseSpacing(product: Product | null): number {
  return (product?.boundingBox?.width ?? 5.5) + 0.08;
}

function baseDepth(product: Product | null): number {
  return product?.boundingBox?.depth ?? 4;
}

function defaultAccessoryTransform(product: Product, instanceIndex = 0): ItemTransform {
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

  return {
    ...DEFAULT_TRANSFORM,
    posX: instanceIndex * 1.5 - 1.5,
    posZ: instanceIndex * 0.5,
  };
}

function defaultBaseTransform(product: Product, instanceIndex: number, baseQuantity: number): ItemTransform {
  const spacing = baseSpacing(product);
  const startX = -((baseQuantity - 1) * spacing) / 2;
  return {
    posX: startX + instanceIndex * spacing,
    posY: -0.26,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  };
}

function defaultWallTransform(
  product: Product,
  instanceIndex: number,
  baseProduct: Product | null,
  baseQuantity: number,
): ItemTransform {
  const activeBaseQuantity = Math.max(1, baseQuantity);
  const spacing = baseSpacing(baseProduct ?? product);
  const depth = baseDepth(baseProduct);
  const totalWidth = activeBaseQuantity * spacing;
  const firstBackPanelX = -totalWidth / 2 + spacing / 2;

  // First wall modules line the rear side, one panel per base unit.
  if (instanceIndex < activeBaseQuantity) {
    return {
      posX: firstBackPanelX + instanceIndex * spacing,
      posY: 0.65,
      posZ: -depth / 2,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
    };
  }

  // Then add side walls to sell the modular 3-sided diorama idea.
  if (instanceIndex === activeBaseQuantity) {
    return {
      posX: -totalWidth / 2,
      posY: 0.65,
      posZ: 0,
      rotX: 0,
      rotY: Math.PI / 2,
      rotZ: 0,
    };
  }

  if (instanceIndex === activeBaseQuantity + 1) {
    return {
      posX: totalWidth / 2,
      posY: 0.65,
      posZ: 0,
      rotX: 0,
      rotY: -Math.PI / 2,
      rotZ: 0,
    };
  }

  // Extra wall modules continue rear-wall extension.
  const extraIndex = instanceIndex - (activeBaseQuantity + 2);
  return {
    posX: totalWidth / 2 + spacing / 2 + extraIndex * spacing,
    posY: 0.65,
    posZ: -depth / 2,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
  };
}

function normaliseTransforms(
  product: Product,
  quantity: number,
  existing: Record<string, ItemTransform>,
  fallback: (index: number) => ItemTransform,
): Record<string, ItemTransform> {
  const transforms: Record<string, ItemTransform> = {};
  for (let i = 0; i < quantity; i++) {
    const key = instanceKey(product.id, i);
    transforms[key] = existing[key] ?? fallback(i);
  }
  return transforms;
}

function reindexTransformsAfterRemoval(
  productId: string,
  quantity: number,
  removeIndex: number,
  existing: Record<string, ItemTransform>,
): Record<string, ItemTransform> {
  const next: Record<string, ItemTransform> = {};
  let nextIndex = 0;
  for (let oldIndex = 0; oldIndex < quantity; oldIndex++) {
    if (oldIndex === removeIndex) continue;
    const oldKey = instanceKey(productId, oldIndex);
    const newKey = instanceKey(productId, nextIndex);
    if (existing[oldKey]) next[newKey] = existing[oldKey];
    nextIndex++;
  }
  return next;
}

function buildSceneObjects(state: {
  selectedBase: Product | null;
  selectedWall: Product | null;
  baseQuantity: number;
  wallQuantity: number;
  baseTransforms: Record<string, ItemTransform>;
  wallTransforms: Record<string, ItemTransform>;
  accessories: Record<string, SelectedItem>;
}): SceneObject[] {
  const objects: SceneObject[] = [];

  if (state.selectedBase && state.baseQuantity > 0) {
    const transforms = normaliseTransforms(
      state.selectedBase,
      state.baseQuantity,
      state.baseTransforms,
      (i) => defaultBaseTransform(state.selectedBase as Product, i, state.baseQuantity),
    );

    for (let i = 0; i < state.baseQuantity; i++) {
      const key = instanceKey(state.selectedBase.id, i);
      objects.push({
        id: `${state.selectedBase.id}:base:${i}`,
        kind: "base",
        productId: state.selectedBase.id,
        product: state.selectedBase,
        instanceIndex: i,
        quantity: 1,
        transform: transforms[key] ?? defaultBaseTransform(state.selectedBase, i, state.baseQuantity),
      });
    }
  }

  if (state.selectedWall && state.wallQuantity > 0) {
    const kind: SceneObjectKind = state.selectedWall.category === "structure" ? "structure" : "wall";
    const transforms = normaliseTransforms(
      state.selectedWall,
      state.wallQuantity,
      state.wallTransforms,
      (i) => defaultWallTransform(state.selectedWall as Product, i, state.selectedBase, state.baseQuantity),
    );

    for (let i = 0; i < state.wallQuantity; i++) {
      const key = instanceKey(state.selectedWall.id, i);
      objects.push({
        id: `${state.selectedWall.id}:${kind}:${i}`,
        kind,
        productId: state.selectedWall.id,
        product: state.selectedWall,
        instanceIndex: i,
        quantity: 1,
        transform: transforms[key] ?? defaultWallTransform(state.selectedWall, i, state.selectedBase, state.baseQuantity),
      });
    }
  }

  for (const item of Object.values(state.accessories)) {
    for (let i = 0; i < item.quantity; i++) {
      const key = instanceKey(item.product.id, i);
      objects.push({
        id: `${item.product.id}:accessory:${i}`,
        kind: "accessory",
        productId: item.product.id,
        product: item.product,
        instanceIndex: i,
        quantity: 1,
        transform: item.transforms[key] ?? defaultAccessoryTransform(item.product, i),
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
      baseQuantity: 0,
      wallQuantity: 0,
      baseTransforms: {},
      wallTransforms: {},
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
          baseQuantity: 0,
          wallQuantity: 0,
          baseTransforms: {},
          wallTransforms: {},
          accessories: {},
          activeProjectId: null,
        });
      },

      setBase(product: Product | null) {
        if (!product) {
          set({ selectedBase: null, baseQuantity: 0, baseTransforms: {}, activeProjectId: null });
          return;
        }
        set((state) => {
          const qty = state.selectedBase?.id === product.id ? Math.max(1, state.baseQuantity) : 1;
          return {
            selectedBase: product,
            baseQuantity: qty,
            baseTransforms: normaliseTransforms(product, qty, {}, (i) => defaultBaseTransform(product, i, qty)),
            activeProjectId: null,
          };
        });
      },

      setWall(product: Product | null) {
        if (!product) {
          set({ selectedWall: null, wallQuantity: 0, wallTransforms: {}, activeProjectId: null });
          return;
        }
        set((state) => {
          const qty = state.selectedWall?.id === product.id ? Math.max(1, state.wallQuantity) : 1;
          return {
            selectedWall: product,
            wallQuantity: qty,
            wallTransforms: normaliseTransforms(product, qty, {}, (i) =>
              defaultWallTransform(product, i, state.selectedBase, state.baseQuantity),
            ),
            activeProjectId: null,
          };
        });
      },

      setBaseQty(product: Product, qty: number) {
        const nextQty = clampQty(qty, 24);
        set((state) => {
          if (nextQty <= 0) {
            if (state.selectedBase?.id !== product.id) return state;
            return { selectedBase: null, baseQuantity: 0, baseTransforms: {}, activeProjectId: null };
          }
          const existing = state.selectedBase?.id === product.id ? state.baseTransforms : {};
          return {
            selectedBase: product,
            baseQuantity: nextQty,
            baseTransforms: normaliseTransforms(product, nextQty, existing, (i) =>
              defaultBaseTransform(product, i, nextQty),
            ),
            activeProjectId: null,
          };
        });
      },

      setWallQty(product: Product, qty: number) {
        const nextQty = clampQty(qty, 24);
        set((state) => {
          if (nextQty <= 0) {
            if (state.selectedWall?.id !== product.id) return state;
            return { selectedWall: null, wallQuantity: 0, wallTransforms: {}, activeProjectId: null };
          }
          const existing = state.selectedWall?.id === product.id ? state.wallTransforms : {};
          return {
            selectedWall: product,
            wallQuantity: nextQty,
            wallTransforms: normaliseTransforms(product, nextQty, existing, (i) =>
              defaultWallTransform(product, i, state.selectedBase, state.baseQuantity),
            ),
            activeProjectId: null,
          };
        });
      },

      setAccessoryQty(product: Product, qty: number) {
        const nextQty = clampQty(qty);
        if (nextQty <= 0) {
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
          return {
            activeProjectId: null,
            accessories: {
              ...state.accessories,
              [product.id]: {
                product,
                quantity: nextQty,
                transforms: normaliseTransforms(product, nextQty, existing.transforms, (i) =>
                  defaultAccessoryTransform(product, i),
                ),
              },
            },
          };
        });
      },

      updateTransform(productId: string, instanceIndex: number, t: Partial<ItemTransform>) {
        get().updateSceneObjectTransform("accessory", productId, instanceIndex, t);
      },

      updateSceneObjectTransform(
        kind: SceneObjectKind,
        productId: string,
        instanceIndex: number,
        t: Partial<ItemTransform>,
      ) {
        set((state) => {
          const key = instanceKey(productId, instanceIndex);

          if (kind === "base" && state.selectedBase?.id === productId) {
            return {
              activeProjectId: null,
              baseTransforms: {
                ...state.baseTransforms,
                [key]: {
                  ...(state.baseTransforms[key] ?? defaultBaseTransform(state.selectedBase, instanceIndex, state.baseQuantity)),
                  ...t,
                },
              },
            };
          }

          if ((kind === "wall" || kind === "structure") && state.selectedWall?.id === productId) {
            return {
              activeProjectId: null,
              wallTransforms: {
                ...state.wallTransforms,
                [key]: {
                  ...(state.wallTransforms[key] ??
                    defaultWallTransform(state.selectedWall, instanceIndex, state.selectedBase, state.baseQuantity)),
                  ...t,
                },
              },
            };
          }

          const item = state.accessories[productId];
          if (!item) return state;
          return {
            activeProjectId: null,
            accessories: {
              ...state.accessories,
              [productId]: {
                ...item,
                transforms: {
                  ...item.transforms,
                  [key]: {
                    ...(item.transforms[key] ?? defaultAccessoryTransform(item.product, instanceIndex)),
                    ...t,
                  },
                },
              },
            },
          };
        });
      },

      removeAccessoryInstance(productId: string, instanceIndex: number) {
        get().removeSceneObjectInstance("accessory", productId, instanceIndex);
      },

      removeSceneObjectInstance(kind: SceneObjectKind, productId: string, instanceIndex: number) {
        set((state) => {
          if (kind === "base" && state.selectedBase?.id === productId) {
            const nextQty = Math.max(0, state.baseQuantity - 1);
            if (nextQty === 0) {
              return { selectedBase: null, baseQuantity: 0, baseTransforms: {}, activeProjectId: null };
            }
            const reindexed = reindexTransformsAfterRemoval(productId, state.baseQuantity, instanceIndex, state.baseTransforms);
            return {
              baseQuantity: nextQty,
              baseTransforms: normaliseTransforms(state.selectedBase, nextQty, reindexed, (i) =>
                defaultBaseTransform(state.selectedBase as Product, i, nextQty),
              ),
              activeProjectId: null,
            };
          }

          if ((kind === "wall" || kind === "structure") && state.selectedWall?.id === productId) {
            const nextQty = Math.max(0, state.wallQuantity - 1);
            if (nextQty === 0) {
              return { selectedWall: null, wallQuantity: 0, wallTransforms: {}, activeProjectId: null };
            }
            const reindexed = reindexTransformsAfterRemoval(productId, state.wallQuantity, instanceIndex, state.wallTransforms);
            return {
              wallQuantity: nextQty,
              wallTransforms: normaliseTransforms(state.selectedWall, nextQty, reindexed, (i) =>
                defaultWallTransform(state.selectedWall as Product, i, state.selectedBase, state.baseQuantity),
              ),
              activeProjectId: null,
            };
          }

          const item = state.accessories[productId];
          if (!item) return state;

          const nextQuantity = Math.max(0, item.quantity - 1);
          const nextAccessories = { ...state.accessories };

          if (nextQuantity === 0) {
            delete nextAccessories[productId];
            return { accessories: nextAccessories, activeProjectId: null };
          }

          const nextTransforms = reindexTransformsAfterRemoval(productId, item.quantity, instanceIndex, item.transforms);
          nextAccessories[productId] = {
            ...item,
            quantity: nextQuantity,
            transforms: normaliseTransforms(item.product, nextQuantity, nextTransforms, (i) =>
              defaultAccessoryTransform(item.product, i),
            ),
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
          baseQuantity: state.baseQuantity,
          wallQuantity: state.wallQuantity,
          baseTransforms: state.baseTransforms,
          wallTransforms: state.wallTransforms,
          accessories: state.accessories,
          sceneObjects: buildSceneObjects(state),
          createdAt: state.savedProjects.find((p) => p.id === existingId)?.createdAt ?? now,
          updatedAt: now,
        };

        set((current) => ({
          activeProjectId: project.id,
          savedProjects: [project, ...current.savedProjects.filter((p) => p.id !== project.id)],
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
          baseQuantity: project.baseQuantity ?? (project.selectedBase ? 1 : 0),
          wallQuantity: project.wallQuantity ?? (project.selectedWall ? 1 : 0),
          baseTransforms: project.baseTransforms ?? {},
          wallTransforms: project.wallTransforms ?? {},
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
          baseQuantity: 0,
          wallQuantity: 0,
          baseTransforms: {},
          wallTransforms: {},
          accessories: {},
          activeProjectId: null,
        });
      },
    }),
    { name: "msw-builder-v2-projects" },
  ),
);

