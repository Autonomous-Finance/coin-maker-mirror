import { createContext, useState, type ReactNode } from "react";

export type Step = {
  id: number;
  label: string;
  description?: string;
  status: "pending" | "current" | "success" | "error";
};

// Define the shape of your context value
interface StepsLoadingContextValue {
  steps: Step[];
  updateStep: (id: number, status: Step["status"]) => void;
}

// Create the context
export const StepsLoadingContext = createContext<
  StepsLoadingContextValue | undefined
>(undefined);

// Create a provider component
export const StepsLoadingProvider = ({
  children,
  initialSteps = [],
}: { children: ReactNode; initialSteps: Step[] }) => {
  const [steps, setSteps] = useState<Step[]>(initialSteps);

  function updateStep(id: number, status: Step["status"]) {
    setSteps((steps) => {
      return steps.map((step) => {
        if (step.id === id) {
          return {
            ...step,
            status,
          };
        }

        return step;
      });
    });
  }

  return (
    <StepsLoadingContext.Provider value={{ steps, updateStep }}>
      {children}
    </StepsLoadingContext.Provider>
  );
};
