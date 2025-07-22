import type { Allocation } from "@/types";
import { type ReactNode, createContext, useState } from "react";

// Define the shape of your context value
interface DistributionContextValue {
  totalSupply: string;
  allocations: Allocation[];
  setAllocations: (allocations: Allocation[]) => void;
}

// Create the context
export const DistributionContext = createContext<
  DistributionContextValue | undefined
>(undefined);

// Create a provider component
export const DistributionProvider = ({
  children,
  totalSupply,
  initialAllocations,
}: {
  children: ReactNode;
  totalSupply: string;
  initialAllocations: Allocation[];
}) => {
  const [allocations, setAllocations] =
    useState<Allocation[]>(initialAllocations);

  return (
    <DistributionContext.Provider
      value={{
        totalSupply,
        allocations,
        setAllocations,
      }}
    >
      {children}
    </DistributionContext.Provider>
  );
};
