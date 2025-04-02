import TokenCard, { TokenCardSkeleton } from "@/components/token-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import useUserTokensList from "@/hooks/use-user-tokens";
import { cn } from "@/lib/utils";
import type { Token } from "@/types";
import { Link } from "@tanstack/react-router";

function TokenSkeleton({ token }: { token: Token }) {
  return (
    <Card className="opacity-50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold flex flex-col">
            {token.Ticker}
            <span className="text-muted-foreground text-sm">{token.Name}</span>
          </h2>
          <Badge variant="outline">pending spawn</Badge>
        </div>
      </CardHeader>
      <div className="p-4">
        <p className="text-sm">Token process is not spawned yet.</p>
      </div>
    </Card>
  );
}

function TokensSkeleton() {
  const tokens = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div className="flex flex-wrap gap-6">
      {tokens.map((token) => (
        <TokenCardSkeleton key={token} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { isLoading, data: tokens } = useUserTokensList();

  return (
    <div className="container flex flex-col gap-6">
      <div
        className="flex items-center justify-center rounded-lg border border-dashed shadow-sm h-[16rem]"
        x-chunk="dashboard-02-chunk-1"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            You have {isLoading || !tokens ? "?" : tokens.length} tokens
            deployed.
          </h3>
          <Link to="/create-token" className={cn(buttonVariants(), "mt-4")}>
            Create New Token
          </Link>
        </div>
      </div>

      {isLoading ? (
        <TokensSkeleton />
      ) : (
        <div className="flex flex-wrap gap-6">
          {tokens?.map((token) =>
            !token.TokenProcess ? (
              <TokenSkeleton key={token.Name} token={token} />
            ) : (
              <TokenCard key={token.TokenProcess} token={token} status={true} />
            )
          )}
        </div>
      )}
    </div>
  );
}
