import MiniWallet from "@/components/app/mini-wallet";
import TokenLogo from "@/components/cryptoui/token-logo";
import AnimatedGridPattern from "@/components/ui/animated-grid-pattern";
import SparklesText from "@/components/ui/sparkles-text";
import { useToken } from "@/hooks/use-token";
import { cn } from "@/lib/utils";

export default function TokenHeader() {
  const { token } = useToken();

  return (
    <div className="relative flex w-full items-center justify-between overflow-hidden rounded-[2rem] border p-10 py-14">
      <div className="flex gap-6 items-center pl-4">
        <TokenLogo token={token} big={true} />

        <div className="flex flex-col">
          <SparklesText text={token.Ticker} />
        </div>
      </div>
      <div>
        <MiniWallet />
      </div>
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
