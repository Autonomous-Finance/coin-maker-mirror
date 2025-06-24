import ErrorDisplay from "@/components/error-display";
import TokensCallToAction from "@/components/landing/tokens-cta";
import { TokenCardExtended, TokenCardSkeleton } from "@/components/token-card";
import { Input } from "@/components/ui/input";
import useTokensList from "@/hooks/use-tokens-list";
import type { Token } from "@/types";
import { useState } from "react";

function TokensSkeleton() {
  const tokens = Array.from({ length: 3 }, (_, i) => i);

  return tokens.map((token) => <TokenCardSkeleton key={token} />);
}

function TokensList({ tokens }: { tokens: Token[] }) {
  const [filteredTokens, setFilteredTokens] = useState(
    tokens?.filter((token) => token.TokenProcess && token.Status === "DEPLOYED")
  );

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const filtered = tokens
      .filter((token) => token.TokenProcess && token.Status === "DEPLOYED")
      .filter((token) =>
        token.Name.toLowerCase().includes(value.toLowerCase())
      );
    setFilteredTokens(filtered);
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
          <Input placeholder="Search tokens" onChange={handleSearch} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {filteredTokens.map((token) => (
          <TokenCardExtended key={token.TokenProcess} token={token} />
        ))}
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
