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

const useTokenBalances = (tokenId: string) => {
  return useDryRunData<Balance[]>({
    process: tokenId,
    tags: [{ name: "Action", value: "Balances" }],
    queryKey: ["Balances"],
    formatFn: (data) => {
      return Object.entries(data).map(([address, amount]) => ({
        address,
        amount,
      }));
    },
  });
};

export default useTokenBalances;
