import useDryRunTag from "@/hooks/use-dryrun-tag";
import type { Token } from "@/types";

interface UseTokenInfoParams {
  tokenId: string;
  enabled?: boolean;
}

export function useTokenInfo({ tokenId, enabled = true }: UseTokenInfoParams) {
  return useDryRunTag<Partial<Token>>({
    process: tokenId,
    tags: [{ name: "Action", value: "Info" }],
    queryKey: ["token-info"],
    enabled: !!tokenId && enabled,
    formatFn: (tagsResponse) => ({
      name: tagsResponse.Name,
      ticker: tagsResponse.Ticker,
      logo: tagsResponse.Logo,
      denomination: tagsResponse.Denomination,
      totalSupply: tagsResponse.TotalSupply,
      transferRestricted: tagsResponse.TransferRestricted === "true",
    }),
  });
}

export default useTokenInfo;
