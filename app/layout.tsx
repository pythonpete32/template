import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Web3Provider } from "./providers";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Based Wallet - Batch Operations on Base Network",
  description:
    "A powerful wallet for batch transactions and token management on the Base network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Web3Provider>
          <Header />
          <div className="min-h-[calc(100vh-100px)] bg-background flex flex-col pt-4">
            {children}
          </div>
        </Web3Provider>
        <Toaster />
      </body>
    </html>
  );
}
