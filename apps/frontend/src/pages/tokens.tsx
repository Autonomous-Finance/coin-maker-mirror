import ErrorDisplay from "@/components/error-display";
import TokensCallToAction from "@/components/landing/tokens-cta";
import { TokenCardExtended, TokenCardSkeleton } from "@/components/token-card";
import { Input } from "@/components/ui/input";
import useTokensList from "@/hooks/use-tokens-list";
import type { Token } from "@/types";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState, useMemo } from "react";

function TokensSkeleton() {
  const tokens = Array.from({ length: 3 }, (_, i) => i);

  return tokens.map((token) => <TokenCardSkeleton key={token} />);
}

function TokensList({ tokens }: { tokens: Token[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  
  const filteredTokens = useMemo(() => {
    const deployed = tokens?.filter((token) => token.TokenProcess && token.Status === "DEPLOYED") || [];
    if (!searchValue) return deployed;
    
    return deployed.filter((token) =>
      token.Name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [tokens, searchValue]);

  // Calculate rows for grid layout (3 columns)
  const rows = useMemo(() => {
    const items = [];
    for (let i = 0; i < filteredTokens.length; i += 3) {
      items.push(filteredTokens.slice(i, i + 3));
    }
    return items;
  }, [filteredTokens]);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Reduced estimate for actual card height + gap
    overscan: 2, // Render 2 items outside visible area
  });

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue(event.target.value);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Tokens</h1>
          <p className="text-lg text-muted-foreground">
            List of all tokens deployed via CoinMaker
          </p>
        </div>
        <div>
          <Input placeholder="Search tokens" value={searchValue} onChange={handleSearch} />
        </div>
      </div>
      <div
        ref={parentRef}
        className="overflow-auto scrollbar-hide"
        style={{ height: "calc(100vh - 250px)" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="grid grid-cols-3 gap-4">
                  {row.map((token) => (
                    <TokenCardExtended key={token.TokenProcess} token={token} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function TokensPage() {
  const { data: tokens, isLoading, error } = useTokensList();

  if (isLoading || !tokens) {
    return (
      <div className="container flex flex-col gap-6">
        <TokensCallToAction />
        <TokensSkeleton />
      </div>
    );
  }

  return (
    <div className="container flex flex-col gap-6">
      <TokensCallToAction />

      {error && <ErrorDisplay>{error.message}</ErrorDisplay>}

      <TokensList tokens={tokens.reverse()} />
    </div>
  );
}
