"use client";

import { useAccount } from "wagmi";
import { ContentArea } from "@/components/ContentArea";
import { Card } from "@/components/ui/card";
import { Beaker, Wallet } from "lucide-react";
import Image from "next/image";
import { TokenApproval } from "@/components/TokenApproval";

export default function TestingPage() {
  const { address } = useAccount();

  const handleApprovalData = (data: unknown) => {
    console.log("Approval data received:", data);
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

        <div className="grid grid-cols-1 gap-6">
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
