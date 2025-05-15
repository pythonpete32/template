"use client";

import { ConnectKitButton } from "connectkit";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  LogOut,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const CustomConnectButton = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ConnectKitButton.Custom>
      {(props) => {
        const { isConnected, isConnecting, show, address, ensName, chain } =
          props;
        return (
          <>
            {isConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="lg" className="gap-2 font-mono">
                    {ensName ||
                      `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0)]"
                >
                  <DropdownMenuLabel className="font-normal text-muted-foreground">
                    Connected to {chain?.name || "Ethereum"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => copyToClipboard(address || "")}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy Address"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex cursor-pointer items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      View on Etherscan
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 text-destructive"
                    onClick={show ? show : undefined}
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                size="lg"
                className="gap-2 font-bold border-2 border-black text-black bg-[#00d6bd] hover:bg-[#00d6bd]/90"
                onClick={show ? show : undefined}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
                <Wallet className="h-5 w-5" />
              </Button>
            )}
          </>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
