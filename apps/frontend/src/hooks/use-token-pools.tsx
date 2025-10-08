import { AMM_FACTORY_PROCESS } from "@/config";

import { dryrun } from "@/lib/ao-connection";
import { useQuery } from "@tanstack/react-query";

export default function useTokenPools({
  tokenProcess,
}: { tokenProcess: string }) {
  return useQuery({
    queryKey: ["token-pools", tokenProcess],
    queryFn: async () => {
      try {
        const messageResult = await dryrun({
          process: AMM_FACTORY_PROCESS,
          tags: [
            {
              name: "Action",
              value: "Get-Pools",
            },
          ],
        });

        const pools: {
          poolId: string;
          tokenA: string;
          tokenB: string;
        }[] = [];

        if (messageResult.Messages[0].Tags) {
          const Data = messageResult.Messages[0].Data;

          if (Data) {
            const parsedData = JSON.parse(Data) as {
              [key: string]: [string, string]; // poolId: [tokenA, tokenB]
            };

            for (const poolId in parsedData) {
              // check if tokenProcess is in the pool
              if (parsedData[poolId].includes(tokenProcess)) {
                pools.push({
                  poolId,
                  tokenA: parsedData[poolId][0],
                  tokenB: parsedData[poolId][1],
                });
              }
            }
          }

          return pools;
        }

        return pools;
      } catch (error) {
        console.error(error);
        throw new Error("Error fetching data.");
      }
    },
  });
}
