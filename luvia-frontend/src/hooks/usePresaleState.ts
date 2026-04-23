import { useQuery } from "@tanstack/react-query";

import { fetchPresaleState, type PresaleState } from "@/lib/solana/presale";

/**
 * Polls the on-chain presale config PDA every 15s (and invalidates on window
 * focus) so the stage / progress bar reflects real-time buys.
 */
export function usePresaleState() {
  return useQuery<PresaleState>({
    queryKey: ["presale-state"],
    queryFn: fetchPresaleState,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}
