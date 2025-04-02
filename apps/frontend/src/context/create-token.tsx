import type { Token } from "@/types";
import { createContext, useState, type ReactNode } from "react";

type EmptyToken = Omit<
  Token,
  "TokenProcess" | "Deployer" | "Verified" | "Status"
> & {
  WhitelistModule: boolean;
};

// Define the shape of your context value
interface CreateTokenContextValue {
  token: EmptyToken;
  setToken: (token: EmptyToken) => void;
  step: number;
  setStep: (step: number) => void;
}

// Create the context
export const CreateTokenContext = createContext<
  CreateTokenContextValue | undefined
>(undefined);

// Create a provider component
export const CreateTokenProvider = ({
  children,
  initialToken,
}: {
  children: ReactNode;
  initialToken: EmptyToken;
}) => {
  const [token, setToken] = useState<EmptyToken>(initialToken);
  const [step, setStep] = useState<number>(0);

  return (
    <CreateTokenContext.Provider value={{ token, setToken, step, setStep }}>
      {children}
    </CreateTokenContext.Provider>
  );
};
