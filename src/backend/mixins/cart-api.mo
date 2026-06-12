import CartLib "../lib/cart";
import CartTypes "../types/cart";
import ProductLib "../lib/product";
import Common "../types/common";

mixin (cartState : CartLib.State, productState : ProductLib.State) {
  public query func getCart() : async [CartTypes.CartItem] {
    CartLib.getCart(cartState)
  };

  public func addProductToCart(productId : Common.ProductId, quantity : Nat) : async Common.CartItemId {
    let product = switch (ProductLib.getProduct(productState, productId)) {
      case (?p) p;
      case null Runtime.trap("Product not found: " # debug_show productId);
    };
    let item : CartTypes.CartItem = {
      id = 0; // will be replaced inside addProduct
      kind = #singleProduct { product };
      quantity;
      subtotal = product.price * quantity;
    };
    CartLib.addProduct(cartState, item)
  };

  public func addKitToCart(kit : CartTypes.ConfiguredKit) : async Common.CartItemId {
    CartLib.addConfiguredKit(cartState, kit)
  };

  public func updateCartItemQuantity(itemId : Common.CartItemId, quantity : Nat) : async Bool {
    CartLib.updateQuantity(cartState, itemId, quantity)
  };

  public func removeFromCart(itemId : Common.CartItemId) : async Bool {
    CartLib.removeItem(cartState, itemId)
  };

  public query func getCartSubtotal() : async Nat {
    CartLib.cartSubtotal(cartState)
  };
};
