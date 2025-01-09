import type { PairToken } from "@/types";
import { createContext, useContext, useState, type ReactNode } from "react";

// Define the shape of your context value
interface CreateLPContextValue {
  pairToken: PairToken | undefined;
  setPairToken: (token: PairToken | undefined) => void;

  tokenAmount: string;
  setTokenAmount: (amount: string) => void;

  pairTokenAmount: string;
  setPairTokenAmount: (amount: string) => void;
}

// Create the context
export const CreateLPContext = createContext<CreateLPContextValue | undefined>(
  undefined,
);

// Create a provider component
export const CreateLPProvider = ({
  children,
  initialPairToken,
}: { children: ReactNode; initialPairToken: PairToken }) => {
  const [pairToken, setPairToken] = useState<PairToken | undefined>(
    initialPairToken,
  );
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [pairTokenAmount, setPairTokenAmount] = useState<string>("");

  return (
    <CreateLPContext.Provider
      value={{
        pairToken,
        setPairToken,
        tokenAmount,
        setTokenAmount,
        pairTokenAmount,
        setPairTokenAmount,
      }}
    >
      {children}
    </CreateLPContext.Provider>
  );
};

// Create a hook to use the context
export const useCreateLP = () => {
  const context = useContext(CreateLPContext);

  if (!context) {
    throw new Error("useCreateLP must be used within a CreateLPProvider");
  }

  return context;
};
