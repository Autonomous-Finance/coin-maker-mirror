import type { PoolDetails, Tag } from "@/types";
import { dryrun } from "@/lib/ao-connection";
import { useEffect, useState } from "react";

const usePoolDetails = ({ pool }: { pool: string }) => {
  const [details, setDetails] = useState<PoolDetails | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPool = async (pool: string) => {
      try {
        setIsLoading(true);
        const details: PoolDetails = {
          Name: "",
          Denomination: "",
          Logo: "",
          Ticker: "",
          token: "",
          pairToken: "",
          tokenReserves: "",
          pairTokenReserves: "",
        };

        const info = await dryrun({
          process: pool,
          tags: [{ name: "Action", value: "Info" }],
          data: "",
        });

        if (info.Messages[0].Tags) {
          for (let i = 0; i < info.Messages[0].Tags.length; i++) {
            details[info.Messages[0].Tags[i].name] =
              info.Messages[0].Tags[i].value;
          }
        }

        const pair = await dryrun({
          process: pool,
          tags: [{ name: "Action", value: "Get-Pair" }],
          data: "",
        });

        if (pair.Messages[0].Tags) {
          const token = pair.Messages[0].Tags.find(
            (tag: Tag) => tag.name === "Token-A",
          );
          const pairToken = pair.Messages[0].Tags.find(
            (tag: Tag) => tag.name === "Token-B",
          );

          if (token && pairToken) {
            details.token = token.value;
            details.pairToken = pairToken.value;
          }
        }

        const reserves = await dryrun({
          process: pool,
          tags: [{ name: "Action", value: "Get-Reserves" }],
          data: "",
        });

        if (reserves.Messages[0].Tags) {
          const tokenReserves = reserves.Messages[0].Tags.find(
            (tag: Tag) => tag.name === details.token,
          );
          const pairTokenReserves = reserves.Messages[0].Tags.find(
            (tag: Tag) => tag.name === details.pairToken,
          );

          if (tokenReserves && pairTokenReserves) {
            details.tokenReserves = tokenReserves.value;
            details.pairTokenReserves = pairTokenReserves.value;
          }
        }

        setDetails(details);
        setIsLoading(false);
        return details;
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
