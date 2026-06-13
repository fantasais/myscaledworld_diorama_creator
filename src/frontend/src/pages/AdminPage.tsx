import { createActor } from "@/backend";
import { Button } from "@/components/ui/button";
import { getProducts, saveProductStlOverride } from "@/data/products";
import type { Product } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { ExternalBlob } from "@caffeineai/object-storage";
import { AlertCircle, CheckCircle, FileBox, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface UploadState {
  productId: string;
  progress: number;
  status: "idle" | "uploading" | "done" | "error";
  errorMsg?: string;
}

function normaliseProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function AdminPage() {
  const { actor } = useActor(createActor);
  const [stlUrls, setStlUrls] = useState<Record<string, string | null>>(() => {
    const init: Record<string, string | null> = {};
    for (const p of getProducts()) init[p.id] = p.stlUrl;
    return init;
  });
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const demoObjectUrls = useRef<Record<string, string>>({});

  function setUploadState(productId: string, patch: Partial<UploadState>) {
    setUploads((prev) => ({
      ...prev,
      [productId]: {
        ...{ productId, progress: 0, status: "idle" as const },
        ...prev[productId],
        ...patch,
      },
    }));
  }

  async function handleUpload(product: Product, file: File) {
    setUploadState(product.id, { status: "uploading", progress: 0 });

    if (!actor) {
      const previousUrl = demoObjectUrls.current[product.id];
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      const demoUrl = URL.createObjectURL(file);
      demoObjectUrls.current[product.id] = demoUrl;
      saveProductStlOverride(product.id, demoUrl);
      setStlUrls((prev) => ({ ...prev, [product.id]: demoUrl }));
      setUploadState(product.id, { status: "done", progress: 100 });
      toast.success(`Demo STL attached for ${product.name}`, {
        description: "This frontend-only preview stays active in the current browser session.",
      });
      return;
    }

    try {
      // Fetch the backend product to obtain its bigint ID
      const backendProducts = await actor.getProducts();
      const productNameKey = normaliseProductName(product.name);
      const backendProduct =
        backendProducts.find((p) => normaliseProductName(p.name) === productNameKey) ??
        backendProducts.find((p) => {
          const backendNameKey = normaliseProductName(p.name);
          return productNameKey.includes(backendNameKey) || backendNameKey.includes(productNameKey);
        });
      if (!backendProduct) {
        throw new Error(`Product not found in backend: ${product.name}`);
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadState(product.id, { progress: pct });
      });
      const url = await blob.getDirectURL();
      // Store the URL in the backend using the real product bigint ID
      await actor.setProductStlUrl(backendProduct.id, url);
      saveProductStlOverride(product.id, url);
      setStlUrls((prev) => ({ ...prev, [product.id]: url }));
      setUploadState(product.id, { status: "done", progress: 100 });
      toast.success(`STL uploaded for ${product.name}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadState(product.id, { status: "error", errorMsg: msg });
      toast.error(`Upload failed: ${msg}`);
    }
  }

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-4xl"
      data-ocid="admin.page"
    >
      <div className="mb-8">
        <span className="font-mono text-xs text-primary uppercase tracking-widest">
          Admin
        </span>
        <h1 className="font-display text-2xl font-bold text-foreground mt-1">
          STL Model Manager
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload STL files for each product. Once uploaded the 3D configurator
          will render the real model. If backend storage is unavailable, the page
          falls back to a browser-session demo preview.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {getProducts().map((product, i) => {
          const up = uploads[product.id];
          const currentUrl = stlUrls[product.id];
          const hasModel = !!currentUrl;

          return (
            <div
              key={product.id}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
              data-ocid={`admin.product_row.${i + 1}`}
            >
              {/* Status icon */}
              <div className="shrink-0">
                {hasModel ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <FileBox className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {product.name}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {product.category} · {product.scale}
                </p>
                {up?.status === "uploading" && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200 rounded-full"
                        style={{ width: `${up.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uploading... {up.progress}%
                    </p>
                  </div>
                )}
                {up?.status === "error" && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {up.errorMsg}
                  </p>
                )}
                {hasModel && (
                  <p className="text-xs text-green-500/80 mt-1">
                    3D model uploaded
                  </p>
                )}
              </div>

              {/* Upload button */}
              <div className="shrink-0">
                <input
                  ref={(el) => {
                    fileInputRefs.current[product.id] = el;
                  }}
                  type="file"
                  accept=".stl"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(product, file);
                  }}
                  data-ocid={`admin.file_input.${i + 1}`}
                />
                <Button
                  type="button"
                  variant={hasModel ? "outline" : "default"}
                  size="sm"
                  disabled={up?.status === "uploading"}
                  onClick={() => fileInputRefs.current[product.id]?.click()}
                  className="gap-1.5"
                  data-ocid={`admin.upload_button.${i + 1}`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {hasModel ? "Replace" : "Upload STL"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

