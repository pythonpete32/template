"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { ContentArea } from "@/components/ContentArea";
import { Card } from "@/components/ui/card";
import { Beaker, Wallet, Check } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnsoApproval } from "@/hooks/useEnsoApproval";
import type { Address } from "viem";

export default function TestingPage() {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("1000000000000000000"); // Default 1 token with 18 decimals
  const [isTestingApproval, setIsTestingApproval] = useState(false);

  const { approvalData, isLoading, error } = useEnsoApproval({
    fromAddress: address as Address,
    tokenAddress: tokenAddress as Address,
    amount,
    enabled: isTestingApproval && !!address && !!tokenAddress,
  });

  const handleTestApproval = () => {
    setIsTestingApproval(true);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card className="p-6 border-2 border-primary/10 shadow-md">
          <div className="flex items-center mb-4">
            <Beaker className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-xl font-semibold">Test Enso Approval</h2>
          </div>

          <div className="space-y-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="tokenAddress">Token Address</Label>
              <Input
                id="tokenAddress"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (in wei)</Label>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000000000000000000"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleTestApproval}
            disabled={!address || !tokenAddress || isLoading}
          >
            {isLoading ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : (
              <Beaker className="h-4 w-4 mr-2" />
            )}
            Test Enso Approval
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          {approvalData && (
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <Check className="h-5 w-5 mr-2 text-green-500" />
                <p className="font-medium">Approval Data Ready</p>
              </div>
              <div className="text-xs font-mono bg-background p-2 rounded overflow-auto max-h-60">
                <pre>{JSON.stringify(approvalData, null, 2)}</pre>
              </div>
            </div>
          )}
        </Card>
      </div>
    </ContentArea>
  );
}
