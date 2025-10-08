import { Badge } from "@/components/ui/badge";
import useTokenPools from "@/hooks/use-token-pools";
import { cn } from "@/lib/utils";
import type { Token } from "@/types";
import { Link } from "@tanstack/react-router";
import { CheckCheck, XIcon } from "lucide-react";
import TokenLogo from "./cryptoui/token-logo";
import { Skeleton } from "./ui/skeleton";
import TickerDisplay from "./cryptoui/ticker-display";

export function TokenCardSkeleton() {
  return (
    <figure
      className={cn(
        "relative min-w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-primary/20 dark:hover:border-primary"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="w-12 h-12 bg-gray-950 rounded-full" />
        <div className="flex flex-col">
          <Skeleton className="w-[100px] h-4 mb-2" />
          <Skeleton className="w-[40px] h-6" />
        </div>
        <Skeleton className="w-[40px] h-2 ml-24" />
      </div>
    </figure>
  );
}

export default function TokenCard({
  token,
  status = false,
  description = false,
  size = "small",
}: {
  token: Token;
  status?: boolean;
  description?: boolean;
  size?: "small" | "large";
}) {
  return (
    <figure
      className={cn(
        "relative min-w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-primary/20 dark:hover:border-primary"
      )}
    >
      <Link to="/token/$tokenId" params={{ tokenId: token.TokenProcess }}>
        <div
          className={cn(
            "flex flex-row items-center",
            size === "large" ? "gap-12" : "gap-2"
          )}
        >
          <TokenLogo token={token} big={size === "large"} />
          <div className="flex flex-col">
            <figcaption className="text-sm text-muted-foreground font-light">
              {token.Name}
            </figcaption>
            <p className="text-lg font-medium dark:text-white">
              {token.Ticker}
            </p>
            {description ? (
              <p className="text-sm text-muted-foreground mt-6">
                {token.Description}
              </p>
            ) : null}
          </div>
          {status ? (
            <Badge variant="outline" className="ml-12">
              {token.Status}
            </Badge>
          ) : null}
        </div>
      </Link>
    </figure>
  );
}

export function TokenCardExtended({ token }: { token: Token }) {
  const { data: lps } = useTokenPools({ tokenProcess: token.TokenProcess });

  return (
    <figure
      className={cn(
        "relative min-w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-primary/20 dark:hover:border-primary"
      )}
    >
      <Link to="/token/$tokenId" params={{ tokenId: token.TokenProcess }}>
        <div className="flex items-center justify-between">
          <div className={cn("flex flex-row items-center gap-4")}>
            <TokenLogo token={token} big={false} />
            <div className="flex flex-col">
              <figcaption className="text-sm text-muted-foreground font-light">
                {token.Name}
              </figcaption>
              <p className="text-lg font-medium dark:text-white">
                <TickerDisplay>{token.Ticker}</TickerDisplay>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="py-1 px-4 rounded-md">
              {lps?.length} LPs
            </Badge>
          </div>
        </div>
      </Link>
    </figure>
  );
}
