import MixinViews "mo:caffeineai-data-viewer/MixinViews";
import Map "mo:core/Map";
import List "mo:core/List";
import ProductMixin "mixins/product-api";
import CartMixin "mixins/cart-api";
import OrderMixin "mixins/order-api";
import ProductLib "lib/product";
import CartLib "lib/cart";
import OrderLib "lib/order";
import ProductTypes "types/product";
import CartTypes "types/cart";
import OrderTypes "types/order";
import Common "types/common";

actor {
  let products : Map.Map<Common.ProductId, ProductTypes.Product>;
  let state : { var nextProductId : Nat };

  let cartItems : List.List<CartTypes.CartItem>;
  let cartState : { var nextCartItemId : Nat };

  let orders : Map.Map<Common.OrderId, OrderTypes.Order>;
  let orderState : { var nextOrderId : Nat };

  transient let productState : ProductLib.State = { products; counter = state };
  transient let cartLibState : CartLib.State = { items = cartItems; counter = cartState };
  transient let orderLibState : OrderLib.State = { orders; counter = orderState };
  include MixinViews();
  include ProductMixin(productState);
  include CartMixin(cartLibState, productState);
  include OrderMixin(orderLibState, cartLibState);
};
