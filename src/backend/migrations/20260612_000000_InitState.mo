import Map "mo:core/Map";
import List "mo:core/List";

module {
  type OldActor = {};

  type Scale = { #scale1_64 };
  type Category = { #base; #wall; #structure; #accessory; #decal; #kit };
  type Environment = { #indianGarage; #indianFuelStation };
  type BomType = { #base; #wall; #structure; #accessory; #decal; #kit };

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
  };

  type BomItem = {
    product : Product;
    quantity : Nat;
    unitPrice : Nat;
    totalPrice : Nat;
  };

  type CartItemKind = {
    #singleProduct : { product : Product };
    #configuredKit : {
      name : Text;
      environment : Environment;
      scale : Scale;
      bom : [BomItem];
      totalPrice : Nat;
    };
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

  func makeProduct(id : Nat, name : Text, category : Category, envs : [Environment], price : Nat, thumb : Text, desc : Text, bomType : BomType) : Product {
    { id; name; scale = #scale1_64; category; environments = envs; price; thumbnailPlaceholder = thumb; description = desc; bomType }
  };

  public func migration(_old : OldActor) : NewActor {
    let products = Map.empty<Nat, Product>();
    let garage : [Environment] = [#indianGarage];
    let fuel : [Environment] = [#indianFuelStation];
    var id : Nat = 0;
    let addP = func(name : Text, cat : Category, envs : [Environment], price : Nat, thumb : Text, desc : Text, bom : BomType) {
      products.add(id, makeProduct(id, name, cat, envs, price, thumb, desc, bom));
      id += 1;
    };
    // Indian Garage — Bases
    addP("Concrete Workshop Floor", #base, garage, 1200, "/placeholders/base-concrete.png", "Realistic concrete finish workshop floor tile for 1:64 scale garage dioramas.", #base);
    addP("Tiled Workshop Floor", #base, garage, 1400, "/placeholders/base-tiled.png", "Chequered workshop floor tile with contrast pattern, fits 1:64 garage builds.", #base);
    addP("Industrial Floor", #base, garage, 1100, "/placeholders/base-industrial.png", "Heavy-duty industrial floor base for utility garage dioramas.", #base);
    // Indian Garage — Walls
    addP("Plain Wall", #wall, garage, 800, "/placeholders/wall-plain.png", "Clean whitewashed wall panel for 1:64 garage builds.", #wall);
    addP("Corrugated Wall", #wall, garage, 950, "/placeholders/wall-corrugated.png", "Corrugated metal sheet wall panel — classic Indian workshop aesthetic.", #wall);
    addP("Brick Wall", #wall, garage, 1050, "/placeholders/wall-brick.png", "Exposed brick wall section for weathered garage scenes.", #wall);
    // Indian Garage — Accessories
    addP("Tool Cabinet", #accessory, garage, 600, "/placeholders/acc-toolcabinet.png", "Multi-drawer metal tool cabinet, scale-accurate for 1:64 dioramas.", #accessory);
    addP("Tyre Rack", #accessory, garage, 450, "/placeholders/acc-tyrerack.png", "Wall-mounted tyre storage rack with three slots.", #accessory);
    addP("Air Compressor", #accessory, garage, 550, "/placeholders/acc-compressor.png", "Portable air compressor unit, oil-finished cast resin.", #accessory);
    addP("Oil Drums", #accessory, garage, 350, "/placeholders/acc-oildrums.png", "Pair of 200-litre oil drums in weathered finish.", #accessory);
    addP("Two Post Lift", #accessory, garage, 1800, "/placeholders/acc-lift.png", "Scale two-post hydraulic car lift — highlight centrepiece for any garage diorama.", #accessory);
    addP("Workbench", #accessory, garage, 700, "/placeholders/acc-workbench.png", "Wooden workbench with pegboard tool panel, 1:64 scale.", #accessory);
    // Indian Fuel Station — Bases
    addP("Urban Forecourt Base", #base, fuel, 1300, "/placeholders/base-urban-forecourt.png", "Multi-lane paved forecourt base sized for 1:64 fuel station builds.", #base);
    addP("Highway Forecourt Base", #base, fuel, 1500, "/placeholders/base-highway-forecourt.png", "Wide highway-style forecourt base with extended apron.", #base);
    // Indian Fuel Station — Structures
    addP("Basic Canopy", #structure, fuel, 2200, "/placeholders/struct-basic-canopy.png", "Single-span fuel station canopy with corrugated roofing, 1:64.", #structure);
    addP("Highway Canopy", #structure, fuel, 2800, "/placeholders/struct-highway-canopy.png", "Wide-span highway canopy with dual-pitch roof and LED light bar recess.", #structure);
    // Indian Fuel Station — Accessories
    addP("Fuel Pump", #accessory, fuel, 900, "/placeholders/acc-fuelpump.png", "Twin-nozzle fuel dispenser unit with digital display panel.", #accessory);
    addP("Signboard", #accessory, fuel, 400, "/placeholders/acc-signboard.png", "Illuminated forecourt signboard with brand colour field.", #accessory);
    addP("Air Station", #accessory, fuel, 480, "/placeholders/acc-airstation.png", "Free-standing tyre inflation air station unit.", #accessory);
    addP("Safety Barriers", #accessory, fuel, 300, "/placeholders/acc-barriers.png", "Set of four plastic safety bollards for forecourt traffic management.", #accessory);
    addP("Utility Cabinet", #accessory, fuel, 520, "/placeholders/acc-utilitycabinet.png", "Lockable utility cabinet for forecourt equipment storage.", #accessory);
    {
      products;
      state = { var nextProductId = id };
      cartItems = List.empty<CartItem>();
      cartState = { var nextCartItemId = 0 };
      orders = Map.empty<Nat, Order>();
      orderState = { var nextOrderId = 0 };
    };
  };
};
