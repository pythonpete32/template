"use client";

import Link from "next/link";
import { CustomConnectButton } from "./ConnectButton";

export function Header() {
  return (
    <header className="w-full py-4 px-6 md:px-8 border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-heading text-primary">
          Template
        </Link>
        <div className="flex items-center space-x-2 md:space-x-4">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  );
}
