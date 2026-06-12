import List "mo:core/List";
import CartTypes "../types/cart";
import Common "../types/common";

module {
  public type Counter = { var nextCartItemId : Nat };

  public type State = {
    items : List.List<CartTypes.CartItem>;
    counter : Counter;
  };

  public func getCart(state : State) : [CartTypes.CartItem] {
    state.items.toArray()
  };

  public func addProduct(state : State, item : CartTypes.CartItem) : Common.CartItemId {
    let id = state.counter.nextCartItemId;
    state.counter.nextCartItemId += 1;
    let cartItem : CartTypes.CartItem = { item with id };
    state.items.add(cartItem);
    id
  };

  public func addConfiguredKit(state : State, kit : CartTypes.ConfiguredKit) : Common.CartItemId {
    let id = state.counter.nextCartItemId;
    state.counter.nextCartItemId += 1;
    let cartItem : CartTypes.CartItem = {
      id;
      kind = #configuredKit kit;
      quantity = 1;
      subtotal = kit.totalPrice;
    };
    state.items.add(cartItem);
    id
  };

  public func updateQuantity(state : State, itemId : Common.CartItemId, quantity : Nat) : Bool {
    var found = false;
    state.items.mapInPlace(
      func(item : CartTypes.CartItem) : CartTypes.CartItem {
        if (item.id == itemId) {
          found := true;
          let newSubtotal = switch (item.kind) {
            case (#singleProduct sp) { sp.product.price * quantity };
            case (#configuredKit kit) { kit.totalPrice * quantity };
          };
          { item with quantity; subtotal = newSubtotal }
        } else { item }
      }
    );
    found
  };

  public func removeItem(state : State, itemId : Common.CartItemId) : Bool {
    let before = state.items.size();
    state.items.retain(func(item : CartTypes.CartItem) : Bool { item.id != itemId });
    state.items.size() < before
  };

  public func cartSubtotal(state : State) : Nat {
    state.items.foldLeft<Nat, CartTypes.CartItem>(0, func(acc, item) = acc + item.subtotal)
  };

  public func clearCart(state : State) : () {
    state.items.retain(func(_ : CartTypes.CartItem) : Bool { false })
  };
};
