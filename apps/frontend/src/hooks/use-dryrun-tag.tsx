import type { Tag } from "@/types";
import { dryrun } from "@/lib/ao-connection";
import { useQuery } from "@tanstack/react-query";

export type DryRunRequest<T = unknown> = {
  process: string;
  tags: Tag[];
  searchTag?: string | string[] | undefined;
  queryKey?: string[];
  formatFn?: (data: { [key: string]: string }) => T;
  enabled?: boolean;
  parseJson?: boolean;
  owner?: string;
};

export default function useDryRunTag<T>({
  process,
  tags,
  searchTag = undefined,
  queryKey = [],
  formatFn = undefined,
  enabled = true,
  parseJson = true,
  owner = undefined,
}: DryRunRequest) {
  return useQuery({
    queryKey: [process, ...queryKey],
    enabled: enabled,
    queryFn: async () => {
      try {
        const messageResult = await dryrun({
          process,
          tags,
          Owner: owner ?? "1234",
        });

        if (messageResult.Messages[0].Tags) {
          if (searchTag === "Data") {
            const Data = messageResult.Messages[0].Data;

            if (Data) {
              if (!parseJson) {
                return Data as unknown as T;
              }

              if (formatFn) {
                return formatFn(JSON.parse(Data)) as T;
              }

              return JSON.parse(Data) as T;
            }

            throw new Error("Data not found in message.");
          }

          // Search for only one tag
          if (searchTag && typeof searchTag === "string") {
            const Data = messageResult.Messages[0].Tags.find(
              (tag: Tag) => tag.name === searchTag,
            );

            if (Data) {
              if (!parseJson) {
                return Data.value as unknown as T;
              }

              if (formatFn) {
                return formatFn(JSON.parse(Data.value)) as T;
              }

              return JSON.parse(Data.value) as T;
            }

            throw new Error(`${searchTag} tag not found in message.`);
          }

          // Search for multiple tags
          if (searchTag && Array.isArray(searchTag)) {
            const tags = searchTag.reduce(
              (acc, tag) => {
                const Data = messageResult.Messages[0].Tags.find(
                  (t: Tag) => t.name === tag,
                );

                if (Data) {
                  acc[tag] = Data.value;
                }

                return acc;
              },
              {} as { [key: string]: string },
            );

            return tags as unknown as T;
          }

          // Parse all tags
          const baseTags = messageResult.Messages[0].Tags as Tag[];

          const tags = baseTags.reduce(
            (acc, tag) => {
              acc[tag.name] = tag.value;
              return acc;
            },
            {} as { [key: string]: string },
          );

          return tags as unknown as T;
        }

        throw new Error("Tags not found in message.");
      } catch (error) {
        console.error(error);
        throw new Error("Error fetching data.");
      }
    },
  });
}
