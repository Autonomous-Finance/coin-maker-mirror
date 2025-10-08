import type { Token } from "@/types";
import useDryRunTag from "./use-dryrun-tag";
import ENV from "@/env";

const useTokenByProcess = ({ tokenProcess }: { tokenProcess: string }) => {
  return useDryRunTag<Token>({
    queryKey: ["TokenByProcess", tokenProcess],
    process: ENV.VITE_TOKEN_FACTORY_PROCESS,
    tags: [
      { name: "Action", value: "Token-By-Process" },
      { name: "TokenProcess", value: tokenProcess },
    ],
    searchTag: "Data",
  });
};

export default useTokenByProcess;
