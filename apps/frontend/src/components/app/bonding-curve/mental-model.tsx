import { BotegaLogo } from "@/components/botega-logo";
import { ChevronRight, Spline, SquareDashedBottomCode } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";

export default function BondingCurveMentalModel() {
  return (
    <div className="relative flex flex-col h-full w-full items-center justify-center gap-6 overflow-hidden p-10 py-14">
      <h1 className="z-10 text-xl font-medium lg:text-2xl tracking-widest">
        Bonding Curve Life Cycle
      </h1>
      <div className="z-10 flex w-full max-w-[1200px] h-full justify-between gap-2">
        <div className="h-[346px] min-w-[320px] flex flex-col mx-auto rounded-lg border p-4 shadow-2xl backdrop-blur-md dark:bg-black/10">
          <div className="">
            <SquareDashedBottomCode className="mx-auto size-16 text-black dark:text-white" />
          </div>
          <div className="mt-6 flex flex-col items-start dark:text-white text-left">
            <h4 className="text-medium font-medium">1. Configure & Deploy</h4>
            <div className='mt-4 text-sm text-gray-300'>
              <ul className="list-disc ml-4">
                <li>Define parameters such as the Bonding Curve Market Cap (formerly 'Target Liquidity') and Fees (%).</li>
                <li>Establish the initial supply and pricing structure.</li>
              </ul>
              <p className="mt-6 italic text-sm">
                Tooltips and question marks provide extra info.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center w-full">
          <Separator.Root className="h-[1px] w-full bg-slate-300" />
          <div className="w-6 h-6"><ChevronRight /></div>
          <Separator.Root className="h-[1px] w-full bg-slate-300" />
        </div>
        <div className="h-[346px] min-w-[320px] flex flex-col mx-auto rounded-lg border p-4 shadow-2xl backdrop-blur-md dark:bg-black/10">
          <div className="">
            <Spline className="mx-auto size-16 text-black dark:text-white rotate-180" />
          </div>
          <div className="mt-6 flex flex-col items-start dark:text-white text-left">
            <h4 className="text-medium font-medium">2. Active Buy & Sell Phase</h4>
            <div className='mt-4 text-sm text-gray-300'>
              <ul className="list-disc ml-4">
                <li>Users can buy or sell tokens directly from the bonding curve.</li>
                <li>Fees (in %) are applied on each transaction.</li>
                <li>Real-time metrics show accumulated fees and current price.</li>
              </ul>
              <p className="mt-6 italic text-sm">
                Tooltips and question marks provide extra info.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center w-full">
          <Separator.Root className="h-[1px] w-full bg-slate-300" />
          <div className="w-6 h-6"><ChevronRight /></div>
          <Separator.Root className="h-[1px] w-full bg-slate-300" />
        </div>
        <div className="h-[346px] min-w-[320px] flex flex-col mx-auto rounded-lg border p-4 shadow-2xl backdrop-blur-md dark:bg-black/10">
          <div className="mx-auto translate-x-2.5 translate-y-[7px]">
            <BotegaLogo  />
          </div>
          <div className="mt-6 flex flex-col items-start dark:text-white text-left">
            <h4 className="text-medium font-medium">3. Liquidity Migration to Botega DEX</h4>
            <div className='mt-4 text-sm text-gray-300'>
              <ul className="list-disc ml-4">
                <li>Once the target market cap is reached, trigger an automated or manual migration to Botega DEX.</li>
                <li>All liquidity and fee accrual details become transparent for a seamless transition.</li>
                <li>Developer decides whether to integrate this stage or stop at the previous one.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute left-[15%] top-[15%] h-[70%] w-[70%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-transparent to-transparent"></div>
    </div>
  )
}
