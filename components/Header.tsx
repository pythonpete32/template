"use client";

import Link from "next/link";
import Image from "next/image";
import { CustomConnectButton } from "./ConnectButton";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

export function Header() {
  return (
    <header className="w-full py-4 px-6 md:px-8 border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="relative h-16 w-16 md:h-24 md:w-24">
            <Image
              src="/logo.png"
              alt="Based Wallet"
              fill
              priority
              sizes="(max-width: 768px) 64px, 96px"
              className="object-contain"
            />
          </div>
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading"
              >
                <Link href="/batch-swap">Batch Swap</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading"
              >
                <Link href="/sweep">Sweep</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading"
              >
                <Link href="/revoke">Revoke</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading"
              >
                <Link href="/transfer">Transfer</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading"
              >
                <Link href="/testing">Testing</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-2 md:space-x-4">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  );
}
