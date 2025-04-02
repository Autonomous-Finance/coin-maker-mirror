import { DistributionContext } from "@/context/distribution-context";
import { parseUnits } from "@/lib/utils";
import { Allocation } from "@/types";
import { useContext } from "react";
import { useCreateToken } from "./use-create-token";

export const useDistribution = () => {
  const context = useContext(DistributionContext);
  if (!context) {
    throw new Error(
      "useDistribution must be used within an DistributionProvider",
    );
  }

  const { token } = useCreateToken();

  const removeAllocation = (address: string) => {
    const remainingAllocations = context.allocations.filter(
      (allocation) => allocation.address !== address,
    );

    remainingAllocations.map((allocation) => ({
      ...allocation,
      percentage: Number(
        (BigInt(allocation.amount) * BigInt(100)) / BigInt(context.totalSupply),
      ),
    }));

    context.setAllocations(remainingAllocations);
  };

  const addAllocation = (address: string, amount: string, vested: number) => {
    const newAllocations = [
      ...context.allocations,
      {
        address,
        amount: parseUnits(amount, token.Denomination).toString(),
        percentage: 0,
        vested,
      },
    ].map((allocation) => ({
      ...allocation,
      percentage: Number(
        (BigInt(allocation.amount) * 100n) / BigInt(context.totalSupply),
      ),
    }));

    context.setAllocations(newAllocations);
  };

  const addBatchAllocations = (
    allocations: Omit<Allocation, "percentage">[],
  ) => {
    const newAllocations = allocations.map((allocation) => ({
      address: allocation.address,
      amount: parseUnits(allocation.amount, token.Denomination).toString(),
      percentage: Number(
        (BigInt(parseUnits(allocation.amount, token.Denomination).toString()) *
          100n) /
          BigInt(context.totalSupply),
      ),
      vested: allocation.vested,
    }));

    context.setAllocations(newAllocations);
  };

  const editAllocation = (
    address: string,
    newAmount: string,
    newVested: number,
  ) => {
    const updatedAllocations = context.allocations.map((allocation) => {
      if (allocation.address === address) {
        return {
          ...allocation,
          amount: parseUnits(newAmount, token.Denomination).toString(),
          vested: newVested,
        };
      }
      return allocation;
    });

    // Recalculate percentages for all allocations
    const recalculatedAllocations = updatedAllocations.map((allocation) => ({
      ...allocation,
      percentage: Number(
        (BigInt(allocation.amount) * 100n) / BigInt(context.totalSupply),
      ),
    }));

    context.setAllocations(recalculatedAllocations);
  };

  return {
    allocations: context.allocations,
    setAllocations: context.setAllocations,
    addAllocation,
    removeAllocation,
    editAllocation,
    totalSupply: context.totalSupply,
    addBatchAllocations,
  };
};
