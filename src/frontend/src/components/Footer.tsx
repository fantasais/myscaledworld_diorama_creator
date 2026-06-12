import { Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { SiInstagram } from "react-icons/si";

const FOOTER_LINKS = {
  Platform: [
    { label: "About MyScaledWorld", href: "/" },
    { label: "Modular Diorama Systems", href: "/shop" },
  ],
  Support: [
    { label: "Contact", href: "/" },
    { label: "Build Guide", href: "/builder" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();
  const utm = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "myscaledworld",
  );

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="font-display text-sm font-semibold text-foreground">
                MyScaled<span className="text-primary">World</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Modular diorama kits built for collectors. Configure your scene,
              generate your parts list, and order the complete kit in one go.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              aria-label="Follow on Instagram"
            >
              <SiInstagram className="w-4 h-4" />
              @myscaledworld
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href as "/" | "/shop" | "/builder" | "/cart"}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {year} MyScaledWorld. Scale-accurate components, built for
            collectors.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${utm}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-200"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
