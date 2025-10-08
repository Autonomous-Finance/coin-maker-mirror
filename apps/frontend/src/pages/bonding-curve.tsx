import Boilerplate from "@/components/app/bonding-curve/boilerplate";
import BondingCurveDocsRef from "@/components/app/bonding-curve/docs-reference";
import BondingCurveMentalModel from "@/components/app/bonding-curve/mental-model";
import BondingCurvePreview from "@/components/app/bonding-curve/preview";
import CreateBondingCurveForm from "@/components/app/create-bonding-curve-form";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { CreateBondingCurveProvider } from "@/context/create-bonding-curve";
import { LogsProvider } from "@/context/logs";
import { cn } from "@/lib/utils";
import { BondingCurve } from "@/types";

export function Header() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14">
      <h1 className="text-3xl font-bold lg:text-4xl mb-4">Configure and Generate Your Custom Bonding Curve</h1>
      <p>
        This interface helps you design and implement a custom bonding curve mechanic for an asset on the AO network.
      </p>
      <p>
        It includes a configurable curve setup, integrated buy/sell functionality, and a smooth liquidity migration process to the Botega DEX.
      </p>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.5}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
    </div>
  );
}

export default function BondingCurveRoot() {
  const initialCurve: BondingCurve = {
    targetMCap: 1984,
    targetSupply: 5000,
    curveRR: 0.35,
    curveFee: 1,
    lpTokensToBurn: 50,
    devAccount: '',
    supplyToken: '',
    supplyTokenTicker: 'xCOIN',
    supplyTokenDenomination: 18
  };

  return (
    <CreateBondingCurveProvider initialCurve={initialCurve}>
      <LogsProvider initialLogs={[]}>
        <div className="container">
          <Header />
          <BondingCurveMentalModel />
          <BondingCurveDocsRef />
          <div className="grid grid-cols-9 gap-6 py-4 mt-6">
            <div className="col-span-4 space-y-6">
              <CreateBondingCurveForm/>
            </div>
            <div className="col-span-5 space-y-6">
              <BondingCurvePreview />
            </div>
            <div className="col-span-8 space-y-6">
              <Boilerplate />
            </div>
          </div>
        </div>
      </LogsProvider>
    </CreateBondingCurveProvider>
  );
}