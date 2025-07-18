import { buttonVariants } from "@/components/ui/button";
import Marquee from "@/components/ui/marquee";
import useTokensList from "@/hooks/use-tokens-list";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Package2 } from "lucide-react";
import { useMemo } from "react";
import TokenCard from "../token-card";

function Skeleton() {
  return (
    <div className="py-8">
      <div className="flex w-full flex-col items-center justify-center">
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14">
          <div className="z-10 mx-auto size-24 rounded-[2rem] border bg-white/10 p-3 shadow-2xl backdrop-blur-md dark:bg-black/10 lg:size-32">
            <Package2 className="mx-auto size-16 text-black dark:text-white lg:size-24" />
          </div>
          <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white">
            <h1 className="text-3xl font-bold lg:text-4xl">
              Want to deploy your own coin?
            </h1>
            <p className="mt-2">
              Deploy your own coin on the AO and start building your
              decentralized applications.
            </p>
            <Link
              to="/create-token"
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "outline",
                }),
                "group mt-4 rounded-[2rem] px-6",
              )}
            >
              Get Started
              <ChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-70% dark:to-black" />
        </div>
      </div>
    </div>
  );
}

export default function TokensCallToAction() {
  const { data: tokens } = useTokensList();

  const limitedTokens = useMemo(() => {
    if (!tokens) return { firstRow: [], secondRow: [] };
    
    // Limit to 20 tokens max for performance
    const deployedTokens = tokens
      .filter(token => token.TokenProcess && token.Status === "DEPLOYED")
      .slice(0, 20);
    
    const midpoint = Math.ceil(deployedTokens.length / 2);
    return {
      firstRow: deployedTokens.slice(0, midpoint),
      secondRow: deployedTokens.slice(midpoint)
    };
  }, [tokens]);

  if (!tokens) return <Skeleton />;

  return (
    <div className="py-8">
      <div className="flex w-full flex-col items-center justify-center">
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14">
          <div className="absolute rotate-[35deg]">
            <Marquee pauseOnHover className="[--duration:40s]" repeat={2}>
              {limitedTokens.firstRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:40s]"
              repeat={2}
            >
              {limitedTokens.secondRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:40s]" repeat={2}>
              {limitedTokens.firstRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:40s]"
              repeat={2}
            >
              {limitedTokens.secondRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:40s]" repeat={2}>
              {limitedTokens.firstRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:40s]"
              repeat={2}
            >
              {limitedTokens.secondRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:40s]" repeat={2}>
              {limitedTokens.firstRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:40s]"
              repeat={2}
            >
              {limitedTokens.secondRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee pauseOnHover className="[--duration:40s]" repeat={2}>
              {limitedTokens.firstRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
            <Marquee
              reverse
              pauseOnHover
              className="[--duration:40s]"
              repeat={2}
            >
              {limitedTokens.secondRow.map((token) => (
                <TokenCard key={token.TokenProcess} token={token} />
              ))}
            </Marquee>
          </div>
          <div className="z-10 mx-auto size-24 rounded-[2rem] border bg-white/10 p-3 shadow-2xl backdrop-blur-md dark:bg-black/10 lg:size-32">
            <Package2 className="mx-auto size-16 text-black dark:text-white lg:size-24" />
          </div>
          <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white">
            <h1 className="text-3xl font-bold lg:text-4xl">
              Want to deploy your own coin?
            </h1>
            <p className="mt-2">
              Deploy your own coin on the AO and start building your
              decentralized applications.
            </p>
            <Link
              to="/create-token"
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "outline",
                }),
                "group mt-4 rounded-[2rem] px-6",
              )}
            >
              Get Started
              <ChevronRight className="ml-1 size-4 transition-all duration-300 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-70% dark:to-black" />
        </div>
      </div>
    </div>
  );
}
