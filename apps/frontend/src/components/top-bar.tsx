import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import TokenDropLogo from "./logo";
import { buttonVariants } from "./ui/button";
import ConnectButton from "./ui/connect-button";
import { ModeToggle } from "./ui/mode-toggle";

export default function TopBar() {
  return (
    <div className="flex py-4 items-center justify-between">
      <div className="flex gap-12">
        <TokenDropLogo />

        <div className="flex">
          <Link
            to="/tokens"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-foreground",
            )}
          >
            Coins
          </Link>
          <Link
            to="/create-token"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-foreground",
            )}
          >
            Create Coin
          </Link>
          <Link
            to="/bonding-curve"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-foreground",
            )}
          >
            Bonding Curve
          </Link>
        </div>
      </div>

      <div className="flex items-center">
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: "link" }), "text-foreground")}
        >
          Dashboard
        </Link>
        <ConnectButton />
        <ModeToggle />
      </div>
    </div>
  );
}
