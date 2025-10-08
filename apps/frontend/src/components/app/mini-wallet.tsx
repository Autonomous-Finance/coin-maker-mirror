import { useToken } from "@/hooks/use-token";
import useTokenVested from "@/hooks/use-token-vested";
import { createDataItemSigner, message } from "@permaweb/aoconnect";
import dayjs from "dayjs";
import fromExponential from "from-exponential";
import { useState } from "react";
import { CurrencyDisplayInside } from "../cryptoui/currency-display";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function MiniWallet() {
  const { token } = useToken();
  const { data: vested, isLoading: isLoadingBalance } = useTokenVested(
    token.TokenProcess,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function testSend() {
    setIsLoading(true);

    try {
      await message({
        process: token.TokenProcess,
        tags: [
          { name: "Action", value: "Transfer" },
          {
            name: "Recipient",
            value: "8z6dBxlQpJHnhpsoWs3lD4IkeK3gSFG-7YU3f4WmqjQ",
          },
          { name: "Quantity", value: "10000000000000000000000" },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      setIsLoading(false);

      window.location.reload();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  if (isLoadingBalance || !vested) {
    return (
      <Card className="w-[24rem]">
        <CardHeader>
          <Skeleton className="w-[150px] h-[20px] rounded-sm" />
        </CardHeader>
        <CardContent className="hidden">
          <Skeleton className="w-[150px] h-[20px] rounded-sm" />
        </CardContent>
      </Card>
    );
  }

  const currentTimestamp = dayjs(Number(vested["Current-Timestamp"]));
  const vestedUntil = dayjs(Number(vested["Vested-Until"]));

  return (
    <Card className="w-[24rem]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <span className="text-sm">Your Balance</span>
          <div>
            <CurrencyDisplayInside
              amount={fromExponential(vested.Balance)}
              decimals={token.Denomination}
              ticker={token.Ticker}
            />
          </div>
        </div>
        {currentTimestamp.isBefore(vestedUntil) && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Vested</span>
            <div className="flex flex-col items-end">
              <CurrencyDisplayInside
                amount={fromExponential(vested["Vested-Amount"])}
                decimals={token.Denomination}
                ticker={token.Ticker}
              />
              <span className="text-sm text-muted-foreground">
                until {vestedUntil.format("MMM D, YYYY")}
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="hidden">
        <Button onClick={testSend} disabled={isLoading}>
          Send
        </Button>
      </CardContent>
    </Card>
  );
}
