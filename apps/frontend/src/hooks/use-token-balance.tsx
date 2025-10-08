import { useActiveAddress } from "arweave-wallet-kit";
import useDryRunTag from "./use-dryrun-tag";

export default function useTokenBalance(tokenId: string, address?: string) {
  const userAddress = useActiveAddress();

  const tags = [{ name: "Action", value: "Balance" }];

  if (address) {
    tags.push({ name: "Recipient", value: address });
    tags.push({ name: "Target", value: address });
  } else {
    tags.push({ name: "Recipient", value: userAddress as string });
    tags.push({ name: "Target", value: userAddress as string });
  }

  return useDryRunTag<string>({
    queryKey: ["TokenBalance", tokenId, userAddress || address || ""],
    process: tokenId,
    tags,
    searchTag: "Balance",
    parseJson: false,
    enabled: !address && userAddress ? true : !!address,
    owner: address || userAddress,
  });
}
