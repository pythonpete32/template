import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Layout,
  ShieldCheck,
  Repeat,
  SendHorizontal,
  Beaker,
} from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="flex justify-center mb-8">
          <div className="relative h-40 w-40">
            <Image
              src="/logo.png"
              alt="Based Wallet"
              fill
              priority
              className="object-contain"
              sizes="160px"
            />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-6">Welcome to Based Wallet</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Based Wallet allows you to perform multiple transactions in a single
          batch, leveraging the Base network with EIP-7702 for efficient token
          management.
        </p>
        <Link href="/batch-swap">
          <Button size="lg" className="gap-2">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border-2 border-primary/10 shadow-md bg-card relative overflow-hidden">
          <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center">
            <Layout className="h-10 w-10 text-primary opacity-30" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Layout className="h-5 w-5 mr-2 text-primary" />
            Batch Swap
          </h2>
          <p className="text-muted-foreground">
            Execute multiple swaps in a single transaction, saving on gas fees
            and streamlining your trading experience.
          </p>
        </div>

        <div className="p-6 rounded-xl border-2 border-primary/10 shadow-md bg-card relative overflow-hidden">
          <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center">
            <Repeat className="h-10 w-10 text-primary opacity-30" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Repeat className="h-5 w-5 mr-2 text-primary" />
            Sweep Tokens
          </h2>
          <p className="text-muted-foreground">
            Quickly sweep all tokens from one wallet to another in a single
            transaction with minimal effort.
          </p>
        </div>

        <div className="p-6 rounded-xl border-2 border-primary/10 shadow-md bg-card relative overflow-hidden">
          <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-10 w-10 text-primary opacity-30" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
            Revoke Approvals
          </h2>
          <p className="text-muted-foreground">
            Revoke unnecessary token approvals to improve your wallet security
            and protect your assets.
          </p>
        </div>

        <div className="p-6 rounded-xl border-2 border-primary/10 shadow-md bg-card relative overflow-hidden">
          <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center">
            <SendHorizontal className="h-10 w-10 text-primary opacity-30" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <SendHorizontal className="h-5 w-5 mr-2 text-primary" />
            Transfer
          </h2>
          <p className="text-muted-foreground">
            Transfer tokens between wallets with gas-optimized transactions and
            enhanced security.
          </p>
        </div>

        <div className="p-6 rounded-xl border-2 border-primary/10 shadow-md bg-card relative overflow-hidden">
          <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center">
            <Beaker className="h-10 w-10 text-primary opacity-30" />
          </div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Beaker className="h-5 w-5 mr-2 text-primary" />
            Testing
          </h2>
          <p className="text-muted-foreground">
            Test new features and experimental functionality to help us improve
            Based Wallet.
          </p>
        </div>
      </div>
    </main>
  );
}
