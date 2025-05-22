import type { Tag } from "@/types";
import { dryrun } from "@/lib/ao-connection";

import { useEffect, useState } from "react";

const usePoolDetails = ({ pool }: { pool: string }) => {
  const [details, setDetails] = useState<
    | {
        name: string;
      }
    | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPool = async (pool: string) => {
      try {
        setIsLoading(true);
        const messageResult = await dryrun({
          process: pool,
          tags: [{ name: "Action", value: "Get-Price" }],
          data: "",
        });

        if (messageResult.Messages[0].Tags) {
          const Name = messageResult.Messages[0].Tags.find(
            (tag: Tag) => tag.name === "Name",
          );

          if (Name) {
            setDetails({
              name: Name.value,
            });
            setIsLoading(false);

            return {
              name: Name.value,
            };
          }

          throw new Error("Pool not found");
        }
        throw new Error("Pool not found");
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An error occurred");
          console.error(error);
        }

        setIsLoading(false);
      }
    };

    fetchPool(pool);
  }, [pool]);

  return { details, isLoading, error };
};

export default usePoolDetails;
