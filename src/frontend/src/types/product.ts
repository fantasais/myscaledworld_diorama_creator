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
  price: number;
  thumbnailPlaceholder: string;
  description: string;
  bomType: BomType;
  stlUrl: string | null;
  geometryHint?: GeometryHint;
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

