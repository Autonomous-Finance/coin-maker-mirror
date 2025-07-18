import { formatCurrency } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import HashDisplay from "../cryptoui/hash-display";
import { Button } from "../ui/button";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type TokenBalance = {
  address: string;
  balance: string;
};

export const columns: ColumnDef<TokenBalance>[] = [
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return (
        <HashDisplay
          hash={address}
          copyButton={true}
          link={`https://ao.link/#/entity/${address}`}
        />
      );
    },
  },
  {
    accessorKey: "balance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const balance = row.getValue("balance") as string;
      return formatCurrency(balance, "");
    },
  },
];
