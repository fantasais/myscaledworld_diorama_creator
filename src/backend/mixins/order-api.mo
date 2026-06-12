import OrderLib "../lib/order";
import CartLib "../lib/cart";
import OrderTypes "../types/order";
import Common "../types/common";

mixin (orderState : OrderLib.State, cartState : CartLib.State) {
  public func placeOrder(
    contact : OrderTypes.ContactDetails,
    address : OrderTypes.ShippingAddress
  ) : async OrderTypes.Order {
    let cartItems = CartLib.getCart(cartState);
    let subtotal = CartLib.cartSubtotal(cartState);
    let order = OrderLib.placeOrder(orderState, contact, address, cartItems, subtotal);
    CartLib.clearCart(cartState);
    order
  };

  public query func getOrder(id : Common.OrderId) : async ?OrderTypes.Order {
    OrderLib.getOrder(orderState, id)
  };
};
