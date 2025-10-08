import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCreateToken } from "@/hooks/use-create-token";
import { useDistribution } from "@/hooks/use-distribution";
import { useLogs } from "@/hooks/use-logs";
import { cn, parseUnits } from "@/lib/utils";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useActiveAddress } from "arweave-wallet-kit";
import dayjs from "dayjs";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DistributionPane from "../../distribution/distribution-pane";
import DisplayLogs from "../display-logs";
import ShineBorder from "@/components/ui/shine-border";

export default function DistributionForm() {
  const { token, setToken } = useCreateToken();
  const [isLoading, setIsLoading] = useState(false);
  const { allocations } = useDistribution();
  const { logs, addLog } = useLogs();
  const address = useActiveAddress();
  const navigate = useNavigate();
  const router = useRouter();

  const totalSupply = parseUnits(token.TotalSupply, token.Denomination);

  async function onSubmit() {
    setIsLoading(true);

    try {
      const day = dayjs();
      const balances = allocations.reduce(
        (acc, allocation) => {
          acc[allocation.address] = {
            Amount: allocation.amount,
            Vesting: day.add(allocation.vested, "days").valueOf().toString(),
          };
          return acc;
        },
        {} as Record<
          string,
          {
            Amount: string;
            Vesting: string;
          }
        >,
      );

      // Set new token values
      setToken({
        ...token,
        Balances: balances,
      });

      navigate({
        to: "/create-token/deploy",
      });

      setIsLoading(false);
    } catch (error) {
      addLog("🚫 Failed to deploy token");
      console.error(error);
      toast.error("🚫 Failed to deploy token", {
        description:
          "An error occurred while deploying the token. Please check the logs for more details.",
      });
      setIsLoading(false);
    }
  }

  const isUserWalletInAllocations = allocations.some(
    (allocation) => allocation.address === address,
  );

  const isTotalAllocationsEqualToSupply =
    allocations.reduce(
      (acc, allocation) => acc + Number(allocation.amount),
      0,
    ) === Number(totalSupply);

  return (
    <div className="container">
      <div
        className={cn(
          "max-w-3xl w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-2 space-y-12",
          isLoading ? "opacity-50" : null,
        )}
      >
        <fieldset
          className={cn(
            "grid gap-6 rounded-lg border p-4",
            isLoading ? "opacity-50" : null,
          )}
        >
          <legend className="-ml-1 px-1 text-sm font-medium">
            Distribution
          </legend>
          <p className="text-sm text-muted-foreground">
            Setup how your coin should be initially distributed.
          </p>

          <DistributionPane />
        </fieldset>
      </div>
      <div className="max-w-3xl w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-4 flex flex-col space-y-12">
        {!isUserWalletInAllocations && (
          <Alert className="bg-orange-600/20 border-orange-500">
            <AlertTitle className="text-orange-500">
              Your wallet address is not in the list of allocations.
            </AlertTitle>
            <AlertDescription className="text-orange-400">
              You will not receive any coins and you will not be able to create
              any Liquidity Pools.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.history.back()}
          >
            Back
          </Button>
          <Button
            type="button"
            className="flex w-full flex-grow items-center gap-2"
            onClick={() => onSubmit()}
            disabled={isLoading || !isTotalAllocationsEqualToSupply}
          >
            {isLoading ? (
              "Saving details..."
            ) : (
              <>
                Generate Token Blueprint <ChevronRight />
              </>
            )}
          </Button>
        </div>
        {logs?.length ? <DisplayLogs logs={logs} /> : null}
      </div>
    </div>
  );
}
