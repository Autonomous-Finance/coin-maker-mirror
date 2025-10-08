import type { ColumnDef } from "@tanstack/react-table";
import PoolCard from "../app/liquidity-pool-card";

export type LiquidityPool = {
  poolId: string;
  tokenA: string;
  tokenB: string;
};

export const columns: ColumnDef<LiquidityPool>[] = [
  {
    accessorKey: "poolId",
    header: "",
    cell: ({ row }) => {
      const poolId = row.getValue("poolId") as string;
      return <PoolCard pool={poolId} />;
    },
  },
];
