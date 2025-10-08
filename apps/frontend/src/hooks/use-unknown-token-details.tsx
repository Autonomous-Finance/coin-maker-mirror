import type { PairToken } from "@/types";

import useDryRunTag from "./use-dryrun-tag";

const useUnknownTokenDetails = ({
  tokenProcess,
}: { tokenProcess: string | undefined }) => {
  return useDryRunTag<PairToken>({
    process: tokenProcess as string,
    tags: [{ name: "Action", value: "Info" }],
    queryKey: ["Info", tokenProcess as string],
    enabled: !!tokenProcess,
  });
};

export default useUnknownTokenDetails;
