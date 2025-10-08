import Marquee from "@/components/ui/marquee";
import useTokensList from "@/hooks/use-tokens-list";
import TokenCard from "../token-card";

export default function LatestTokensScroll() {
  const { data: tokens } = useTokensList();

  if (!tokens)
    return (
      <div className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden bg-slate-950" />
    );

  const slicedTokens = tokens.filter((t) => t.Status === "DEPLOYED").slice(0, 30);

  return (
    <div className="relative flex h-24 w-full flex-col items-center justify-center overflow-hidden bg-slate-950">
      <Marquee pauseOnHover className="[--duration:60s]">
        {slicedTokens.reverse().map((token) => (
          <TokenCard key={token.TokenProcess} token={token} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background" />
      <div className="pointer-events-none absolute top-[100%] z-30 w-full bg-gradient-to-b from-white dark:from-background" />
    </div>
  );
}
