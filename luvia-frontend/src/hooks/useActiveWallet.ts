import { useMemo } from "react";
import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKitState,
} from "@reown/appkit/react";
import type { Provider as SolanaProvider } from "@reown/appkit-adapter-solana/react";
import { PublicKey } from "@solana/web3.js";

/**
 * Normalizes Reown AppKit's Solana wallet state into a single ergonomic
 * object. Exposes the active Solana provider so callers can sign/send
 * transactions via WalletConnect / injected wallet providers.
 */
export function useActiveWallet() {
  const { initialized } = useAppKitState();
  const { address, isConnected } = useAppKitAccount({ namespace: "solana" });
  const { walletProvider } = useAppKitProvider<SolanaProvider>("solana");

  const publicKey = useMemo(() => {
    if (!address) return null;
    try {
      return new PublicKey(address);
    } catch {
      return null;
    }
  }, [address]);

  return {
    ready: initialized,
    connected: Boolean(isConnected && address),
    publicKey,
    address: address ?? null,
    walletProvider: walletProvider ?? null,
  };
}
