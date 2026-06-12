import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "all", label: "All Modules" },
  { value: "base", label: "Bases" },
  { value: "wall", label: "Walls" },
  { value: "structure", label: "Structures" },
  { value: "accessory", label: "Accessories" },
];

const ENV_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Environments" },
  { value: "indian_garage", label: "Indian Garage" },
  { value: "indian_fuel_station", label: "Indian Fuel Station" },
];

export function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeEnv, setActiveEnv] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchEnv =
      activeEnv === "all" ||
      p.environments.includes(activeEnv as Product["environments"][number]);
    const matchSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchEnv && matchSearch;
  });

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
          {/* Filter bar */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-8"
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
                  className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-colors duration-200 ${
                    activeEnv === f.value
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                data-ocid={`shop.category_tab.${cat.value}`}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium border transition-colors duration-200 ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results count */}
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
