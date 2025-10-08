import { useQuery } from "@tanstack/react-query";

const useTokenLogo = (txid: string) => {
  return useQuery({
    queryKey: ["token-logo", txid],
    queryFn: async () => {
      try {
        const request = await fetch(`https://arweave.net/${txid}`);

        if (request.redirected === true) {
          return request.url;
        }

        return undefined;
      } catch (error) {
        throw new Error("Error fetching token logo.");
      }
    },
    enabled: !!txid,
  });
};

export default useTokenLogo;
