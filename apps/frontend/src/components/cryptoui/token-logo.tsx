import useTokenLogo from "@/hooks/use-token-logo";
import { cn } from "@/lib/utils";
import type { Token } from "@/types";
import { Package2 } from "lucide-react";

export default function TokenLogo({
  token,
  big = false,
}: { token: Token; big?: boolean | string }) {
  const { data, isLoading } = useTokenLogo(token.Logo);

  let size = big === true ? "w-24 h-24" : "w-12 h-12";

  if (typeof big === "string") {
    size = big;
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-800 rounded-full animate-pulse",
          size,
        )}
      >
        <Package2 />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-800 rounded-full",
          size,
        )}
      >
        <Package2 />
      </div>
    );
  }

  return (
    <div className={cn("rounded-full", size)}>
      <img
        src={data}
        className={cn("rounded-full object-cover", size)}
        alt={`Token ${token.Name} logo`}
      />
    </div>
  );
}
