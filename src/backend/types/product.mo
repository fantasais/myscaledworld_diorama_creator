import Debug "mo:core/Debug";
import Common "common";

module {
  public type Product = {
    id : Common.ProductId;
    name : Text;
    scale : Common.Scale;
    category : Common.Category;
    environments : [Common.Environment];
    price : Nat;
    thumbnailPlaceholder : Text;
    description : Text;
    bomType : Common.BomType;
    stlUrl : ?Text;
  };
};
