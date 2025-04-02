import ENV from "@/env";
import useHopperPrice from "@/hooks/use-hopper-price";
import { getCurveDerived } from "@/lib/bonding-curve-calc";
import type { BondingCurve, BondingCurveDerived } from "@/types";
import { createContext, useMemo, useState, type ReactNode } from "react";


// Define the shape of your context value
interface CreateBondingCurveContextValue {
  curve: BondingCurve;
  curveDerived: BondingCurveDerived;
  setCurve: (curve: BondingCurve) => void;
  curveForCode: BondingCurve | undefined;
  curveDerivedForCode: BondingCurveDerived | undefined;
  setCurveForCode: (curve: BondingCurve | undefined) => void;
  quoteTokenPrice: number | undefined;
}

// Create the context
export const CreateBondingCurveContext = createContext<
  CreateBondingCurveContextValue | undefined
>(undefined);

// Create a provider component
export const CreateBondingCurveProvider = ({
  children,
  initialCurve,
}: { children: ReactNode; initialCurve: BondingCurve }) => {
  const [curve, setCurve] = useState<BondingCurve>(initialCurve);
  const [curveForCode, setCurveForCode] = useState<BondingCurve | undefined>(undefined);
  const { data: invQuoteTokenPrice } = useHopperPrice(ENV.VITE_WRAPPED_AR_PROCESS);
  const quoteTokenPrice = invQuoteTokenPrice ? 1 / invQuoteTokenPrice : undefined

  const curveDerived = useMemo(() => {
    return getCurveDerived(curve);
  }, [curve]);

  const curveDerivedForCode = useMemo(() => {
    return curveForCode ? getCurveDerived(curveForCode) : undefined;
  }, [curveForCode]);

  return (
    <CreateBondingCurveContext.Provider value={{ curve, curveDerived, setCurve, curveForCode, curveDerivedForCode, setCurveForCode, quoteTokenPrice }}>
      {children}
    </CreateBondingCurveContext.Provider>
  );
};
