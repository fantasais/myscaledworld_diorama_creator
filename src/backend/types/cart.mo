import Debug "mo:core/Debug";
import Common "common";
import Product "product";

module {
  /// Per-item 3D position and rotation in the configurator scene.
  public type Transform3D = {
    posX : Float;
    posY : Float;
    posZ : Float;
    rotX : Float;
    rotY : Float;
    rotZ : Float;
  };

  /// A single line in the kit's parts list — one product type at a given
  /// quantity and optional scene transform.
  public type KitItem = {
    productId : Common.ProductId;
    quantity : Nat;
    transform : ?Transform3D;
  };

  public type BomItem = {
    product : Product.Product;
    quantity : Nat;
    unitPrice : Nat;
    totalPrice : Nat;
  };

  /// A fully configured diorama kit with per-item quantities and transforms.
  public type ConfiguredKit = {
    name : Text;
    environment : Common.Environment;
    scale : Common.Scale;
    items : [KitItem];
    bom : [BomItem];
    totalPrice : Nat;
  };

  public type CartItemKind = {
    #singleProduct : { product : Product.Product };
    #configuredKit : ConfiguredKit;
  };

  public type CartItem = {
    id : Common.CartItemId;
    kind : CartItemKind;
    quantity : Nat;
    subtotal : Nat;
  };
};
