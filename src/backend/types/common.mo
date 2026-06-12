import Debug "mo:core/Debug";

module {
  public type Timestamp = Int;
  public type ProductId = Nat;
  public type CartItemId = Nat;
  public type OrderId = Nat;

  public type Scale = {
    #scale1_64;
  };

  public type Environment = {
    #indianGarage;
    #indianFuelStation;
  };

  public type Category = {
    #base;
    #wall;
    #structure;
    #accessory;
    #decal;
    #kit;
  };

  public type BomType = {
    #base;
    #wall;
    #structure;
    #accessory;
    #decal;
    #kit;
  };
};
