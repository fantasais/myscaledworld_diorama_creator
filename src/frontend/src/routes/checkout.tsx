import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import type { ContactDetails, Order, ShippingAddress } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Lock, MapPin, User } from "lucide-react";
import { useState } from "react";

type FormErrors = Partial<Record<string, string>>;

function validateContact(c: ContactDetails): FormErrors {
  const errors: FormErrors = {};
  if (!c.fullName.trim()) errors.fullName = "Full name is required";
  if (!c.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(c.email))
    errors.email = "A valid email is required";
  if (!c.phone.trim() || !/^[6-9]\d{9}$/.test(c.phone.replace(/\s/g, "")))
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  return errors;
}

function validateShipping(s: ShippingAddress): FormErrors {
  const errors: FormErrors = {};
  if (!s.line1.trim()) errors.line1 = "Address line 1 is required";
  if (!s.city.trim()) errors.city = "City is required";
  if (!s.state.trim()) errors.state = "State is required";
  if (!s.pincode.trim() || !/^\d{6}$/.test(s.pincode))
    errors.pincode = "Enter a valid 6-digit PIN code";
  return errors;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-destructive mt-1" role="alert">
      {msg}
    </p>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="font-display text-base font-semibold text-foreground">
        {title}
      </h2>
    </div>
  );
}

export function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const cartTotal = total();

  const [contact, setContact] = useState<ContactDetails>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [shipping, setShipping] = useState<ShippingAddress>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [placing, setPlacing] = useState(false);

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    const contactErrors = validateContact(contact);
    const shippingErrors = validateShipping(shipping);
    const allErrors = { ...contactErrors, ...shippingErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }
    setErrors({});
    setPlacing(true);

    // Generate deterministic order ID
    const orderId = `MSW-${Date.now().toString(36).toUpperCase()}`;
    const order: Order = {
      orderId,
      contact,
      shipping,
      items,
      total: cartTotal,
      status: "confirmed" as const,
      createdAt: new Date().toISOString(),
    };

    // Persist to sessionStorage for confirmation page
    sessionStorage.setItem(`order-${orderId}`, JSON.stringify(order));

    setTimeout(() => {
      clearCart();
      navigate({ to: "/confirmation/$orderId", params: { orderId } });
    }, 900);
  }

  if (items.length === 0) {
    return (
      <>
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground mb-6">
            Your cart is empty. Add items before checking out.
          </p>
          <Button
            type="button"
            onClick={() => navigate({ to: "/builder" })}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to Builder
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <span className="font-mono text-xs text-primary uppercase tracking-widest mb-1 block">
            Order Flow
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <Lock className="w-7 h-7 text-primary" />
            Checkout
          </h1>
        </div>
      </div>

      <div className="bg-background">
        <div className="container mx-auto px-4 py-10">
          <form onSubmit={handlePlaceOrder} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: forms */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                {/* Contact Details */}
                <div
                  className="bg-card border border-border rounded-2xl p-6"
                  data-ocid="checkout.contact_section"
                >
                  <SectionHeader icon={User} title="Contact Details" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="fullName"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Rajesh Kumar"
                        value={contact.fullName}
                        onChange={(e) =>
                          setContact({ ...contact, fullName: e.target.value })
                        }
                        className={cn(
                          "bg-background border-input font-body",
                          errors.fullName &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        data-ocid="checkout.full_name_input"
                      />
                      <FieldError msg={errors.fullName} />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="rajesh@example.com"
                        value={contact.email}
                        onChange={(e) =>
                          setContact({ ...contact, email: e.target.value })
                        }
                        className={cn(
                          "bg-background border-input font-body",
                          errors.email &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        data-ocid="checkout.email_input"
                      />
                      <FieldError msg={errors.email} />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Mobile Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        value={contact.phone}
                        onChange={(e) =>
                          setContact({ ...contact, phone: e.target.value })
                        }
                        className={cn(
                          "bg-background border-input font-body",
                          errors.phone &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        data-ocid="checkout.phone_input"
                      />
                      <FieldError msg={errors.phone} />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div
                  className="bg-card border border-border rounded-2xl p-6"
                  data-ocid="checkout.shipping_section"
                >
                  <SectionHeader icon={MapPin} title="Shipping Address" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="line1"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Address Line 1
                      </Label>
                      <Input
                        id="line1"
                        placeholder="House / Flat / Block number, Street name"
                        value={shipping.line1}
                        onChange={(e) =>
                          setShipping({ ...shipping, line1: e.target.value })
                        }
                        className={cn(
                          "bg-background border-input font-body",
                          errors.line1 &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        data-ocid="checkout.address_line1_input"
                      />
                      <FieldError msg={errors.line1} />
                    </div>
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="line2"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Address Line 2{" "}
                        <span className="text-muted-foreground/60">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="line2"
                        placeholder="Area, Landmark"
                        value={shipping.line2 ?? ""}
                        onChange={(e) =>
                          setShipping({ ...shipping, line2: e.target.value })
                        }
                        className="bg-background border-input font-body"
                        data-ocid="checkout.address_line2_input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="city"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        City
                      </Label>
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        value={shipping.city}
                        onChange={(e) =>
                          setShipping({ ...shipping, city: e.target.value })
                        }
                        className={cn(
                          "bg-background border-input font-body",
                          errors.city &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        data-ocid="checkout.city_input"
                      />
                      <FieldError msg={errors.city} />
                    </div>
                    <div>
                      <Label
                        htmlFor="state"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        State
                      </Label>
                      <Input
                        id="state"
                        placeholder="Maharashtra"
                        value={shipping.state}
                        onChange={(e) =>
                          setShipping({ ...shipping, state: e.target.value })
                        }
                        className={cn(
                          "bg-background border-input font-body",
                          errors.state &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        data-ocid="checkout.state_input"
                      />
                      <FieldError msg={errors.state} />
                    </div>
                    <div>
                      <Label
                        htmlFor="pincode"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        PIN Code
                      </Label>
                      <Input
                        id="pincode"
                        placeholder="400001"
                        value={shipping.pincode}
                        onChange={(e) =>
                          setShipping({ ...shipping, pincode: e.target.value })
                        }
                        className={cn(
                          "bg-background border-input font-body",
                          errors.pincode &&
                            "border-destructive focus-visible:ring-destructive",
                        )}
                        data-ocid="checkout.pincode_input"
                      />
                      <FieldError msg={errors.pincode} />
                    </div>
                    <div>
                      <Label
                        htmlFor="country"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Country
                      </Label>
                      <Input
                        id="country"
                        value="India"
                        disabled
                        className="bg-muted/40 border-input font-body text-muted-foreground cursor-not-allowed"
                        data-ocid="checkout.country_input"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment — mock */}
                <div
                  className="bg-card border border-border rounded-2xl p-6"
                  data-ocid="checkout.payment_section"
                >
                  <SectionHeader icon={CreditCard} title="Payment" />
                  <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 mb-5">
                    <p className="font-mono text-xs text-primary">
                      🔒 Demo mode — no real payment will be charged
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="cardNumber"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Card Number
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-background border-input font-mono tracking-widest"
                        maxLength={19}
                        data-ocid="checkout.card_number_input"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label
                        htmlFor="cardName"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Name on Card
                      </Label>
                      <Input
                        id="cardName"
                        placeholder="RAJESH KUMAR"
                        value={cardName}
                        onChange={(e) =>
                          setCardName(e.target.value.toUpperCase())
                        }
                        className="bg-background border-input font-mono tracking-wider"
                        data-ocid="checkout.card_name_input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="expiry"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        Expiry
                      </Label>
                      <Input
                        id="expiry"
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="bg-background border-input font-mono"
                        maxLength={7}
                        data-ocid="checkout.expiry_input"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="cvv"
                        className="font-mono text-xs text-muted-foreground mb-1.5 block"
                      >
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="•••"
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="bg-background border-input font-mono"
                        maxLength={4}
                        data-ocid="checkout.cvv_input"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={placing}
                  className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold text-base py-6 transition-smooth disabled:opacity-60"
                  data-ocid="checkout.place_order_button"
                >
                  {placing ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Place Order — {formatPrice(cartTotal)}
                    </>
                  )}
                </Button>
              </div>

              {/* Right: Order summary */}
              <div className="lg:col-span-1">
                <div
                  className="bg-card border border-border rounded-2xl p-6 sticky top-24"
                  data-ocid="checkout.order_summary"
                >
                  <h2 className="font-display text-base font-semibold text-foreground mb-5">
                    Order Summary
                  </h2>
                  <div className="flex flex-col gap-3 mb-5">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-2 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground text-xs font-medium truncate">
                            {item.type === "configured_kit"
                              ? item.kitName
                              : item.product?.name}
                          </p>
                          {item.quantity > 1 && (
                            <p className="font-mono text-xs text-muted-foreground">
                              ×{item.quantity}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-xs font-bold text-foreground shrink-0">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="bg-border mb-5" />
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold text-foreground">
                      Total
                    </span>
                    <span className="font-mono font-bold text-xl text-foreground">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-3">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
