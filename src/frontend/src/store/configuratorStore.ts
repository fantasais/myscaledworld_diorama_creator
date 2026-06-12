/**
 * Compatibility shim — maps the old useConfiguratorStore API to the newer
 * useBuilderStore so that any component still importing from this path keeps
 * working without changes.
 */
import { useBuilderStore } from "@/store/builderStore";
import type { ConfiguratorStep, Product } from "@/types";
import { useState } from "react";

export function useConfiguratorStore() {
  const store = useBuilderStore();

  // Local step state (not persisted — purely UI navigation state)
  const [step, setStep] = useState<ConfiguratorStep>("environment");

  // Map the accessories Record<id, SelectedItem> → Product[]
  const selectedAccessories: Product[] = Object.values(store.accessories).map(
    (item) => item.product,
  );

  function toggleAccessory(product: Product) {
    const existing = store.accessories[product.id];
    store.setAccessoryQty(product, existing ? 0 : 1);
  }

  return {
    // step navigation
    step,
    setStep,

    // environment / base / wall delegation
    environment: store.environment,
    selectedBase: store.selectedBase,
    selectedWall: store.selectedWall,
    setEnvironment: store.setEnvironment,
    setBase: store.setBase,
    setWall: store.setWall,

    // accessories compat
    selectedAccessories,
    toggleAccessory,

    // full reset
    reset: store.reset,
  };
}
