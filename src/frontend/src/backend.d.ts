import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type OrderId = bigint;
export type CartItemId = bigint;
export type Timestamp = bigint;
export interface CartItem {
    id: CartItemId;
    kind: CartItemKind;
    quantity: bigint;
    subtotal: bigint;
}
export interface BomItem {
    quantity: bigint;
    unitPrice: bigint;
    totalPrice: bigint;
    product: Product;
}
export interface ShippingAddress {
    country: string;
    city: string;
    line1: string;
    line2?: string;
    state: string;
    pincode: string;
}
export interface Order {
    id: OrderId;
    paymentStatus: PaymentStatus;
    contact: ContactDetails;
    createdAt: Timestamp;
    shippingAddress: ShippingAddress;
    items: Array<CartItem>;
    subtotal: bigint;
}
export interface ConfiguredKit {
    bom: Array<BomItem>;
    name: string;
    scale: Scale;
    environment: Environment;
    items: Array<KitItem>;
    totalPrice: bigint;
}
export type CartItemKind = {
    __kind__: "configuredKit";
    configuredKit: ConfiguredKit;
} | {
    __kind__: "singleProduct";
    singleProduct: {
        product: Product;
    };
};
export interface KitItem {
    transform?: Transform3D;
    productId: ProductId;
    quantity: bigint;
}
export interface ContactDetails {
    email: string;
    phone: string;
    lastName: string;
    firstName: string;
}
export interface Transform3D {
    posX: number;
    posY: number;
    posZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
}
export type ProductId = bigint;
export interface Product {
    id: ProductId;
    stlUrl?: string;
    bomType: BomType;
    name: string;
    description: string;
    scale: Scale;
    thumbnailPlaceholder: string;
    category: Category;
    price: bigint;
    environments: Array<Environment>;
}
export enum BomType {
    kit = "kit",
    accessory = "accessory",
    base = "base",
    structure = "structure",
    wall = "wall",
    decal = "decal"
}
export enum Environment {
    indianGarage = "indianGarage",
    indianFuelStation = "indianFuelStation"
}
export enum PaymentStatus {
    pending = "pending",
    mockPaid = "mockPaid"
}
export enum Scale {
    scale1_64 = "scale1_64"
}
export interface backendInterface {
    addKitToCart(kit: ConfiguredKit): Promise<CartItemId>;
    addProductToCart(productId: ProductId, quantity: bigint): Promise<CartItemId>;
    getCart(): Promise<Array<CartItem>>;
    getCartSubtotal(): Promise<bigint>;
    getOrder(id: OrderId): Promise<Order | null>;
    getProductById(id: ProductId): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: Category): Promise<Array<Product>>;
    getProductsByEnvironment(env: Environment): Promise<Array<Product>>;
    placeOrder(contact: ContactDetails, address: ShippingAddress): Promise<Order>;
    removeFromCart(itemId: CartItemId): Promise<boolean>;
    setProductStlUrl(id: ProductId, stlUrl: string | null): Promise<boolean>;
    updateCartItemQuantity(itemId: CartItemId, quantity: bigint): Promise<boolean>;
}
