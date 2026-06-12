import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Input } from "@/components/ui/input";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "base", label: "Bases" },
  { value: "wall", label: "Walls" },
  { value: "accessory", label: "Accessories" },
  { value: "decal", label: "Decals" },
  { value: "fuel_station_modules", label: "Fuel Station Modules" },
  { value: "garage_modules", label: "Garage Modules" },
];

/** Map a category chip value to a product filter predicate */
function matchesChip(product: Product, chip: string): boolean {
  if (chip === "all") return true;
  if (chip === "garage_modules")
    return product.environments.includes("indian_garage");
  if (chip === "fuel_station_modules")
    return product.environments.includes("indian_fuel_station");
  return product.category === chip;
}

/** Read ?category= from current URL without requiring router validateSearch */
function getCategoryFromUrl(): string {
  if (typeof window === "undefined") return "all";
  const cat = new URLSearchParams(window.location.search).get("category");
  return CATEGORIES.some((c) => c.value === cat) ? (cat as string) : "all";
}

const ENV_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Environments" },
  { value: "indian_garage", label: "Indian Garage" },
  { value: "indian_fuel_station", label: "Indian Fuel Station" },
];

export function ShopPage() {
  const _navigate = useNavigate();
  const [activeCategory, setActiveCategory] =
    useState<string>(getCategoryFromUrl);
  const [activeEnv, setActiveEnv] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync active category to URL search param
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeCategory === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", activeCategory);
    }
    window.history.replaceState(null, "", url.toString());
  }, [activeCategory]);

  // Keep state in sync on browser back/forward
  useEffect(() => {
    const handler = () => setActiveCategory(getCategoryFromUrl());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  function handleCategoryClick(value: string) {
    // clicking the active non-all chip resets to "all"
    setActiveCategory((prev) =>
      prev === value && value !== "all" ? "all" : value,
    );
  }

  const filtered = useMemo(
    () =>
      PRODUCTS.filter((p) => {
        const matchCat = matchesChip(p, activeCategory);
        const matchEnv =
          activeEnv === "all" ||
          p.environments.includes(activeEnv as Product["environments"][number]);
        const matchSearch =
          search.trim() === "" ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchEnv && matchSearch;
      }),
    [activeCategory, activeEnv, search],
  );

  const handleDetails = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <>
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <span className="font-mono text-xs text-primary uppercase tracking-widest mb-2 block">
            1:64 Scale Catalogue
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Shop Modules
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl">
            Browse individual modules and accessories for your diorama. Or head
            to the Builder to configure a complete kit.
          </p>
        </div>
      </div>

      {/* Filters + grid */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Search + env filter bar */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-6"
            data-ocid="shop.filter_bar"
          >
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border font-body text-sm"
                data-ocid="shop.search_input"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {ENV_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActiveEnv(f.value)}
                  data-ocid={`shop.env_filter.${f.value}`}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                    activeEnv === f.value
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category chip row */}
          <fieldset
            className="flex flex-wrap gap-2 mb-8 border-0 p-0 m-0"
            data-ocid="shop.category_chips"
          >
            <legend className="sr-only">Filter by category</legend>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleCategoryClick(cat.value)}
                  data-ocid={`shop.category_chip.${cat.value}`}
                  className={[
                    "px-4 py-1.5 rounded-full text-xs font-mono font-medium border transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:bg-primary/5 hover:text-foreground",
                  ].join(" ")}
                >
                  {cat.label}
                </button>
              );
            })}
          </fieldset>
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-xs text-muted-foreground">
              {filtered.length} module{filtered.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="shop.empty_state"
            >
              <span className="text-4xl mb-4">🔍</span>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No modules found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search term.
              </p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              data-ocid="shop.product_list"
            >
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDetails={handleDetails}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </>
  );
}
