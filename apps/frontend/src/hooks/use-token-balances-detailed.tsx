import useDryRunData from "./use-dryrun-data";

type Balance = {
  address: string;
  amount: {
    Balance: string;
    "Current-Timestamp": string;
    "Total-Balance": string;
    "Vested-Amount": string;
    "Vested-Until": string;
  };
};

const useTokenBalancesDetailed = (tokenId: string) => {
  return useDryRunData<Balance[]>({
    process: tokenId,
    tags: [{ name: "Action", value: "Balances-Detailed" }],
    queryKey: ["Balances-Detailed"],
    formatFn: (data) => {
      return Object.entries(data).map(([address, amount]) => ({
        address,
        amount,
      }));
    },
  });
};

export default useTokenBalancesDetailed;
