import { useToken } from "@/hooks/use-token";
import TokenBalancesTable from "./token-balances-table";
import TickerDisplay from "@/components/cryptoui/ticker-display";

export default function TokenBalances() {
  const { token } = useToken();

  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-bold">
        <TickerDisplay>{token.Ticker}</TickerDisplay> Balances
      </legend>

      <TokenBalancesTable />
    </fieldset>
  );
}
