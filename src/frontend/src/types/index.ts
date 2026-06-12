export type Scale = "1:64" | "1:18" | "1:12";

export type Environment = "indian_garage" | "indian_fuel_station";

export type Category =
  | "base"
  | "wall"
  | "structure"
  | "accessory"
  | "decal"
  | "kit";

export type BomType =
  | "base_module"
  | "wall_module"
  | "structure_module"
  | "accessory_item"
  | "decal_sheet"
  | "complete_kit";

export type GeometryHint = "box" | "cylinder" | "cone" | "sphere";

export interface Product {
  id: string;
  name: string;
  scale: Scale;
  category: Category;
  environments: Environment[];
  price: number; // in paise (INR * 100)
  thumbnailPlaceholder: string;
  description: string;
  bomType: BomType;
  layerType?: "base" | "floor" | "wall" | "accent" | "accessory";
  layerOrder?: number;
  stlUrl: string | null;
  geometryHint?: GeometryHint;
}

// ── 3D Transform ──────────────────────────────────────────────
export interface ItemTransform {
  posX: number;
  posY: number;
  posZ: number;
  rotY: number;
}

// ── Builder Store (replaces old ConfiguratorState) ────────────
export interface SelectedItem {
  product: Product;
  quantity: number;
  /** instanceKey = productId + ':' + instanceIndex (0-based) */
  transforms: Record<string, ItemTransform>;
}

export interface BuilderStore {
  environment: Environment | null;
  selectedBase: Product | null;
  selectedWall: Product | null;
  accessories: Record<string, SelectedItem>; // keyed by product.id
  setEnvironment: (env: Environment) => void;
  setBase: (product: Product | null) => void;
  setWall: (product: Product | null) => void;
  setAccessoryQty: (product: Product, qty: number) => void;
  updateTransform: (
    productId: string,
    instanceIndex: number,
    t: Partial<ItemTransform>,
  ) => void;
  reset: () => void;
}

// ── Configurator (legacy step flow kept for existing routes) ──
export type ConfiguratorStep =
  | "environment"
  | "base"
  | "walls"
  | "accessories"
  | "review";

export interface ConfiguratorState {
  step: ConfiguratorStep;
  environment: Environment | null;
  selectedBase: Product | null;
  selectedWall: Product | null;
  selectedAccessories: Product[];
  setStep: (step: ConfiguratorStep) => void;
  setEnvironment: (env: Environment) => void;
  setBase: (product: Product) => void;
  setWall: (product: Product) => void;
  toggleAccessory: (product: Product) => void;
  reset: () => void;
}

// ── Cart ──────────────────────────────────────────────────────
export type CartItemType = "product" | "configured_kit";

export interface BomLine {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CartItem {
  id: string; // deterministic uuid for the cart entry
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
    items: BomLine[],
    environment: Environment,
    scale: Scale,
  ) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: () => number;
}

// ── Order ─────────────────────────────────────────────────────
export interface ContactDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Order {
  orderId: string;
  contact: ContactDetails;
  shipping: ShippingAddress;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed";
  createdAt: string;
}
