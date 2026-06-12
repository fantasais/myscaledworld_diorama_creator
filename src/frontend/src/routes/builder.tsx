import { Button } from "@/components/ui/button";
import { getProductsByCategory } from "@/data/products";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useConfiguratorStore } from "@/store/configuratorStore";
import type { BomLine, ConfiguratorStep, Environment, Product } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

// ── Step configuration ────────────────────────────────────
const STEPS: { id: ConfiguratorStep; label: string }[] = [
  { id: "environment", label: "Environment" },
  { id: "base", label: "Base" },
  { id: "walls", label: "Walls" },
  { id: "accessories", label: "Accessories" },
  { id: "review", label: "Review" },
];

const STEP_ORDER: ConfiguratorStep[] = [
  "environment",
  "base",
  "walls",
  "accessories",
  "review",
];

// ── Layer colours for 3D layered preview ─────────────────────────
const LAYER_CONFIG = {
  environment: {
    label: "Environment",
    color: "bg-primary/25 border-primary/40",
    zDepth: 0,
  },
  floor: { label: "Base", color: "bg-sky-900/50 border-sky-700/60", zDepth: 1 },
  wall: {
    label: "Wall",
    color: "bg-indigo-900/50 border-indigo-700/60",
    zDepth: 2,
  },
  accessory: {
    label: "Accessories",
    color: "bg-amber-900/50 border-amber-700/60",
    zDepth: 3,
  },
};

// ── Helpers ──────────────────────────────────────────────────
function buildBom(
  base: Product | null,
  wall: Product | null,
  accessories: Product[],
): BomLine[] {
  const lines: BomLine[] = [];
  const add = (p: Product) =>
    lines.push({
      product: p,
      quantity: 1,
      unitPrice: p.price,
      totalPrice: p.price,
    });
  if (base) add(base);
  if (wall) add(wall);
  accessories.forEach(add);
  return lines;
}

const ENV_LABELS: Record<Environment, string> = {
  indian_garage: "Indian Garage",
  indian_fuel_station: "Indian Fuel Station",
};

const ENV_ICONS: Record<Environment, string> = {
  indian_garage: "🔧",
  indian_fuel_station: "⛽",
};

// ── Sub-components ────────────────────────────────────────────
function SelectionCard({
  product,
  selected,
  multi: _multi,
  onSelect,
  index,
}: {
  product: Product;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-ocid={`builder.selection_card.${index + 1}`}
      className={cn(
        "w-full text-left p-4 rounded-xl border transition-smooth flex flex-col gap-2",
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
          : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-sm font-semibold text-foreground">
          {product.name}
        </span>
        {selected && (
          <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {product.description}
      </p>
      <span className="font-mono text-xs font-bold text-foreground mt-1">
        {formatPrice(product.price)}
      </span>
    </button>
  );
}

// ── 3D Layered Preview ────────────────────────────────────────
function DioramaPreview({
  environment,
  base,
  wall,
  accessories,
}: {
  environment: Environment | null;
  base: Product | null;
  wall: Product | null;
  accessories: Product[];
}) {
  const hasAnything = environment !== null;

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-secondary/30 overflow-hidden flex items-center justify-center"
      data-ocid="builder.diorama_preview"
      style={{ perspective: "900px" }}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 39px,oklch(var(--border)) 39px,oklch(var(--border)) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,oklch(var(--border)) 39px,oklch(var(--border)) 40px)",
        }}
      />

      {!hasAnything ? (
        <div className="relative z-10 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏗️</span>
          </div>
          <p className="font-display text-sm font-semibold text-foreground mb-1">
            Your diorama will appear here
          </p>
          <p className="text-xs text-muted-foreground">
            Select an environment to begin
          </p>
        </div>
      ) : (
        <div
          className="relative z-10 w-full h-full flex items-end justify-center pb-6 px-6"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* 3D Layered Composition */}
          <div className="relative flex flex-col-reverse items-center w-full max-w-sm gap-0">
            {/* Environment label chip */}
            <div
              className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 border border-primary/30 backdrop-blur-sm"
              style={{ transform: "translateZ(0px)" }}
            >
              <span className="text-base">{ENV_ICONS[environment!]}</span>
              <span className="font-mono text-xs text-primary font-medium">
                {ENV_LABELS[environment!]}
              </span>
            </div>

            {/* Layer stack — rendered bottom-up with 3D tilt */}
            <div
              className="relative w-full"
              style={{
                transform: "rotateX(22deg) rotateY(-6deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Floor layer */}
              <DioramaLayer
                label="Base"
                item={base}
                color={LAYER_CONFIG.floor.color}
                depth={0}
                emoji="🟦"
                active={!!base}
              />
              {/* Wall layer */}
              <DioramaLayer
                label={
                  environment === "indian_fuel_station" ? "Structure" : "Wall"
                }
                item={wall}
                color={LAYER_CONFIG.wall.color}
                depth={1}
                emoji="🟩"
                active={!!wall}
              />
              {/* Accessories layer */}
              <AccessoryLayer accessories={accessories} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DioramaLayer({
  label,
  item,
  color,
  depth,
  emoji,
  active,
}: {
  label: string;
  item: Product | null;
  color: string;
  depth: number;
  emoji: string;
  active: boolean;
}) {
  const translateY = depth * -28;
  return (
    <div
      className={cn(
        "w-full rounded-lg border p-3 flex items-center gap-3 transition-all duration-500",
        active ? color : "bg-muted/20 border-border/30 opacity-40",
      )}
      style={{
        transform: `translateY(${translateY}px) translateZ(${depth * 10}px)`,
      }}
    >
      <span className="text-lg">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        {item ? (
          <p className="font-display text-sm font-semibold text-foreground truncate">
            {item.name}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60">Not selected</p>
        )}
      </div>
      {active && item && (
        <div className="shrink-0 w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Check className="w-3 h-3 text-primary" />
        </div>
      )}
    </div>
  );
}

function AccessoryLayer({ accessories }: { accessories: Product[] }) {
  if (accessories.length === 0) {
    return (
      <div
        className="w-full rounded-lg border p-3 flex items-center gap-3 bg-muted/20 border-border/30 opacity-40"
        style={{ transform: "translateY(-56px) translateZ(20px)" }}
      >
        <span className="text-lg">🟨</span>
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            Accessories
          </p>
          <p className="text-xs text-muted-foreground/60">None selected</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-lg border p-3 bg-amber-900/50 border-amber-700/60"
      style={{ transform: "translateY(-56px) translateZ(20px)" }}
    >
      <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Accessories ({accessories.length})
      </p>
      <div className="flex flex-wrap gap-1.5">
        {accessories.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-800/60 border border-amber-600/40 font-mono text-xs text-amber-200"
          >
            {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── BOM Panel ─────────────────────────────────────────────────
function BomPanel({
  bom,
  environment,
  onAddToCart,
}: {
  bom: BomLine[];
  environment: Environment | null;
  onAddToCart: () => void;
}) {
  const total = bom.reduce((s, l) => s + l.totalPrice, 0);
  const hasBase = bom.some((l) => l.product.category === "base");

  return (
    <div
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4"
      data-ocid="builder.bom_panel"
    >
      <h3 className="font-display text-sm font-semibold text-foreground">
        Bill of Materials
      </h3>

      {bom.length === 0 ? (
        <div
          className="flex flex-col items-center py-6 text-center"
          data-ocid="builder.bom_empty_state"
        >
          <span className="text-2xl mb-2">📦</span>
          <p className="text-xs text-muted-foreground">
            No components selected yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {bom.map((line, i) => (
            <div
              key={line.product.id}
              className="flex items-start gap-2 py-2 border-b border-border last:border-0"
              data-ocid={`builder.bom_line.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-display text-xs font-semibold text-foreground truncate">
                  {line.product.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {line.product.category} &bull; qty {line.quantity}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-foreground shrink-0">
                {formatPrice(line.totalPrice)}
              </span>
            </div>
          ))}
        </div>
      )}

      {bom.length > 0 && (
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="font-display text-sm font-semibold text-foreground">
            Total
          </span>
          <span className="font-mono font-bold text-foreground text-base">
            {formatPrice(total)}
          </span>
        </div>
      )}

      <Button
        type="button"
        disabled={!hasBase || !environment}
        onClick={onAddToCart}
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors duration-200"
        data-ocid="builder.add_kit_to_cart_button"
      >
        <ShoppingCart className="w-4 h-4" />
        Add Complete Kit to Cart
      </Button>
      {!hasBase && (
        <p className="text-xs text-muted-foreground text-center -mt-2">
          Select at least a base module to proceed.
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function BuilderPage() {
  const {
    step,
    environment,
    selectedBase,
    selectedWall,
    selectedAccessories,
    setStep,
    setEnvironment,
    setBase,
    setWall,
    toggleAccessory,
    reset,
  } = useConfiguratorStore();
  const addConfiguredKit = useCartStore((s) => s.addConfiguredKit);
  const navigate = useNavigate();

  const bom = buildBom(selectedBase, selectedWall, selectedAccessories);
  const currentStepIndex = STEP_ORDER.indexOf(step);

  const bases = environment ? getProductsByCategory(environment, "base") : [];
  const wallCat = environment === "indian_fuel_station" ? "structure" : "wall";
  const walls = environment
    ? getProductsByCategory(environment, wallCat as Product["category"])
    : [];
  const accessories = environment
    ? getProductsByCategory(environment, "accessory")
    : [];

  function goNext() {
    if (currentStepIndex < STEP_ORDER.length - 1) {
      setStep(STEP_ORDER[currentStepIndex + 1]);
    }
  }
  function goPrev() {
    if (currentStepIndex > 0) {
      setStep(STEP_ORDER[currentStepIndex - 1]);
    }
  }

  function handleAddToCart() {
    if (!environment) return;
    addConfiguredKit(bom, environment, "1:64");
    reset();
    toast.success("Kit added to cart!", {
      description: "Your configured diorama kit is ready for checkout.",
    });
    navigate({ to: "/cart" });
  }

  return (
    <>
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-1 block">
              Configurator
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Build Your Diorama
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-1.5 border-border text-muted-foreground hover:text-foreground"
            data-ocid="builder.reset_button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>

        {/* Step indicator */}
        <div className="container mx-auto px-4 pb-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const isActive = s.id === step;
              const isDone = STEP_ORDER.indexOf(s.id) < currentStepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (isDone || isActive) setStep(s.id);
                  }}
                  data-ocid={`builder.step_tab.${i + 1}`}
                  disabled={!isDone && !isActive}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium whitespace-nowrap transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-primary/20 text-primary cursor-pointer"
                        : "bg-muted/40 text-muted-foreground cursor-default",
                  )}
                >
                  {isDone && <Check className="w-3 h-3" />}
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: controls */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Step: Environment */}
              {step === "environment" && (
                <div data-ocid="builder.environment_step">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1">
                    Choose Environment
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Select the diorama system you want to build.
                  </p>
                  <div className="flex flex-col gap-3">
                    {(
                      ["indian_garage", "indian_fuel_station"] as Environment[]
                    ).map((env, i) => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => setEnvironment(env)}
                        data-ocid={`builder.env_option.${i + 1}`}
                        className={cn(
                          "w-full text-left p-5 rounded-xl border transition-smooth",
                          environment === env
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40",
                        )}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{ENV_ICONS[env]}</span>
                          <span className="font-display text-base font-bold text-foreground">
                            {ENV_LABELS[env]}
                          </span>
                          {environment === env && (
                            <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {env === "indian_garage"
                            ? "Workshop floors, walls, lifts and tools. Build the garage your die-casts deserve."
                            : "Forecourt bases, canopies, fuel pumps and signage. The complete roadside scene."}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Base */}
              {step === "base" && (
                <div data-ocid="builder.base_step">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1">
                    Choose Base
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Select the floor module for your diorama.
                  </p>
                  <div className="flex flex-col gap-3">
                    {bases.map((p, i) => (
                      <SelectionCard
                        key={p.id}
                        product={p}
                        selected={selectedBase?.id === p.id}
                        onSelect={() => setBase(p)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Walls */}
              {step === "walls" && (
                <div data-ocid="builder.walls_step">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1">
                    {environment === "indian_fuel_station"
                      ? "Choose Structure"
                      : "Choose Wall"}
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Select the wall or canopy structure.
                  </p>
                  <div className="flex flex-col gap-3">
                    {walls.map((p, i) => (
                      <SelectionCard
                        key={p.id}
                        product={p}
                        selected={selectedWall?.id === p.id}
                        onSelect={() => setWall(p)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Accessories */}
              {step === "accessories" && (
                <div data-ocid="builder.accessories_step">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1">
                    Choose Accessories
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Select one or more accessories to complete your scene.
                  </p>
                  <div className="flex flex-col gap-3">
                    {accessories.map((p, i) => (
                      <SelectionCard
                        key={p.id}
                        product={p}
                        selected={selectedAccessories.some(
                          (a) => a.id === p.id,
                        )}
                        multi
                        onSelect={() => toggleAccessory(p)}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Review */}
              {step === "review" && (
                <div data-ocid="builder.review_step">
                  <h2 className="font-display text-base font-semibold text-foreground mb-1">
                    Review Your Kit
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Check your selection and add the complete kit to cart.
                  </p>
                  {environment && (
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">
                          {ENV_ICONS[environment]}
                        </span>
                        <span className="font-display text-sm font-bold text-foreground">
                          {ENV_LABELS[environment]}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-primary/80">
                        1:64 Scale &bull; {bom.length} module
                        {bom.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={currentStepIndex === 0}
                  className="gap-1.5 border-border text-muted-foreground hover:text-foreground disabled:opacity-30"
                  data-ocid="builder.prev_step_button"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </Button>
                {step !== "review" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={goNext}
                    disabled={step === "environment" && !environment}
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors duration-200"
                    data-ocid="builder.next_step_button"
                  >
                    Continue
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Right: preview + BOM */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <DioramaPreview
                environment={environment}
                base={selectedBase}
                wall={selectedWall}
                accessories={selectedAccessories}
              />
              <BomPanel
                bom={bom}
                environment={environment}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
