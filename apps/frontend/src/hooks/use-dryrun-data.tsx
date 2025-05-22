import type { Tag } from "@/types";
import { dryrun } from "@/lib/ao-connection";
import { useQuery } from "@tanstack/react-query";

export type DryRunRequest<T = unknown> = {
  process: string;
  tags: Tag[];
  queryKey?: string[];
  formatFn?: (data: { [key: string]: string }) => T;
  enabled?: boolean;
};

export default function useDryRunData<T>({
  process,
  tags,
  queryKey = [],
  formatFn = undefined,
  enabled = true,
}: DryRunRequest) {
  return useQuery({
    queryKey: [process, ...queryKey],
    enabled: enabled,
    queryFn: async () => {
      try {
        const messageResult = await dryrun({
          process,
          tags,
        });

        if (messageResult.Messages[0].Data) {
          const Data = messageResult.Messages[0].Data;

          if (Data) {
            if (formatFn) {
              return formatFn(JSON.parse(Data)) as T;
            }

            return JSON.parse(Data) as T;
          }

          throw new Error("Data not found in message.");
        }

        throw new Error("Data not found in message.");
      } catch (error) {
        console.error(error);
        throw new Error("Error fetching data.");
      }
    },
  });
}
