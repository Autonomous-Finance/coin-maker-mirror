import { useToken } from "@/hooks/use-token";
import useTokenBalance from "@/hooks/use-token-balance";
import useTokenPools from "@/hooks/use-token-pools";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { columns } from "../datatables/liquidity-pools";
import { DataTableCustom } from "../datatables/datatable-custom";
import TickerDisplay from "../cryptoui/ticker-display";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LiquidityPools() {
  const { token } = useToken();
  const { data: pools, isLoading } = useTokenPools({
    tokenProcess: token.TokenProcess,
  });
  const { data: balance } = useTokenBalance(token.TokenProcess);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (pools && pools.length === 0) {
      const timer = setTimeout(() => setShowConfetti(false), 10000); // Stop confetti after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [pools]);

  return (
    <fieldset className="rounded-lg border p-4 relative pt-12">
      {pools?.length === 0 && showConfetti && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <Confetti />
        </div>
      )}

      <legend className="-ml-1 px-1 text-lg font-bold ">
        <div>
          <TickerDisplay>{token.Ticker}</TickerDisplay> Liquidity Pools
        </div>

        <Link
          to="/token/$tokenId/create-liquidity-pool"
          params={{ tokenId: token.TokenProcess }}
          className={cn(
            buttonVariants({
              size: "lg",
              variant: "default",
            }),
            "group mt-4 rounded-[2rem] px-6 z-[200] absolute right-6 -top-6",
            BigInt(balance || "0") === 0n && "disabled opacity-50"
          )}
          disabled={BigInt(balance || "0") === 0n}
        >
          Create Liquidity Pool
          <PlusIcon className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
        </Link>
      </legend>
      <div className="flex flex-col gap-4 min-h-[300px]">
        {isLoading || !pools ? (
          <div className="col-span-1 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-t-[3px] border-primary-foreground rounded-full" />
          </div>
        ) : pools.length === 0 ? (
          <div>
            {BigInt(balance || "0") === 0n ? (
              <div className="flex items-center justify-center h-64">
                This token does not have any liquidity pools.
              </div>
            ) : (
              <div className="flex flex-col items-center p-24 gap-4">
                <motion.svg
                  className="absolute top-5 right-48"
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5,
                  }}
                >
                  <title>Arrow</title>
                  <path
                    d="M10 110C10 110 20 100 30 95C40 90 50 90 60 80C70 70 75 60 85 50C95 40 110 10 110 10"
                    stroke="#9F7AEA"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M90 10L110 10L110 30"
                    stroke="#9F7AEA"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
                <div className="text-3xl font-bold">Congratulations!</div>
                <p className="text-xl">
                  You have successfully created{" "}
                  <TickerDisplay>{token.Ticker}</TickerDisplay>.
                </p>
                <p>
                  To enable trading on exchanges, the next step is to set up
                  liquidity for your asset.
                </p>
              </div>
            )}
          </div>
        ) : (
          <DataTableCustom
            columns={columns}
            data={pools}
            initialSorting={[
              {
                id: "balance",
                desc: true,
              },
            ]}
          />
        )}
      </div>
    </fieldset>
  );
}
