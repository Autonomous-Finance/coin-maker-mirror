import LiquidityPools from "@/components/app/liquidity-pools";
import TokenInitialBalances from "@/components/app/token-initial-balances";
import TokenBalances from "@/components/app/token/token-balances";
import { useToken } from "@/hooks/use-token";

export default function TokenPage() {
  const { token } = useToken();

  if (token.Status === "DEPLOYED") {
    return (
      <>
        <LiquidityPools />
        <TokenBalances />
        <TokenInitialBalances />
      </>
    );
  }
}
