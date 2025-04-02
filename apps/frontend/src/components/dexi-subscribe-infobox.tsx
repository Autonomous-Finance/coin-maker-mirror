import {
  AreaChartIcon,
  BarChart2Icon,
  CandlestickChartIcon,
  FolderClockIcon,
  HistoryIcon,
  ReceiptIcon,
  UsersIcon,
} from "lucide-react";
import React from "react";
import { Alert } from "./ui/alert";
import { DEXI_SUBSCRIBE_USD_PRICE } from "@/config";

export default function DexiSubscribeInfobox() {
  return (
    <div className="space-y-8">
      <p className="text-2xl text-center text-purple-300 mb-10">
        Maximize Your Token's Reach on DEXI!
        <br />
        <span className="text-xl text-purple-200">
          Subscribe today and put
          <br />
          your asset in front of eager investors.
        </span>
        <br />
      </p>
      <div className="px-6 flex flex-col gap-2 text-lg text-purple-200/70">
        <div className="flex items-center gap-2">
          <AreaChartIcon />
          Detailed analytics and performance tracking
        </div>
        <div className="flex items-center gap-2">
          <CandlestickChartIcon />
          Advanced candlestick charts
        </div>
        <div className="flex items-center gap-2">
          <BarChart2Icon />
          In-depth liquidity information
        </div>
        <div className="flex items-center gap-2">
          <FolderClockIcon />
          Liquidity lock details
        </div>
        <div className="flex items-center gap-2">
          <ReceiptIcon />
          Real-time token prices
        </div>
        <div className="flex items-center gap-2">
          <HistoryIcon />
          Historical transaction data
        </div>
        <div className="flex items-center gap-2">
          <UsersIcon />
          Token holder insights
        </div>
      </div>
      <Alert className="space-y-4 border-0 text-purple-300 text-lg flex flex-col items-center gap-2">
        Dexi Subscription Price
        <div className="text-2xl font-bold font-mono flex items-center gap-2">
          <span>{DEXI_SUBSCRIBE_USD_PRICE} USD</span>
          <span className="text-sm font-light">(one time fee)</span>
        </div>
      </Alert>
    </div>
  );
}
