"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToken } from "@/hooks/use-token";
import { formatCurrency, formatUnits } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: string;
  format?: "base" | "main";
  decimals: number;
  ticker?: string;
  noTicker?: boolean;
}

export default function CurrencyDisplay({
  amount,
  format = "main",
  decimals,
}: CurrencyDisplayProps) {
  const { token } = useToken();

  const decimalValue = formatCurrency(
    formatUnits(BigInt(amount), decimals),
    `$${token.Ticker}`
  );
  const baseValue = formatCurrency(amount, `$${token.Ticker}`);

  const displayValue = format === "base" ? baseValue : decimalValue;
  const otherValue = format === "base" ? decimalValue : baseValue;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-mono">{displayValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          <span className="font-mono">{otherValue}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function CurrencyDisplayInside({
  amount,
  format = "main",
  decimals,
  ticker,
  noTicker = false,
}: CurrencyDisplayProps) {
  const decimalValue = formatCurrency(
    formatUnits(BigInt(amount), decimals),
    noTicker ? '' : `$${ticker}`
  );
  const baseValue = formatCurrency(amount, noTicker ? '' : `$${ticker}`);

  const displayValue = format === "base" ? baseValue : decimalValue;
  const otherValue = format === "base" ? decimalValue : baseValue;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-mono">{displayValue}</span>
        </TooltipTrigger>
        <TooltipContent>
          <span className="font-mono">{otherValue}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
