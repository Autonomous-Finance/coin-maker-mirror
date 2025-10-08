import { LIQUIDITY_POOL } from "@/config";
import { useToken } from "@/hooks/use-token";
import dayjs from "dayjs";
import CurrencyDisplay from "../cryptoui/currency-display";
import HashDisplay from "../cryptoui/hash-display";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import relativeTime from "dayjs/plugin/relativeTime";
import ENV from "@/env";

dayjs.extend(relativeTime);

export default function TokenInitialBalances() {
  const { token } = useToken();

  const balances = Object.entries(token.Balances).map(([address, amount]) => {
    return {
      address:
        address === LIQUIDITY_POOL ? ENV.VITE_TOKEN_FACTORY_PROCESS : address,
      amount,
    };
  });

  if (!balances) {
    return <div>Loading...</div>;
  }

  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-bold">Initial Balances</legend>
      <Table>
        <TableCaption>A list of all the current token balances.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Address</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Vesting</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {balances.map((balance) => (
            <TableRow key={balance.address}>
              <TableCell className="font-medium">
                {balance.address === ENV.VITE_TOKEN_FACTORY_PROCESS ? (
                  "Token Registry"
                ) : (
                  <HashDisplay
                    hash={balance.address}
                    copyButton={true}
                    link={`https://ao.link/#/entity/${balance.address}`}
                  />
                )}
              </TableCell>
              <TableCell className="text-right">
                <CurrencyDisplay
                  amount={balance.amount.Amount}
                  decimals={token.Denomination}
                />
              </TableCell>
              <TableCell className="text-right">
                {dayjs(Number(balance.amount.Vesting)).fromNow()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </fieldset>
  );
}
