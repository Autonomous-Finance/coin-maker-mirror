import PoolDetails from "@/components/app/pool/pool-details";
import ErrorDisplay from "@/components/error-display";
import { Skeleton } from "@/components/ui/skeleton";
import { LPProvider } from "@/context/lp";
import usePoolDetails from "@/hooks/use-pool-details";
import { useParams } from "@tanstack/react-router";

function PoolSkeleton() {
  return <Skeleton className="w-full h-full rounded-3xl" />;
}

export default function LiquidityPoolPage() {
  const poolId = useParams({
    from: "/token/$tokenId/pool/$poolId",
    select: (params) => params.poolId,
  });

  const { details, isLoading, error } = usePoolDetails({ pool: poolId });

  if (isLoading) {
    return <PoolSkeleton />;
  }

  if (error || !details) {
    return <ErrorDisplay>{error}</ErrorDisplay>;
  }

  return (
    <LPProvider poolDetails={details} address={poolId}>
      <PoolDetails />
    </LPProvider>
  );
}
