import { AO_LINK_URL, BOTEGA_URL, DEXI_URL } from "@/config";
import usePoolDetails from "@/hooks/use-pool-details";
import { useToken } from "@/hooks/use-token";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import HashDisplay from "../cryptoui/hash-display";
import { buttonVariants } from "../ui/button";
import PoolReserves from "./pool/pool-reserves";
import aolinkLogo from "/aolink-logo.svg";
import barkLogo from "/bark-logo.svg";
import dexiLogo from "/dexi-logo.svg";

export default function PoolCard({ pool }: { pool: string }) {
  const { details, isLoading } = usePoolDetails({ pool });
  const { token } = useToken();

  return (
    <div className={cn("relative rounded-xl border p-4")}>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-t-[3px] border-primary-foreground rounded-full" />
            </div>
          )}
          <div className="flex items-center justify-between gap-8">
            <HashDisplay
              hash={pool}
              copyButton={true}
              link={`https://ao.link/#/entity/${pool}`}
            />
          </div>
        </div>

        <div>
          {details?.token && details.pairToken && (
            <PoolReserves
              token={details.token}
              pairToken={details.pairToken}
              tokenReserves={details.tokenReserves}
              pairTokenReserves={details.pairTokenReserves}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={"/token/$tokenId/pool/$poolId"}
            params={{ tokenId: token.TokenProcess, poolId: pool }}
            className={cn(
              buttonVariants({
                variant: "secondary",
              }),
            )}
          >
            Details
          </Link>
          <a
            href={`${AO_LINK_URL}/#/entity/${pool}`}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <img src={aolinkLogo} alt="View on AO Link" className="h-3" />
          </a>
          <a
            href={`${BOTEGA_URL}/#/swap?from=${details?.token}&to=${details?.pairToken}`}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <img src={barkLogo} alt="View on Botega" className="h-5" />
          </a>
          <a
            href={`${DEXI_URL}/#/pool/${pool}`}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <img src={dexiLogo} alt="View on Dexi" className="h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
