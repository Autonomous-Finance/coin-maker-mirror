import { StepsLoadingContext } from "@/context/steps-loading";
import { useContext } from "react";

// Create a consumer hook
export const useStepsLoading = () => {
  const context = useContext(StepsLoadingContext);
  if (!context) {
    throw new Error(
      "useStepsLoading must be used within an StepsLoadingProvider",
    );
  }

  return {
    steps: context.steps,
    updateStep: context.updateStep,
  };
};
