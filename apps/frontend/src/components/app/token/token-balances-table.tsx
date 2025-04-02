import { DataTable } from "@/components/datatables/datatable";
import {
  columns,
  type TokenBalance,
} from "@/components/datatables/token-balances";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableCaption } from "@/components/ui/table";
import { useToken } from "@/hooks/use-token";
import useTokenBalancesDetailed from "@/hooks/use-token-balances-detailed";
import { formatUnits } from "@/lib/utils";

export default function TokenBalancesTable() {
  const { token } = useToken();

  const {
    data: balances,
    isLoading,
    error,
    refetch,
  } = useTokenBalancesDetailed(token.TokenProcess);

  if (isLoading) {
    return (
      <Table>
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-t-[3px] border-primary-foreground rounded-full" />
        </div>
        <TableCaption>Loading token balances...</TableCaption>
      </Table>
    );
  }

  if (!balances || error) {
    if (error) {
      console.error(error);
      return (
        <Alert className="bg-red-500/20 border-red-500 text-red-500 flex flex-col gap-4  items-center justify-center">
          <AlertTitle>{error.message}</AlertTitle>
          <AlertDescription>
            <div>
              <Button onClick={() => refetch()} variant="secondary">
                Retry Fetching Balances
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
    return <div>Error loading balances...</div>;
  }

  const formattedBalances: TokenBalance[] = balances.map((balance) => {
    return {
      address: balance.address,
      balance: formatUnits(BigInt(balance.amount.Balance), token.Denomination),
    };
  });

  return (
    <DataTable
      columns={columns}
      data={formattedBalances}
      initialSorting={[
        {
          id: "balance",
          desc: true,
        },
      ]}
    />
  );
}
