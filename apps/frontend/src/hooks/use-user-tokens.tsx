import type { Token } from "@/types";

import { useActiveAddress } from "arweave-wallet-kit";
import useDryRunTag from "./use-dryrun-tag";
import ENV from "@/env";

export default function useUserTokens() {
  const address = useActiveAddress();

  return useDryRunTag<Token[]>({
    queryKey: ["Tokens-By-Deployer"],
    process: ENV.VITE_TOKEN_FACTORY_PROCESS,
    enabled: !!address,
    tags: [
      { name: "Action", value: "Tokens-By-Deployer" },
      { name: "Deployer", value: address as string },
    ],
    searchTag: "Data",
  });
}
