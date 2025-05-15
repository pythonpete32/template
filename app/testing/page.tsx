"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ContentArea } from "@/components/ContentArea";
import { Card } from "@/components/ui/card";
import { Beaker, Wallet } from "lucide-react";
import Image from "next/image";
import { TokenApproval } from "@/components/TokenApproval";
import {
  WalletTokenSelection,
  type Token,
} from "@/components/WalletTokenSelection";
import { parseUnits } from "viem";

// Utility function to scale amount by token decimals
const scaleAmount = (amount: string, decimals: number): string => {
  try {
    // Use viem's parseUnits to handle the scaling properly
    return parseUnits(amount || "0", decimals).toString();
  } catch (e) {
    console.error("Error scaling amount:", e);
    return "0";
  }
};

export default function TestingPage() {
  const { address } = useAccount();
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState<string>("");

  const handleApprovalData = (data: unknown) => {
    console.log("Approval data received:", data);
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    console.log("Token selected:", token);
  };

  const handleTokenRemove = () => {
    setSelectedToken(null);
  };

  const handleAmountChange = (newAmount: string) => {
    setAmount(newAmount);
  };

  // Example of how to scale the amount before sending to server
  const getScaledAmount = (): string => {
    if (!selectedToken || !amount) return "0";
    return scaleAmount(amount, selectedToken.decimals || 18);
  };

  return (
    <ContentArea>
      <div className="mb-8 flex items-center">
        <div className="relative h-16 w-16 mr-4">
          <Image
            src="/logo.png"
            alt="Based Wallet"
            fill
            className="object-contain"
            sizes="64px"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Based Wallet - Testing Lab
          </h1>
          <p className="text-muted-foreground">
            Try new experimental features and help us improve Based Wallet
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 border-2 border-primary/10 shadow-md">
          <div className="flex items-center mb-4">
            <Beaker className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Connected Wallet</h2>
          </div>

          <div className="p-4 bg-secondary/20 rounded-md mb-6">
            <div className="flex items-center mb-2">
              <Wallet className="h-5 w-5 mr-2 text-secondary-foreground" />
              <p className="font-medium">Connected wallet:</p>
            </div>
            <p className="text-sm font-mono bg-background p-2 rounded overflow-auto">
              {address || "Not connected"}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Component 1: Token Selection with Amount */}
          <div>
            <h2 className="text-xl font-bold mb-4">Token Selection</h2>
            <WalletTokenSelection
              title="Select a Token"
              selectedToken={selectedToken}
              onTokenSelect={handleTokenSelect}
              onTokenRemove={handleTokenRemove}
              amount={amount}
              onAmountChange={handleAmountChange}
              buttonText="Add Token"
              showAmountInput={!!selectedToken}
              showRemoveButton={!!selectedToken}
            />

            {selectedToken && (
              <div className="mt-4 p-4 bg-secondary/20 rounded-md">
                <h3 className="font-medium mb-2">Selected Token:</h3>
                <pre className="text-xs font-mono bg-background p-2 rounded overflow-auto">
                  {JSON.stringify(
                    {
                      token: selectedToken,
                      amount: amount || "Not set",
                      scaledAmount: getScaledAmount(),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>

          {/* Component 2: Token Approval Flow */}
          <div>
            <h2 className="text-xl font-bold mb-4">Token Approval Flow</h2>
            <TokenApproval
              title="Test Token Approval"
              onApprovalData={handleApprovalData}
            />
          </div>
        </div>
      </div>
    </ContentArea>
  );
}
