import { TokenContext } from "@/context/token";
import { useContext } from "react";

// Create a consumer hook
export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within an TokenProvider");
  }

  return {
    token: context.token,
  };
};
