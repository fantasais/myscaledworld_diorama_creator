import { BomSummary } from "@/components/BomSummary";
import { PartsList } from "@/components/PartsList";
import { ThreeScene } from "@/components/ThreeScene";
import { useBuilderStore } from "@/store/builderStore";

export function BuilderPage() {
  const reset = useBuilderStore((s) => s.reset);

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)]"
      data-ocid="builder.page"
    >
      {/* Page header */}
      <div className="bg-card border-b border-border px-4 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest">
              1:64 Scale · Configurator
            </span>
            <h1 className="font-display text-xl md:text-2xl font-bold text-foreground mt-0.5">
              Diorama Builder
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <p className="hidden md:block text-xs text-muted-foreground">
              Select parts · arrange in 3D · add kit to cart
            </p>
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left panel — Parts list (~30%) */}
        <div
          className="w-72 xl:w-80 shrink-0 border-r border-border bg-card/30 overflow-y-auto"
          data-ocid="builder.parts_panel"
        >
          <PartsList onReset={reset} />
        </div>

        {/* Right panel — 3D scene + BOM (~70%) */}
        <div className="flex-1 flex flex-col min-w-0 gap-0">
          {/* 3D viewport */}
          <div className="flex-1 relative min-h-0" data-ocid="builder.viewport">
            <ThreeScene />
          </div>

          {/* BOM strip at bottom */}
          <div
            className="shrink-0 border-t border-border bg-background px-4 py-3"
            data-ocid="builder.bom_strip"
          >
            <BomSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
