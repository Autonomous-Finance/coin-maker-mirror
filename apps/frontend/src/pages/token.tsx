import TokenSocials from "@/components/app/token/token-socials";
import TokenDetails from "@/components/app/token/token-details";
import TokenHeader from "@/components/app/token/token-header";
import ErrorDisplay from "@/components/error-display";
import { Skeleton } from "@/components/ui/skeleton";
import { LogsProvider } from "@/context/logs";
import { TokenProvider } from "@/context/token";
import useTokenByProcess from "@/hooks/use-token-by-process";
import { Outlet, useParams } from "@tanstack/react-router";
import RenounceOwnership from "@/components/app/token/renounce-ownership";
import { useActiveAddress } from "arweave-wallet-kit";
import UpdateMetadataCTA from "@/components/update-metadata-cta";

function TokenSkeleton() {
  return (
    <div className="container space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div>
            <Skeleton className="w-64 h-14 rounded-xl" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-72 h-14 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-6 gap-6">
        <div className="col-span-2 space-y-6">
          <Skeleton className="w-full h-96 rounded-lg" />
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
        <div className="col-span-4 space-y-6">
          <Skeleton className="w-full h-96 rounded-lg" />
          <Skeleton className="w-full h-96 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function TokenLayout() {
  const tokenId = useParams({
    from: "/token/$tokenId",
    select: (params) => params.tokenId,
  });
  const userAddress = useActiveAddress();

  const {
    data: token,
    isLoading,
    isError,
    error,
  } = useTokenByProcess({ tokenProcess: tokenId });
  
  if (isLoading) {
    return <TokenSkeleton />;
  }

  if (isError || error || !token) {
    return (
      <ErrorDisplay>
        {error?.message ?? "There has been an error."}
      </ErrorDisplay>
    );
  }

  return (
    <TokenProvider
      initialToken={{
        ...token,
        RenounceOwnership:
          typeof token.RenounceOwnership === "string"
            ? token.RenounceOwnership === "true"
            : token.RenounceOwnership,
      }}
    >
      <div className="container">
        <div className="flex flex-col gap-6">
          <TokenHeader />
          <div className="grid grid-cols-8 gap-6">
            <LogsProvider initialLogs={[]}>
              <div className="col-span-2 space-y-6">
                {userAddress === token.Deployer && <UpdateMetadataCTA />}
                <RenounceOwnership />
                <TokenDetails />
                <TokenSocials />
              </div>
              <div className="col-span-6 space-y-6">
                <Outlet />
              </div>
            </LogsProvider>
          </div>
        </div>
      </div>
    </TokenProvider>
  );
}
