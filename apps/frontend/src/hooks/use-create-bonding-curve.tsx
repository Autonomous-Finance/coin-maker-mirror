import { CreateBondingCurveContext } from "@/context/create-bonding-curve";
import { useContext } from "react";

// Create a consumer hook
export const useCreateBondingCurve = () => {
  const context = useContext(CreateBondingCurveContext);
  if (!context) {
    throw new Error(
      "useCreateBondingCurve must be used within an CreateBondingCurveProvider",
    );
  }

  return context;
};
