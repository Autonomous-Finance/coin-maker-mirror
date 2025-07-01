import { useActiveAddress } from "arweave-wallet-kit";
import useDryRunTag from "./use-dryrun-tag";

export default function useTokenVested(tokenId: string, address?: string) {
  const userAddress = useActiveAddress();

  const tags = [{ name: "Action", value: "Balance" }];

  if (address) {
    tags.push({ name: "Recipient", value: address });
  } else {
    tags.push({ name: "Recipient", value: userAddress as string });
  }

  return useDryRunTag<{
    Balance: string;
    "Current-Timestamp": string;
    "Vested-Until": string;
    "Vested-Amount": string;
  }>({
    queryKey: ["TokenVested", tokenId],
    process: tokenId,
    tags,
    searchTag: [
      "Balance",
      "Current-Timestamp",
      "Vested-Until",
      "Vested-Amount",
    ],
    parseJson: false,
    enabled: !address && userAddress ? true : !!address,
  });
}
