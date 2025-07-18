import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Shield, Eye, TrendingUp } from "lucide-react";

export default function LPLockingInfobox() {
  return (
    <Card className="w-full h-full flex flex-col justify-center border-0">
      <CardHeader>
        <CardTitle className="text-2xl text-center mb-6">
          What Does LP Token Lockage Mean
          <br />
          and Why It Matters?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center mb-12">
          When liquidity provider (LP) tokens are locked, it means that the
          tokens cannot be withdrawn or sold until a specific time has passed.
          This mechanism is a commitment to the project's liquidity, ensuring
          stability and trust among investors.
        </CardDescription>
        <div className="grid grid-cols-3 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center text-center hover:text-emerald-300 cursor-pointer">
                  <Shield className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">
                    Investor Confidence
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs">
                  LP token lockage signals a long-term commitment from the
                  project and its developers, giving investors peace of mind
                  that liquidity won't be drained unexpectedly.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center text-center hover:text-emerald-300 cursor-pointer">
                  <Eye className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Transparency</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs">
                  Platforms like Dexi provide visibility into locked tokens,
                  allowing investors to verify the lock status and duration in
                  real time, which boosts trust.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center text-center hover:text-emerald-300 cursor-pointer">
                  <TrendingUp className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Market Stability</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs">
                  Locked LP tokens reduce the risk of sudden liquidity removal,
                  minimizing price fluctuations and contributing to a more
                  stable market environment.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
