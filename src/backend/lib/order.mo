import Map "mo:core/Map";
import Time "mo:core/Time";
import OrderTypes "../types/order";
import CartTypes "../types/cart";
import Common "../types/common";

module {
  public type Counter = { var nextOrderId : Nat };

  public type State = {
    orders : Map.Map<Common.OrderId, OrderTypes.Order>;
    counter : Counter;
  };

  public func placeOrder(
    state : State,
    contact : OrderTypes.ContactDetails,
    address : OrderTypes.ShippingAddress,
    cartItems : [CartTypes.CartItem],
    subtotal : Nat
  ) : OrderTypes.Order {
    let id = state.counter.nextOrderId;
    state.counter.nextOrderId += 1;
    let order : OrderTypes.Order = {
      id;
      contact;
      shippingAddress = address;
      items = cartItems;
      subtotal;
      paymentStatus = #mockPaid;
      createdAt = Time.now();
    };
    state.orders.add(id, order);
    order
  };

  public func getOrder(state : State, id : Common.OrderId) : ?OrderTypes.Order {
    state.orders.get(id)
  };

  public func listOrders(state : State) : [OrderTypes.Order] {
    state.orders.values().toArray()
  };
};
