import { CurrencyDisplayInside } from "@/components/cryptoui/currency-display";
import TokenLogo from "@/components/cryptoui/token-logo";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useUnknownTokenDetails from "@/hooks/use-unknown-token-details";
import type { Token } from "@/types";

export default function PoolReserves({
  token,
  pairToken,
  tokenReserves,
  pairTokenReserves,
}: {
  token: string;
  pairToken: string;
  tokenReserves: string;
  pairTokenReserves: string;
}) {
  const { data: tokenDetails } = useUnknownTokenDetails({
    tokenProcess: token,
  });
  const { data: pairTokenDetails } = useUnknownTokenDetails({
    tokenProcess: pairToken,
  });

  if (tokenDetails && pairTokenDetails) {
    return (
      <div className="flex relative gap-4">
        <Badge className="flex items-center gap-2 p-2" variant="outline">
          <TokenLogo token={tokenDetails as Token} big="w-6 h-6" />
          <CurrencyDisplayInside
            amount={tokenReserves}
            decimals={tokenDetails?.Denomination}
            ticker={tokenDetails?.Ticker}
          />
        </Badge>
        <Badge className="flex items-center gap-2 p-2" variant="outline">
          <TokenLogo token={pairTokenDetails as Token} big="w-6 h-6" />
          <CurrencyDisplayInside
            amount={pairTokenReserves}
            decimals={pairTokenDetails.Denomination}
            ticker={pairTokenDetails.Ticker}
          />
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Skeleton className="w-24 h-8 border-dashed rounded-bl-3xl rounded-tl-3xl border" />
      <Skeleton className="w-24 h-8 border-dashed rounded-br-3xl rounded-tr-3xl border" />
    </div>
  );
}
