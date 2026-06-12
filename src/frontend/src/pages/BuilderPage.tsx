import { BomSummary } from "@/components/BomSummary";
import { PartsList } from "@/components/PartsList";
import { ThreeScene } from "@/components/ThreeScene";
import { useBuilderStore } from "@/store/builderStore";

export function BuilderPage() {
  const reset = useBuilderStore((s) => s.reset);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[720px] flex-col" data-ocid="builder.page">
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-primary">
              Scene-first configurator
            </span>
            <h1 className="font-display mt-0.5 text-xl font-bold text-foreground md:text-2xl">
              Diorama Builder
            </h1>
          </div>
          <p className="hidden text-xs text-muted-foreground md:block">
            Parts list feeds the scene. The scene is the product.
          </p>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="min-h-0 border-r border-border bg-card/30" data-ocid="builder.parts_panel">
          <PartsList onReset={reset} />
        </aside>

        <main className="grid min-h-0 grid-cols-[minmax(0,1fr)_22rem] bg-background 2xl:grid-cols-[minmax(0,1fr)_24rem]" data-ocid="builder.main_stage">
          <section className="min-h-0 p-3" data-ocid="builder.viewport_stage">
            <div className="h-full min-h-0 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <ThreeScene />
            </div>
          </section>

          <aside className="min-h-0 border-l border-border bg-card/40 p-3" data-ocid="builder.bom_panel">
            <BomSummary />
          </aside>
        </main>
      </div>
    </div>
  );
}

