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
    <header className="w-full py-3 px-6 md:px-8 border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center">
            <div className="relative h-[100px] w-[400px]">
              <Image
                src="/logo2.png"
                alt="Based Wallet"
                fill
                priority
                sizes="400px"
                className="object-contain object-left"
              />
            </div>
          </Link>
        </div>

        <div className="flex-1 flex justify-center">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="px-5 py-3 text-base font-bold rounded-md hover:bg-white"
                >
                  <Link href="/batch-swap">Swap</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="px-5 py-3 text-base font-bold rounded-md hover:bg-white"
                >
                  <Link href="/sweep">Sweep</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="px-5 py-3 text-base font-bold rounded-md hover:bg-white"
                >
                  <Link href="/revoke">Revoke</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="px-5 py-3 text-base font-bold rounded-md hover:bg-white"
                >
                  <Link href="/transfer">Transfer</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  className="px-5 py-3 text-base font-bold rounded-md hover:bg-white"
                >
                  <Link href="/testing">Testing</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex-1 flex justify-end">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  );
}
