import { TOKEN_LOCKER_PROCESS } from "@/config";
import { useActiveAddress } from "arweave-wallet-kit";
import useDryRunData from "./use-dryrun-data";

export default function useUserLockedTokens(tokenId: string, address?: string) {
  const userAddress = useActiveAddress();

  const tags = [
    { name: "Action", value: "User-Locked-Tokens" },
    { name: "Token", value: tokenId },
  ];

  if (address) {
    tags.push({ name: "User", value: address });
  } else {
    tags.push({ name: "User", value: userAddress as string });
  }

  return useDryRunData<
    {
      End: string;
      Amount: string;
      Period: string;
      Start: string;
    }[]
  >({
    queryKey: ["User-Locked-Tokens", address || userAddress || "", tokenId],
    process: TOKEN_LOCKER_PROCESS,
    tags,
    enabled: !address && userAddress ? true : !!address,
  });
}
