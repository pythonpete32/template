"use client";

import Link from "next/link";
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
        <Link href="/" className="text-2xl font-heading text-primary">
          Template
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/batch-swap" legacyBehavior passHref>
                <NavigationMenuLink className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading">
                  Batch Swap
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/sweep" legacyBehavior passHref>
                <NavigationMenuLink className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading">
                  Sweep
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/revoke" legacyBehavior passHref>
                <NavigationMenuLink className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading">
                  Revoke
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/testing" legacyBehavior passHref>
                <NavigationMenuLink className="px-4 py-2 text-main-foreground hover:bg-secondary-background rounded-base font-heading">
                  Testing
                </NavigationMenuLink>
              </Link>
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
