import { dryrun } from "@/lib/ao-connection";

import { useEffect, useState } from "react";

const usePoolReserves = ({ pool }: { pool: string }) => {
  const [reserves, setReserves] = useState<
    | {
        token: string;
        tokenReserve: string;
        pairToken: string;
        pairTokenReserve: string;
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
          tags: [{ name: "Action", value: "Get-Reserves" }],
          data: "",
        });

        if (messageResult.Messages[0].Tags) {
          const token = messageResult.Messages[0].Tags[6];
          const pairToken = messageResult.Messages[0].Tags[7];

          if (token && pairToken) {
            setReserves({
              token: token.name,
              tokenReserve: token.value,
              pairToken: pairToken.name,
              pairTokenReserve: pairToken.value,
            });
            setIsLoading(false);

            return {
              token: token.name,
              tokenReserve: token.value,
              pairToken: pairToken.name,
              pairTokenReserve: pairToken.value,
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

  return { reserves, isLoading, error };
};

export default usePoolReserves;
