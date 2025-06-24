import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import { CreateTokenProvider } from "@/context/create-token";
import { LogsProvider } from "@/context/logs";
import { cn } from "@/lib/utils";
import { Outlet } from "@tanstack/react-router";
import { useActiveAddress } from "arweave-wallet-kit";

export function Header() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14">
      <h1 className="text-3xl font-bold lg:text-4xl mb-4">Deploy your Coin</h1>
      <p>
        Launch Your Custom Coin in Minutes with CoinMaker's Streamlined Process
      </p>
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.5}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
    </div>
  );
}

export default function CreateTokenRoot() {
  const userAddress = useActiveAddress();

  const initialToken = {
    Name: "test token",
    Ticker: "TKT",
    Denomination: 18,
    TotalSupply: "1000000",
    Balances: {
      [userAddress || ""]: {
        Amount: "1000000000000000000000000",
        Vesting: "0",
      },
    },
    Description: "just another token",
    Logo: "",
    Telegram: "",
    Twitter: "",
    Website: "",
  };

  return (
    <CreateTokenProvider initialToken={initialToken}>
      <LogsProvider initialLogs={[]}>
        <div className="container space-y-12">
          <Header />
          <Outlet />
        </div>
      </LogsProvider>
    </CreateTokenProvider>
  );
}
