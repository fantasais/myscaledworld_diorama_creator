import type { Environment, Product, Scale } from "./product";

export interface Transform3D {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

export const DEFAULT_TRANSFORM: Transform3D = {
  posX: 0,
  posY: 0,
  posZ: 0,
  rotX: 0,
  rotY: 0,
  rotZ: 0,
};

export interface KitItem {
  productId: string;
  quantity: number;
  transform: Transform3D | null;
}

export interface BomLine {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ConfiguredKit {
  name: string;
  environment: Environment;
  scale: Scale;
  items: KitItem[];
  bom: BomLine[];
  totalPrice: number;
}

export type CartItemType = "product" | "configured_kit";

export interface CartItem {
  id: string;
  type: CartItemType;
  // for configured_kit
  kitName?: string;
  environment?: Environment;
  scale?: Scale;
  bom?: BomLine[];
  // for individual product
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartState {
  items: CartItem[];
  addProduct: (product: Product, qty?: number) => void;
  addConfiguredKit: (
    bom: BomLine[],
    environment: Environment,
    scale: Scale,
    kitName?: string,
  ) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}
