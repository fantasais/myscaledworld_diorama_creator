import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingCart, Wrench, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/builder", label: "Builder" },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCartStore((s) => s.items.length);
  const router = useRouterState();
  const pathname = router.location.pathname;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 group"
          data-ocid="header.home_link"
        >
          <div className="w-8 h-8 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold tracking-wide text-foreground group-hover:text-primary transition-colors duration-200">
            MyScaled<span className="text-primary">World</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`header.${link.label.toLowerCase()}_link`}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-body font-medium transition-colors duration-200",
                pathname === link.to
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            data-ocid="header.cart_link"
            className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
            data-ocid="header.mobile_menu_toggle"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              data-ocid={`header.mobile_${link.label.toLowerCase()}_link`}
              className={cn(
                "block px-4 py-2.5 rounded-md text-sm font-body font-medium transition-colors duration-200",
                pathname === link.to
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/cart"
            onClick={() => setMobileOpen(false)}
            data-ocid="header.mobile_cart_link"
            className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
        </nav>
      )}
    </header>
  );
}
