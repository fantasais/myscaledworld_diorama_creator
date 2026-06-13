export type Scale = "1:64" | "1:43" | "1:18" | "1:12";

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

/** Geometry hint for procedural placeholder in the 3D scene. */
export type GeometryHint =
  | "box"
  | "cylinder"
  | "cone"
  | "sphere"
  | "flat_plane"
  | "thin_box";

export interface Vector3Tuple {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox3D {
  width: number;
  height: number;
  depth: number;
}

export interface SnapPoint {
  id: string;
  label: string;
  position: Vector3Tuple;
  rotation?: Vector3Tuple;
  accepts?: Category[];
}

export type CollisionType = "none" | "soft" | "solid";

export interface Product {
  id: string;
  name: string;
  sku?: string;
  scale: Scale;
  category: Category;
  subCategory?: string;
  environments: Environment[];
  price: number; // in paise (INR * 100)
  thumbnailPlaceholder: string;
  description: string;
  bomType: BomType;

  /** STL model path or uploaded object URL. null = procedural placeholder. */
  stlUrl: string | null;
  geometryHint?: GeometryHint;

  /** Scene metadata. Store this now so snapping/collision can come later without data surgery. */
  defaultPosition?: Vector3Tuple;
  defaultRotation?: Vector3Tuple;
  boundingBox?: BoundingBox3D;
  snapPoints?: SnapPoint[];
  collisionType?: CollisionType;
  assemblyCompatible?: boolean;
  tags?: string[];
  vendor?: string;
  material?: string;
  printTimeMinutes?: number;
  supportRequired?: boolean;

  layerType?: "base" | "floor" | "wall" | "accent" | "accessory";
  layerOrder?: number;
}

// ── 3D Transform ──────────────────────────────────────────────
export interface ItemTransform {
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
}

export type SceneObjectKind = "base" | "wall" | "structure" | "accessory";

export interface SceneObject {
  id: string; // stable instance id: productId:kind:index
  kind: SceneObjectKind;
  productId: string;
  product: Product;
  instanceIndex: number;
  quantity: number;
  transform: ItemTransform;
  locked?: boolean;
}

// ── Builder Store ─────────────────────────────────────────────
export interface SelectedItem {
  product: Product;
  quantity: number;
  /** instanceKey = productId + ':' + instanceIndex (0-based) */
  transforms: Record<string, ItemTransform>;
}

export interface SavedProject {
  id: string;
  name: string;
  scale: Scale;
  environment: Environment | null;
  selectedBase: Product | null;
  selectedWall: Product | null;
  baseQuantity: number;
  wallQuantity: number;
  baseTransforms: Record<string, ItemTransform>;
  wallTransforms: Record<string, ItemTransform>;
  accessories: Record<string, SelectedItem>;
  sceneObjects: SceneObject[];
  createdAt: string;
  updatedAt: string;
}

export interface BuilderStore {
  scale: Scale;
  environment: Environment | null;
  selectedBase: Product | null;
  selectedWall: Product | null;
  baseQuantity: number;
  wallQuantity: number;
  baseTransforms: Record<string, ItemTransform>;
  wallTransforms: Record<string, ItemTransform>;
  accessories: Record<string, SelectedItem>; // keyed by product.id
  savedProjects: SavedProject[];
  activeProjectId: string | null;
  setScale: (scale: Scale) => void;
  setEnvironment: (env: Environment) => void;
  setBase: (product: Product | null) => void;
  setWall: (product: Product | null) => void;
  setBaseQty: (product: Product, qty: number) => void;
  setWallQty: (product: Product, qty: number) => void;
  setAccessoryQty: (product: Product, qty: number) => void;
  updateTransform: (
    productId: string,
    instanceIndex: number,
    t: Partial<ItemTransform>,
  ) => void;
  updateSceneObjectTransform: (
    kind: SceneObjectKind,
    productId: string,
    instanceIndex: number,
    t: Partial<ItemTransform>,
  ) => void;
  removeAccessoryInstance: (productId: string, instanceIndex: number) => void;
  removeSceneObjectInstance: (
    kind: SceneObjectKind,
    productId: string,
    instanceIndex: number,
  ) => void;
  getSceneObjects: () => SceneObject[];
  saveProject: (name: string) => SavedProject;
  loadProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;
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
  id: string;
  type: CartItemType;
  kitName?: string;
  projectId?: string | null;
  sceneObjects?: SceneObject[];
  environment?: Environment;
  scale?: Scale;
  bom?: BomLine[];
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
    kitName?: string,
    sceneObjects?: SceneObject[],
    projectId?: string | null,
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

