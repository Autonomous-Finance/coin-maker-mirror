import type { PoolDetails } from "@/types";
import { createContext, useContext, useState, type ReactNode } from "react";

// Define the shape of your context value
interface LPContextValue {
  address: string;
  details: PoolDetails;
  setPool: (details: PoolDetails) => void;
}

// Create the context
export const LPContext = createContext<LPContextValue | undefined>(undefined);

// Create a provider component
export const LPProvider = ({
  children,
  poolDetails,
  address,
}: { children: ReactNode; address: string; poolDetails: PoolDetails }) => {
  const [details, setPool] = useState<PoolDetails>(poolDetails);

  return (
    <LPContext.Provider
      value={{
        address,
        details,
        setPool,
      }}
    >
      {children}
    </LPContext.Provider>
  );
};

// Create a hook to use the context
export const useLP = () => {
  const context = useContext(LPContext);

  if (!context) {
    throw new Error("useLP must be used within a LPProvider");
  }

  return context;
};
