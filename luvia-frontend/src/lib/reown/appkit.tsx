import type { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import {
  solana,
  solanaDevnet,
  type AppKitNetwork,
} from "@reown/appkit/networks";

import { CLUSTER } from "@/lib/solana/config";

const envOrUndefined = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
};

const PROJECT_ID = envOrUndefined(import.meta.env.VITE_REOWN_PROJECT_ID);

if (!PROJECT_ID) {
  throw new Error(
    "VITE_REOWN_PROJECT_ID is not set. Get one at https://cloud.reown.com and add your deployed domain under the project's Domains list.",
  );
}

// Solana wallets sign whatever transaction we give them; the network advertised
// over WalletConnect is just a handshake hint. Mobile wallets that connect via
// WC (Trust, Solflare, Backpack, OKX, …) only whitelist Solana mainnet on their
// relay, so we must always include `solana` in the namespace, even on devnet
// builds — otherwise their `session_propose` is silently rejected and the
// connect modal hangs on a loading spinner.
const defaultNetwork: AppKitNetwork =
  CLUSTER === "mainnet-beta" ? solana : solanaDevnet;
const networks: [AppKitNetwork, ...AppKitNetwork[]] =
  CLUSTER === "mainnet-beta" ? [solana] : [solana, solanaDevnet];

const solanaAdapter = new SolanaAdapter();

const metadata = {
  name: "Luvia",
  description: "Luvia presale — the trust layer for AI relationships",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://luvia.io",
  icons: [
    typeof window !== "undefined"
      ? `${window.location.origin}/luvia_logo.png`
      : "https://luvia.io/luvia_logo.png",
  ],
};

createAppKit({
  adapters: [solanaAdapter],
  networks,
  defaultNetwork,
  projectId: PROJECT_ID,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
    swaps: false,
    onramp: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#9B5CFF",
    "--w3m-border-radius-master": "3px",
  },
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
