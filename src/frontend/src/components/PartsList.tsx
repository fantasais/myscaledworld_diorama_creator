import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PRODUCTS, getProductsByCategory } from "@/data/products";
import { useBuilderStore } from "@/store/builderStore";
import type { Environment, Product } from "@/types";
import {
  ArrowUp,
  Box,
  ChevronDown,
  Cylinder,
  Layers,
  Minus,
  Package,
  Plus,
  Search,
  Square,
  Tag,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

const ENV_OPTIONS: { value: Environment; label: string; icon: string }[] = [
  { value: "indian_garage", label: "Indian Garage", icon: "🔧" },
  { value: "indian_fuel_station", label: "Indian Fuel Station", icon: "⛽" },
];

// ── Product-type icon mapper ─────────────────────────────
function getProductIcon(product: Product): LucideIcon {
  const name = product.name.toLowerCase();
  const cat = product.category.toLowerCase();
  if (cat === "base" || name.includes("floor") || name.includes("base"))
    return Layers;
  if (
    cat === "wall" ||
    cat === "structure" ||
    name.includes("wall") ||
    name.includes("canopy")
  )
    return Square;
  if (
    name.includes("pump") ||
    name.includes("air station") ||
    name.includes("compressor")
  )
    return Zap;
  if (name.includes("drum") || name.includes("barrel") || name.includes("oil"))
    return Cylinder;
  if (
    name.includes("cabinet") ||
    name.includes("rack") ||
    name.includes("workbench") ||
    name.includes("bench")
  )
    return Package;
  if (name.includes("lift") || name.includes("jack")) return ArrowUp;
  if (name.includes("signboard") || name.includes("decal")) return Tag;
  return Box;
}

function SectionHeader({
  label,
  count,
  open,
  onToggle,
}: { label: string; count: number; open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-card/60 border border-border/50 hover:border-primary/30 transition-colors text-left"
    >
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-2">
        {count > 0 && (
          <span className="text-xs font-bold text-primary">
            {count} selected
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
    </button>
  );
}

function ProductRow({
  product,
  qty,
  onQtyChange,
}: { product: Product; qty: number; onQtyChange: (v: number) => void }) {
  const Icon = getProductIcon(product);
  return (
    <div className="flex items-center gap-2 py-2 px-1 border-b border-border/30 last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground/60 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground font-mono">
          {product.stlUrl ? "✓ 3D model" : "placeholder geometry"}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-6 h-6 rounded border-border/60 hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:ring-1 focus-visible:ring-ring transition-colors duration-150"
          onClick={() => onQtyChange(Math.max(0, qty - 1))}
          disabled={qty === 0}
          aria-label="Decrease quantity"
          data-ocid={`parts.minus.${product.id}`}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <input
          type="number"
          min={0}
          max={99}
          value={qty}
          onChange={(e) =>
            onQtyChange(
              Math.max(0, Math.min(99, Number.parseInt(e.target.value) || 0)),
            )
          }
          className="w-10 text-center text-xs font-mono bg-background border border-border/60 rounded h-6 px-1 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          data-ocid={`parts.qty.${product.id}`}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-6 h-6 rounded border-border/60 hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:ring-1 focus-visible:ring-ring transition-colors duration-150"
          onClick={() => onQtyChange(Math.min(99, qty + 1))}
          aria-label="Increase quantity"
          data-ocid={`parts.plus.${product.id}`}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function RadioRow({
  product,
  selected,
  onSelect,
}: { product: Product; selected: boolean; onSelect: () => void }) {
  const Icon = getProductIcon(product);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-2 py-2 px-2 rounded-lg border transition-colors text-left ${
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border/30 hover:border-primary/30 text-muted-foreground"
      }`}
      data-ocid={`parts.select.${product.id}`}
    >
      <div
        className={`w-3 h-3 rounded-full border-2 shrink-0 ${
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}
      />
      <Icon className="w-4 h-4 text-muted-foreground/50 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{product.name}</p>
      </div>
      {product.stlUrl && <span className="text-xs text-primary/70">3D</span>}
    </button>
  );
}

interface PartsListProps {
  onReset: () => void;
}

export function PartsList({ onReset }: PartsListProps) {
  const {
    environment,
    selectedBase,
    selectedWall,
    accessories,
    setEnvironment,
    setBase,
    setWall,
    setAccessoryQty,
  } = useBuilderStore();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    base: true,
    wall: true,
    accessory: true,
  });
  const [search, setSearch] = useState("");

  const toggle = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const matchesSearch = (p: Product) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  };

  const bases = environment
    ? getProductsByCategory(environment, "base").filter(matchesSearch)
    : [];
  const wallCat = environment === "indian_fuel_station" ? "structure" : "wall";
  const walls = environment
    ? PRODUCTS.filter(
        (p) => p.environments.includes(environment) && p.category === wallCat,
      ).filter(matchesSearch)
    : [];
  const accProducts = environment
    ? getProductsByCategory(environment, "accessory").filter(matchesSearch)
    : [];

  const accCount = Object.values(accessories).reduce(
    (s, a) => s + (a.quantity > 0 ? 1 : 0),
    0,
  );

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      data-ocid="parts.panel"
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2 border-b border-border/50 shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Parts List
          </span>
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="parts.reset_button"
          >
            Reset
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search parts…"
            className="h-7 pl-8 text-xs bg-background/60 border-border/50 placeholder:text-muted-foreground/50"
            data-ocid="parts.search_input"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Environment */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Environment
          </p>
          <div className="flex flex-col gap-1.5">
            {ENV_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEnvironment(opt.value)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                  environment === opt.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/50 hover:border-primary/40 text-muted-foreground"
                }`}
                data-ocid={`parts.env.${opt.value}`}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {environment && (
          <>
            {/* Base */}
            <div>
              <SectionHeader
                label="Base"
                count={selectedBase ? 1 : 0}
                open={openSections.base ?? true}
                onToggle={() => toggle("base")}
              />
              {(openSections.base ?? true) && (
                <div className="mt-2 flex flex-col gap-1.5 pl-1">
                  {bases.map((p) => (
                    <RadioRow
                      key={p.id}
                      product={p}
                      selected={selectedBase?.id === p.id}
                      onSelect={() =>
                        setBase(selectedBase?.id === p.id ? null : p)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Walls / Structure */}
            <div>
              <SectionHeader
                label={
                  environment === "indian_fuel_station" ? "Structure" : "Walls"
                }
                count={selectedWall ? 1 : 0}
                open={openSections.wall ?? true}
                onToggle={() => toggle("wall")}
              />
              {(openSections.wall ?? true) && (
                <div className="mt-2 flex flex-col gap-1.5 pl-1">
                  {walls.map((p) => (
                    <RadioRow
                      key={p.id}
                      product={p}
                      selected={selectedWall?.id === p.id}
                      onSelect={() =>
                        setWall(selectedWall?.id === p.id ? null : p)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Accessories */}
            <div>
              <SectionHeader
                label="Accessories"
                count={accCount}
                open={openSections.accessory ?? true}
                onToggle={() => toggle("accessory")}
              />
              {(openSections.accessory ?? true) && (
                <div className="mt-2 pl-1">
                  {accProducts.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      qty={accessories[p.id]?.quantity ?? 0}
                      onQtyChange={(v) => setAccessoryQty(p, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
