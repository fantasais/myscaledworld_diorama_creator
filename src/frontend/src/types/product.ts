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

/** Geometry hint for procedural placeholder in the 3D scene */
export type GeometryHint =
  | "box"
  | "cylinder"
  | "cone"
  | "sphere"
  | "flat_plane"
  | "thin_box";

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
  stlUrl: string | null; // null = use placeholder geometry
  geometryHint?: GeometryHint; // guides procedural placeholder shape
  layerType?: "base" | "floor" | "wall" | "accent" | "accessory";
  layerOrder?: number;
}
