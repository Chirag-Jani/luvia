import {
  useAppKit,
  useAppKitAccount,
  useDisconnect,
} from "@reown/appkit/react";
import { LogOut, Wallet } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props extends Omit<ButtonProps, "onClick" | "children"> {
  /** When true, renders only an icon (useful in compact mobile headers). */
  compact?: boolean;
}

const shortAddr = (addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`;

/**
 * Unified connect / disconnect button backed by Reown AppKit. Opens the
 * AppKit modal when disconnected; shows the abbreviated address + a quick
 * disconnect action when connected.
 */
export const ConnectWalletButton = ({
  compact,
  className,
  variant = "hero",
  size = "lg",
  ...rest
}: Props) => {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAppKitAccount({ namespace: "solana" });

  if (!isConnected || !address) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={() => open()}
        {...rest}
      >
        <Wallet className="w-4 h-4" />
        {compact ? "" : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={cn("gap-2", className)}
      onClick={() => disconnect({ namespace: "solana" })}
      {...rest}
    >
      <span className="w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
      {shortAddr(address)}
      <LogOut className="w-3.5 h-3.5 opacity-70" />
    </Button>
  );
};
