import { createActor } from "@/backend";
import type { Product as BackendProduct } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/** Fetch all products from backend and expose their stlUrl */
export function useProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BackendProduct[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByEnvironment(env: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<BackendProduct[]>({
    queryKey: ["products", "env", env],
    queryFn: async () => {
      if (!actor || !env) return [];
      return actor.getProductsByEnvironment(
        env as Parameters<typeof actor.getProductsByEnvironment>[0],
      );
    },
    enabled: !!actor && !isFetching && !!env,
  });
}
