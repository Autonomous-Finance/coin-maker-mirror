import type { Token } from "@/types";
import { createContext, useState, type ReactNode } from "react";

// Define the shape of your context value
interface TokenContextValue {
  token: Token;
  setToken: (token: Token) => void;
}

// Create the context
export const TokenContext = createContext<TokenContextValue | undefined>(
  undefined,
);

// Create a provider component
export const TokenProvider = ({
  children,
  initialToken,
}: { children: ReactNode; initialToken: Token }) => {
  const [token, setToken] = useState<Token>(initialToken);

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};
