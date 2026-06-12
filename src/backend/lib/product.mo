import Map "mo:core/Map";
import Types "../types/product";
import Common "../types/common";

module {
  public type Counter = { var nextProductId : Nat };

  public type State = {
    products : Map.Map<Common.ProductId, Types.Product>;
    counter : Counter;
  };

  public func allProducts(state : State) : [Types.Product] {
    state.products.values().toArray()
  };

  public func getProduct(state : State, id : Common.ProductId) : ?Types.Product {
    state.products.get(id)
  };

  public func productsByEnvironment(state : State, env : Common.Environment) : [Types.Product] {
    state.products.values().filter(
      func(p : Types.Product) : Bool {
        var found = false;
        for (e in p.environments.vals()) {
          if (e == env) { found := true };
        };
        found
      }
    ).toArray()
  };

  public func productsByCategory(state : State, category : Common.Category) : [Types.Product] {
    state.products.values().filter(
      func(p : Types.Product) : Bool { p.category == category }
    ).toArray()
  };

  func nextId(state : State) : Common.ProductId {
    let id = state.counter.nextProductId;
    state.counter.nextProductId += 1;
    id
  };

  func addProduct(state : State, p : Types.Product) : () {
    state.products.add(p.id, p)
  };

  /// Update the stlUrl for an existing product. Returns false if not found.
  public func updateStlUrl(state : State, id : Common.ProductId, url : ?Text) : Bool {
    switch (state.products.get(id)) {
      case null { false };
      case (?existing) {
        state.products.add(id, { existing with stlUrl = url });
        true
      };
    }
  };

  public func seedProducts(state : State) : () {
    // Only seed if empty
    if (state.products.size() > 0) return;

    let noStl : ?Text = null;

    // ── Indian Garage ──────────────────────────────────────────────────────
    // Bases
    addProduct(state, { id = nextId(state); name = "Concrete Workshop Floor"; scale = #scale1_64; category = #base; environments = [#indianGarage]; price = 1200; thumbnailPlaceholder = "/placeholders/base-concrete.png"; description = "Realistic concrete finish workshop floor tile for 1:64 scale garage dioramas."; bomType = #base; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Tiled Workshop Floor"; scale = #scale1_64; category = #base; environments = [#indianGarage]; price = 1400; thumbnailPlaceholder = "/placeholders/base-tiled.png"; description = "Chequered workshop floor tile with contrast pattern, fits 1:64 garage builds."; bomType = #base; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Industrial Floor"; scale = #scale1_64; category = #base; environments = [#indianGarage]; price = 1100; thumbnailPlaceholder = "/placeholders/base-industrial.png"; description = "Heavy-duty industrial floor base for utility garage dioramas."; bomType = #base; stlUrl = noStl });

    // Walls
    addProduct(state, { id = nextId(state); name = "Plain Wall"; scale = #scale1_64; category = #wall; environments = [#indianGarage]; price = 800; thumbnailPlaceholder = "/placeholders/wall-plain.png"; description = "Clean whitewashed wall panel for 1:64 garage builds."; bomType = #wall; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Corrugated Wall"; scale = #scale1_64; category = #wall; environments = [#indianGarage]; price = 950; thumbnailPlaceholder = "/placeholders/wall-corrugated.png"; description = "Corrugated metal sheet wall panel — classic Indian workshop aesthetic."; bomType = #wall; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Brick Wall"; scale = #scale1_64; category = #wall; environments = [#indianGarage]; price = 1050; thumbnailPlaceholder = "/placeholders/wall-brick.png"; description = "Exposed brick wall section for weathered garage scenes."; bomType = #wall; stlUrl = noStl });

    // Accessories
    addProduct(state, { id = nextId(state); name = "Tool Cabinet"; scale = #scale1_64; category = #accessory; environments = [#indianGarage]; price = 600; thumbnailPlaceholder = "/placeholders/acc-toolcabinet.png"; description = "Multi-drawer metal tool cabinet, scale-accurate for 1:64 dioramas."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Tyre Rack"; scale = #scale1_64; category = #accessory; environments = [#indianGarage]; price = 450; thumbnailPlaceholder = "/placeholders/acc-tyrerack.png"; description = "Wall-mounted tyre storage rack with three slots."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Air Compressor"; scale = #scale1_64; category = #accessory; environments = [#indianGarage]; price = 550; thumbnailPlaceholder = "/placeholders/acc-compressor.png"; description = "Portable air compressor unit, oil-finished cast resin."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Oil Drums"; scale = #scale1_64; category = #accessory; environments = [#indianGarage]; price = 350; thumbnailPlaceholder = "/placeholders/acc-oildrums.png"; description = "Pair of 200-litre oil drums in weathered finish."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Two Post Lift"; scale = #scale1_64; category = #accessory; environments = [#indianGarage]; price = 1800; thumbnailPlaceholder = "/placeholders/acc-lift.png"; description = "Scale two-post hydraulic car lift — highlight centrepiece for any garage diorama."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Workbench"; scale = #scale1_64; category = #accessory; environments = [#indianGarage]; price = 700; thumbnailPlaceholder = "/placeholders/acc-workbench.png"; description = "Wooden workbench with pegboard tool panel, 1:64 scale."; bomType = #accessory; stlUrl = noStl });

    // ── Indian Fuel Station ──────────────────────────────────────────────
    // Bases
    addProduct(state, { id = nextId(state); name = "Urban Forecourt Base"; scale = #scale1_64; category = #base; environments = [#indianFuelStation]; price = 1300; thumbnailPlaceholder = "/placeholders/base-urban-forecourt.png"; description = "Multi-lane paved forecourt base sized for 1:64 fuel station builds."; bomType = #base; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Highway Forecourt Base"; scale = #scale1_64; category = #base; environments = [#indianFuelStation]; price = 1500; thumbnailPlaceholder = "/placeholders/base-highway-forecourt.png"; description = "Wide highway-style forecourt base with extended apron."; bomType = #base; stlUrl = noStl });

    // Structures
    addProduct(state, { id = nextId(state); name = "Basic Canopy"; scale = #scale1_64; category = #structure; environments = [#indianFuelStation]; price = 2200; thumbnailPlaceholder = "/placeholders/struct-basic-canopy.png"; description = "Single-span fuel station canopy with corrugated roofing, 1:64."; bomType = #structure; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Highway Canopy"; scale = #scale1_64; category = #structure; environments = [#indianFuelStation]; price = 2800; thumbnailPlaceholder = "/placeholders/struct-highway-canopy.png"; description = "Wide-span highway canopy with dual-pitch roof and LED light bar recess."; bomType = #structure; stlUrl = noStl });

    // Accessories
    addProduct(state, { id = nextId(state); name = "Fuel Pump"; scale = #scale1_64; category = #accessory; environments = [#indianFuelStation]; price = 900; thumbnailPlaceholder = "/placeholders/acc-fuelpump.png"; description = "Twin-nozzle fuel dispenser unit with digital display panel."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Signboard"; scale = #scale1_64; category = #accessory; environments = [#indianFuelStation]; price = 400; thumbnailPlaceholder = "/placeholders/acc-signboard.png"; description = "Illuminated forecourt signboard with brand colour field."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Air Station"; scale = #scale1_64; category = #accessory; environments = [#indianFuelStation]; price = 480; thumbnailPlaceholder = "/placeholders/acc-airstation.png"; description = "Free-standing tyre inflation air station unit."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Safety Barriers"; scale = #scale1_64; category = #accessory; environments = [#indianFuelStation]; price = 300; thumbnailPlaceholder = "/placeholders/acc-barriers.png"; description = "Set of four plastic safety bollards for forecourt traffic management."; bomType = #accessory; stlUrl = noStl });
    addProduct(state, { id = nextId(state); name = "Utility Cabinet"; scale = #scale1_64; category = #accessory; environments = [#indianFuelStation]; price = 520; thumbnailPlaceholder = "/placeholders/acc-utilitycabinet.png"; description = "Lockable utility cabinet for forecourt equipment storage."; bomType = #accessory; stlUrl = noStl });
  };
};
