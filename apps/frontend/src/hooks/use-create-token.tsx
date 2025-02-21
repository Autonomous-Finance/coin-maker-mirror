import { CreateTokenContext } from "@/context/create-token";
import { useContext } from "react";

// Create a consumer hook
export const useCreateToken = () => {
  const context = useContext(CreateTokenContext);
  if (!context) {
    throw new Error(
      "useCreateToken must be used within an CreateTokenProvider",
    );
  }

  return {
    token: context.token,
    setToken: context.setToken,
    step: context.step,
    setStep: context.setStep,
  };
};
