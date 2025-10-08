import { DEXI_AMM_MONITOR } from "@/config";

import { dryrun } from "@/lib/ao-connection";
import { useQuery } from "@tanstack/react-query";

export interface PoolDetails {
  amm_base_token: string;
  amm_discovered_at_ts: number;
  amm_name: string;
  amm_process: string;
  amm_quote_token: string;
  amm_status: "private" | "public";
  amm_token0: string;
  amm_token1: string;
}

export default function useDexiSubscribed({
  pool,
  enabled,
}: {
  pool: string;
  enabled: boolean;
}) {
  return useQuery({
    queryKey: ["Get-Amm-Details", pool],
    queryFn: async () => {
      const messageResult = await dryrun({
        process: DEXI_AMM_MONITOR,
        tags: [
          {
            name: "Action",
            value: "Get-AMM-Details",
          },
          {
            name: "AMM-Process",
            value: pool,
          },
        ],
      });

      if (messageResult.Error) {
        throw new Error(messageResult.Error);
      }

      if (messageResult.Messages[0].Data) {
        const details = JSON.parse(
          messageResult.Messages[0].Data
        ) as PoolDetails;

        return details;
      }

      throw new Error("Error fetching data.");
    },
    enabled,
  });
}
