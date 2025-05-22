import { Globe, Info } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { PAYMENT_TOKENS } from "@/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export default function PaymentTokenInfoBox({ token }: { token: string }) {
  const tokenDetails = PAYMENT_TOKENS.find((t) => t.value === token);

  if (!tokenDetails) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="w-full justify-center items-center border-0 text-purple-400"
        >
          <Info className="mr-2 h-4 w-4" />
          Learn how you can get ${tokenDetails.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>How to get {tokenDetails.label}?</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>
            You have several options for bridging assets into the AO Ecosystem:
          </p>
          <p>
            - Bridge wAR (WrappedAR) via the AOX Bridge by the Everpay team:
            <a
              className={cn(buttonVariants({ variant: "link" }))}
              href="https://aox.arweave.net/#/"
              target="_blank"
              rel="noreferrer"
            >
              <Globe className="mr-2 h-4 w-4" />
              https://aox.arweave.net
            </a>
          </p>
          <p>
            - Use qAR (WrappedAR by Astro) through the Astro Bridge:
            <a
              className={cn(buttonVariants({ variant: "link" }))}
              href="https://bridge.astrousd.com/"
              target="_blank"
              rel="noreferrer"
            >
              <Globe className="mr-2 h-4 w-4" />
              https://bridge.astrousd.com
            </a>
          </p>
          <p>
            - Bridge USDC to wAR using the Wardepot Bridge:
            <a
              className={cn(buttonVariants({ variant: "link" }))}
              href="https://wardepot.arweave.net/"
              target="_blank"
              rel="noreferrer"
            >
              <Globe className="mr-2 h-4 w-4" />
              https://wardepot.arweave.net
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            AutonomousFinance does not endorse or receive incentives from any of
            the mentioned platforms. These options are shared for informational
            purposes only, as they represent widely used solutions in the
            industry.
            <br />
            <br />
            We encourage you to research and choose the option that best suits
            your needs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
