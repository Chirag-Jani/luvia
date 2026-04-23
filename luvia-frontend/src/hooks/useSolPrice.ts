import { useQuery } from "@tanstack/react-query";

import { fetchSolUsdPrice } from "@/lib/solana/pyth";

/**
 * Live SOL/USD spot price from Pyth Hermes. Used only for the UX quote — the
 * actual on-chain buy uses a fresh update posted atomically with `buy_tokens`.
 */
export function useSolPrice() {
  return useQuery<number>({
    queryKey: ["sol-usd-price"],
    queryFn: fetchSolUsdPrice,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}
