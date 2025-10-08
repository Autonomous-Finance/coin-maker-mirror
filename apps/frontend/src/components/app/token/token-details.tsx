import CurrencyDisplay from "@/components/cryptoui/currency-display";
import HashDisplay from "@/components/cryptoui/hash-display";
import TickerDisplay from "@/components/cryptoui/ticker-display";
import { useToken } from "@/hooks/use-token";

export default function TokenDetails() {
  const { token } = useToken();

  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-bold">Token Details</legend>

      <div className="flex flex-col gap-4">
        <div>
          <div className="text-sm font-mono">Process ID</div>
          <div className="text-sm">
            <HashDisplay
              hash={token.TokenProcess}
              copyButton={true}
              link={`https://ao.link/#/entity/${token.TokenProcess}`}
            />
          </div>
        </div>
        <div>
          <div className="text-sm font-mono">Deployer</div>
          <div className="text-sm">
            <HashDisplay
              hash={token.Deployer}
              copyButton={true}
              link={`https://ao.link/#/entity/${token.Deployer}`}
            />
          </div>
        </div>
        <div>
          <div className="text-sm font-mono mb-2">Name</div>
          <div className="text-sm">{token.Name}</div>
        </div>
        <div>
          <div className="text-sm font-mono mb-2">Ticker</div>
          <div className="text-sm">
            <TickerDisplay>{token.Ticker}</TickerDisplay>
          </div>
        </div>
        <div>
          <div className="text-sm font-mono mb-2">Total Supply</div>
          <div className="text-sm">
            <CurrencyDisplay
              amount={token.TotalSupply}
              decimals={token.Denomination}
            />
          </div>
        </div>
        <div>
          <div className="text-sm font-mono mb-2">Denomination</div>
          <div className="text-sm">{token.Denomination}</div>
        </div>
      </div>
    </fieldset>
  );
}
