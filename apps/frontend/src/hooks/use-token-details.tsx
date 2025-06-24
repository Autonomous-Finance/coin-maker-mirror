import ENV from "@/env";
import type { Tag, Token } from "@/types";
import { dryrun } from "@/lib/ao-connection";

import { useEffect, useState } from "react";

const useTokenDetails = ({ tokenId }: { tokenId: string }) => {
  const [token, setToken] = useState<Token | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async (tokenId: string) => {
      try {
        setIsLoading(true);
        const messageResult = await dryrun({
          process: ENV.VITE_TOKEN_FACTORY_PROCESS,
          tags: [
            { name: "Action", value: "Token-By-Process" },
            { name: "TokenProcess", value: tokenId },
          ],
          data: "",
        });
        if (messageResult.Messages[0].Tags) {
          const Data = messageResult.Messages[0].Tags.find(
            (tag: Tag) => tag.name === "Data",
          );

          if (Data) {
            setToken(JSON.parse(Data.value));
            setIsLoading(false);

            return Data.value;
          }

          throw new Error("Token not found");
        }
        throw new Error("Token not found");
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

    fetchToken(tokenId);
  }, [tokenId]);

  return { token, isLoading, error };
};

export default useTokenDetails;
