"use client";

import { useState } from "react";
import Image from "next/image";
import { useEnsoTokens } from "@/hooks/useEnsoTokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from "lucide-react";
import type { TokenData } from "@ensofinance/sdk";

interface TokenListProps {
  onSelectToken?: (token: TokenData) => void;
  filterType?: "base" | "defi" | null; // optional filter for token type
}

export function TokenList({
  onSelectToken,
  filterType = null,
}: TokenListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch tokens from Enso with metadata included (defaults to true in our hook)
  const { tokens, isLoading, error } = useEnsoTokens({
    type: filterType || undefined, // Only pass if not null
  });

  // Filter tokens based on search term
  const filteredTokens = tokens?.filter((token) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      token.name?.toLowerCase().includes(term) ||
      token.symbol?.toLowerCase().includes(term) ||
      token.address.toLowerCase().includes(term)
    );
  });

  const handleSelectToken = (token: TokenData) => {
    if (onSelectToken) {
      onSelectToken(token);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search tokens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-md">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Loading tokens...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">
            <p>Error loading tokens</p>
            <p className="text-sm">{error.message}</p>
          </div>
        ) : filteredTokens && filteredTokens.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="grid gap-1 p-2">
              {filteredTokens.map((token) => (
                <Button
                  key={`${token.chainId}-${token.address}`}
                  variant="neutral"
                  className="flex items-center justify-between w-full h-auto py-2"
                  onClick={() => handleSelectToken(token)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 relative rounded-full overflow-hidden bg-background">
                      {token.logosUri && token.logosUri.length > 0 ? (
                        <Image
                          src={token.logosUri[0]}
                          alt={token.symbol || "token"}
                          fill
                          className="object-contain"
                          sizes="32px"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-xs">
                          {token.symbol?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">
                        {token.symbol || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {token.name || token.address}
                      </div>
                    </div>
                  </div>

                  {token.type === "defi" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      DeFi
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No tokens found</p>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          Total tokens: {filteredTokens?.length || 0} / {tokens?.length || 0}
        </p>
      </div>
    </div>
  );
}
