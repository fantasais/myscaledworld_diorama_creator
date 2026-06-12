import ProductLib "../lib/product";
import ProductTypes "../types/product";
import Common "../types/common";

mixin (productState : ProductLib.State) {
  public query func getProducts() : async [ProductTypes.Product] {
    ProductLib.allProducts(productState)
  };

  public query func getProductById(id : Common.ProductId) : async ?ProductTypes.Product {
    ProductLib.getProduct(productState, id)
  };

  public query func getProductsByEnvironment(env : Common.Environment) : async [ProductTypes.Product] {
    ProductLib.productsByEnvironment(productState, env)
  };

  public query func getProductsByCategory(category : Common.Category) : async [ProductTypes.Product] {
    ProductLib.productsByCategory(productState, category)
  };

  /// Admin: set or clear the STL file URL for a product.
  /// stlUrl should be the object-storage URL returned after uploading the file.
  public shared ({ caller }) func setProductStlUrl(id : Common.ProductId, stlUrl : ?Text) : async Bool {
    ProductLib.updateStlUrl(productState, id, stlUrl)
  };
};
