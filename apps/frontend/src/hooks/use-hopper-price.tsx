import { DEXI_AMM_MONITOR } from "@/config";
import { dryrun } from "@/lib/ao-connection";
import { useQuery } from "@tanstack/react-query";

export async function getTokenPrice(tokenProcess: string): Promise<number> {
  const result = await dryrun({
    process: DEXI_AMM_MONITOR,
    tags: [
      {
        name: "Action",
        value: "Get-Price-For-Token",
      },
      {
        name: "Base-Token-Process",
        value: "USD",
      },
      {
        name: "Quote-Token-Process",
        value: tokenProcess,
      },
    ],
  });

  if (result.Messages.length === 0)
    throw new Error("No response from Token-By-Process");

  const data = result.Messages[0].Tags.find(
    (tag: { name: string; value: string }) => tag.name === "Price"
  )?.value;

  if (!data) throw new Error("Response malformed");

  return Number(data);
}

const useHopperPrice = (token: string | undefined) => {
  return useQuery({
    queryKey: ["Get-Token-Price", token],
    queryFn: () => getTokenPrice(token as string),
    enabled: !!token,
  });
};

export default useHopperPrice;
