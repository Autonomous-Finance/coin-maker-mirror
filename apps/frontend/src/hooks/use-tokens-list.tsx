import type { Token } from "@/types";

import useDryRunTag from "./use-dryrun-tag";
import ENV from "@/env";

const useTokensList = () => {
  return useDryRunTag<Token[]>({
    queryKey: ["Tokens"],
    process: ENV.VITE_TOKEN_FACTORY_PROCESS,
    tags: [{ name: "Action", value: "Tokens" }],
    searchTag: "Data",
  });
};

export default useTokensList;
