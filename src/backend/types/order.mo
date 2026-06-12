import Debug "mo:core/Debug";
import Common "common";
import Cart "cart";

module {
  public type ContactDetails = {
    firstName : Text;
    lastName : Text;
    email : Text;
    phone : Text;
  };

  public type ShippingAddress = {
    line1 : Text;
    line2 : ?Text;
    city : Text;
    state : Text;
    pincode : Text;
    country : Text;
  };

  public type PaymentStatus = {
    #pending;
    #mockPaid;
  };

  public type Order = {
    id : Common.OrderId;
    contact : ContactDetails;
    shippingAddress : ShippingAddress;
    items : [Cart.CartItem];
    subtotal : Nat;
    paymentStatus : PaymentStatus;
    createdAt : Common.Timestamp;
  };
};
