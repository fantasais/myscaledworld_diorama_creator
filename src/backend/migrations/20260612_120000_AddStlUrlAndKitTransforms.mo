import Map "mo:core/Map";
import List "mo:core/List";

module {
  // ── Old types (from 20260612_000000_InitState) ─────────────────────────
  type Scale = { #scale1_64 };
  type Category = { #base; #wall; #structure; #accessory; #decal; #kit };
  type Environment = { #indianGarage; #indianFuelStation };
  type BomType = { #base; #wall; #structure; #accessory; #decal; #kit };

  type OldProduct = {
    id : Nat;
    name : Text;
    scale : Scale;
    category : Category;
    environments : [Environment];
    price : Nat;
    thumbnailPlaceholder : Text;
    description : Text;
    bomType : BomType;
  };

  type OldBomItem = {
    product : OldProduct;
    quantity : Nat;
    unitPrice : Nat;
    totalPrice : Nat;
  };

  type OldCartItemKind = {
    #singleProduct : { product : OldProduct };
    #configuredKit : {
      name : Text;
      environment : Environment;
      scale : Scale;
      bom : [OldBomItem];
      totalPrice : Nat;
    };
  };

  type OldCartItem = {
    id : Nat;
    kind : OldCartItemKind;
    quantity : Nat;
    subtotal : Nat;
  };

  type OldOrder = {
    id : Nat;
    contact : {
      firstName : Text;
      lastName : Text;
      email : Text;
      phone : Text;
    };
    shippingAddress : {
      line1 : Text;
      line2 : ?Text;
      city : Text;
      state : Text;
      pincode : Text;
      country : Text;
    };
    items : [OldCartItem];
    subtotal : Nat;
    paymentStatus : { #pending; #mockPaid };
    createdAt : Int;
  };

  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    state : { var nextProductId : Nat };
    cartItems : List.List<OldCartItem>;
    cartState : { var nextCartItemId : Nat };
    orders : Map.Map<Nat, OldOrder>;
    orderState : { var nextOrderId : Nat };
  };

  // ── New types ──────────────────────────────────────────────────────────
  type Product = {
    id : Nat;
    name : Text;
    scale : Scale;
    category : Category;
    environments : [Environment];
    price : Nat;
    thumbnailPlaceholder : Text;
    description : Text;
    bomType : BomType;
    stlUrl : ?Text;
  };

  type Transform3D = {
    posX : Float;
    posY : Float;
    posZ : Float;
    rotX : Float;
    rotY : Float;
    rotZ : Float;
  };

  type KitItem = {
    productId : Nat;
    quantity : Nat;
    transform : ?Transform3D;
  };

  type BomItem = {
    product : Product;
    quantity : Nat;
    unitPrice : Nat;
    totalPrice : Nat;
  };

  type ConfiguredKit = {
    name : Text;
    environment : Environment;
    scale : Scale;
    items : [KitItem];
    bom : [BomItem];
    totalPrice : Nat;
  };

  type CartItemKind = {
    #singleProduct : { product : Product };
    #configuredKit : ConfiguredKit;
  };

  type CartItem = {
    id : Nat;
    kind : CartItemKind;
    quantity : Nat;
    subtotal : Nat;
  };

  type Order = {
    id : Nat;
    contact : {
      firstName : Text;
      lastName : Text;
      email : Text;
      phone : Text;
    };
    shippingAddress : {
      line1 : Text;
      line2 : ?Text;
      city : Text;
      state : Text;
      pincode : Text;
      country : Text;
    };
    items : [CartItem];
    subtotal : Nat;
    paymentStatus : { #pending; #mockPaid };
    createdAt : Int;
  };

  type NewActor = {
    products : Map.Map<Nat, Product>;
    state : { var nextProductId : Nat };
    cartItems : List.List<CartItem>;
    cartState : { var nextCartItemId : Nat };
    orders : Map.Map<Nat, Order>;
    orderState : { var nextOrderId : Nat };
  };

  // ── Migration helpers ──────────────────────────────────────────────────
  func migrateProduct(p : OldProduct) : Product {
    { p with stlUrl = null }
  };

  func migrateBomItem(b : OldBomItem) : BomItem {
    { b with product = migrateProduct(b.product) }
  };

  func migrateCartItemKind(k : OldCartItemKind) : CartItemKind {
    switch k {
      case (#singleProduct { product }) {
        #singleProduct { product = migrateProduct(product) }
      };
      case (#configuredKit { name; environment; scale; bom; totalPrice }) {
        let newBom = bom.map(func(b) { migrateBomItem(b) });
        let newItems : [KitItem] = newBom.map<BomItem, KitItem>(func(b) {
          { productId = b.product.id; quantity = b.quantity; transform = null }
        });
        #configuredKit {
          name;
          environment;
          scale;
          items = newItems;
          bom = newBom;
          totalPrice;
        }
      };
    }
  };

  func migrateCartItem(c : OldCartItem) : CartItem {
    { c with kind = migrateCartItemKind(c.kind) }
  };

  func migrateOrder(o : OldOrder) : Order {
    { o with items = o.items.map<OldCartItem, CartItem>(func(c) { migrateCartItem(c) }) }
  };

  public func migration(old : OldActor) : NewActor {
    let newProducts = Map.empty<Nat, Product>();
    for ((k, p) in old.products.entries()) {
      newProducts.add(k, migrateProduct(p));
    };

    let newCartItems = old.cartItems.map<OldCartItem, CartItem>(func(c) { migrateCartItem(c) });

    let newOrders = Map.empty<Nat, Order>();
    for ((k, o) in old.orders.entries()) {
      newOrders.add(k, migrateOrder(o));
    };

    {
      products = newProducts;
      state = old.state;
      cartItems = newCartItems;
      cartState = old.cartState;
      orders = newOrders;
      orderState = old.orderState;
    };
  };
};
