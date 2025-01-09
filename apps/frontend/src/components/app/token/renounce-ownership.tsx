import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ENV from "@/env";
import { useToken } from "@/hooks/use-token";
import type { Token } from "@/types";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";
import { useState } from "react";
import { toast } from "sonner";

function RenounceOwnershipDialog({
  renounce,
}: {
  renounce: UseMutationResult<boolean, unknown, void, unknown>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-orange-500 text-orange-950 hover:bg-orange-400 hover:text-orange-900 font-bold text-md mt-4 mb-4 rounded-3xl"
        >
          {renounce.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-6 h-6 border-t-[3px] border-primary rounded-full" />
              Renouncing Ownership...
            </div>
          ) : (
            "Renounce Ownership Now!"
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove the
            ownership of this token and make it immutable.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="secondary"
              disabled={renounce.isPending}
              onClick={() => renounce.mutateAsync()}
            >
              {renounce.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-6 h-6 border-t-[3px] border-primary rounded-full" />
                  Renouncing Ownership...
                </div>
              ) : (
                "Renounce Ownership"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function RenounceOwnership() {
  const { token } = useToken();
  const [renounced, setRenounced] = useState(!!token.RenounceOwnership);

  const renounce = useMutation({
    mutationKey: ["renounce", token?.TokenProcess],
    mutationFn: async () => {
      const renounceId = await message({
        process: ENV.VITE_TOKEN_FACTORY_PROCESS,
        tags: [
          { name: "Action", value: "Renounce-Ownership" },
          {
            name: "Token-Process",
            value: token.TokenProcess,
          },
        ],
        data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const renounceResult = await result({
        process: ENV.VITE_TOKEN_FACTORY_PROCESS,
        message: renounceId,
      });

      if (renounceResult.Messages.length > 1) {
        const message = renounceResult.Messages[1];

        const details = JSON.parse(message.Data) as Token;

        if (details.RenounceOwnership === true) {
          return true;
        }

        throw new Error("Ownership renounce failed");
      }

      throw new Error("Ownership renounce failed");
    },
    onSuccess: () => {
      toast.success("Ownership renounced successfully.");
      setRenounced(true);
    },
    onError: (error) => {
      toast.error("Ownership renounce failed. Please try again.");
      console.error(error);
    },
  });

  const userAddress = useActiveAddress();

  return (
    <div>
      {renounced ? (
        <div className="w-full flex flex-col items-center gap-2 text-sm font-mono mb-2 border border-emerald-600 rounded-xl p-4 bg-emerald-900/30 text-emerald-500">
          <div className="text-xl">Ownership renounced</div>
          <p className="mb-4 text-center">
            This process details are immutable.
          </p>

          <Popover>
            <PopoverTrigger>
              <div className="text-sm text-muted-foreground flex items-center gap-1 underline underline-offset-2 text-green-300">
                What does this mean?
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] space-y-2">
              <p>
                By renouncing ownership, you make the core aspects of the token,
                like <b>total supply and ownership, permanently fixed</b>, which
                increases trust.
              </p>
              <p>
                You don&apos;t have to do this immediately; it can be done later
                when you're ready.
              </p>
              <p>
                However, once renounced, you can still update non-essential
                details, such as the token's website or description. At the same
                time, the fundamental properties of the asset remain locked and
                unchangeable.
              </p>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center">
          <div className="w-full flex flex-col items-center gap-2 text-sm font-mono mb-2 border border-orange-600 rounded-xl py-4 px-4 bg-orange-900/30 text-orange-500">
            <div className="text-xl">Ownership not renounced</div>
            <p className="mb-4 text-center">
              Owner can change the process code anytime, altering token balances
              and other essential details.
            </p>

            {userAddress === token.Deployer && (
              <RenounceOwnershipDialog renounce={renounce} />
            )}

            <Popover>
              <PopoverTrigger>
                <div className="text-sm text-muted-foreground flex items-center gap-1 underline underline-offset-2 text-orange-300">
                  What does this mean?
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] space-y-2">
                <p>
                  By renouncing ownership, you make the core aspects of the
                  token, like{" "}
                  <b>total supply and ownership, permanently fixed</b>, which
                  increases trust.
                </p>
                <p>
                  You don&apos;t have to do this immediately; it can be done
                  later when you're ready.
                </p>
                <p>
                  However, once renounced, you can still update non-essential
                  details, such as the token's website or description. At the
                  same time, the fundamental properties of the asset remain
                  locked and unchangeable.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}
