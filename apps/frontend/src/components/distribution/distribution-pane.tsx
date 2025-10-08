import { Button } from "@/components/ui/button";
import { useCreateToken } from "@/hooks/use-create-token";
import { useDistribution } from "@/hooks/use-distribution";
import { cn } from "@/lib/utils";
import type { Allocation } from "@/types";
import { useActiveAddress } from "arweave-wallet-kit";
import { MinusCircleIcon } from "lucide-react";
import { CurrencyDisplayInside } from "../cryptoui/currency-display";
import DisplayVestedPeriod from "../display-vested-period";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { AddAllocationDialog } from "./add-allocation-dialog";
import { EditAllocationDialog } from "./edit-allocation-dialog";
import CircularProgress from "../ui/circular-progress";

function DistributionProgressRow({ allocation }: { allocation: Allocation }) {
  const userAddress = useActiveAddress();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            key={allocation.address}
            className={cn(
              "flex flex-col justify-center overflow-hidden text-md font-mono h-10 text-white text-center whitespace-nowrap",
              allocation.address === userAddress
                ? "bg-indigo-800/50"
                : "bg-[#5F05DE]",
              allocation.address === "Unallocated"
                ? "bg-gray-300 dark:bg-slate-800"
                : "bg-[#5F05DE]"
            )}
            style={{ width: `${allocation.percentage}%` }}
            role="progressbar"
            aria-valuenow={allocation.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {allocation.percentage.toFixed(2)}%
          </div>
        </TooltipTrigger>
        <TooltipContent>{allocation.address}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function DistributionProgress() {
  const { allocations, totalSupply } = useDistribution();

  const totalAllocated = allocations.reduce(
    (acc, cur) => acc + BigInt(cur.amount),
    0n
  );
  const remaining = BigInt(totalSupply) - totalAllocated;
  const remainingPercentage = Number((remaining * 100n) / BigInt(totalSupply));

  return (
    <div className="flex items-center w-full h-10 bg-gray-200 rounded-sm overflow-hidden dark:bg-slate-700 gap-0.5">
      <DistributionProgressRow
        key={"Unallocated"}
        allocation={{
          address: "Unallocated",
          amount: remaining.toString(),
          percentage: remainingPercentage,
          vested: 0,
        }}
      />
      {allocations.map((allocation) => (
        <DistributionProgressRow
          key={allocation.address}
          allocation={allocation}
        />
      ))}
    </div>
  );
}

function AllocationsTable({ disabled }: { disabled?: boolean }) {
  const { token } = useCreateToken();
  const { allocations, removeAllocation } = useDistribution();

  return (
    <div className="space-y-4">
      {allocations.map((allocation) => (
        <div
          key={allocation.address}
          className="flex items-center justify-between p-4 gap-4 rounded-md bg-secondary"
        >
          <div className="flex items-center justify-center">
            <CircularProgress
              value={allocation.percentage}
              size={64}
              strokeWidth={8}
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="font-mono">{allocation.address}</div>
            <div className="text-lg">
              <CurrencyDisplayInside
                amount={allocation.amount}
                decimals={token.Denomination}
                ticker={token.Ticker}
              />
            </div>
          </div>
          <td className="pl-2 flex items-center gap-2">
            <EditAllocationDialog allocation={allocation} />
            <Button
              variant="ghost"
              className="text-red-700 px-1"
              onClick={() => removeAllocation(allocation.address)}
              disabled={disabled}
            >
              <MinusCircleIcon />
            </Button>
          </td>
        </div>
      ))}
    </div>
  );
}

export default function DistributionPane({ disabled }: { disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Distribution progress */}
      <DistributionProgress />

      <AllocationsTable disabled={disabled} />

      {/* Add allocation dialog */}
      <AddAllocationDialog disabled={disabled} />
    </div>
  );
}
