import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useDryRunTag from "@/hooks/use-dryrun-tag";
import { useToken } from "@/hooks/use-token";
import { cn } from "@/lib/utils";
import {
  createDataItemSigner,
  message,
  result,
} from "@permaweb/aoconnect";
import { dryrun } from "@/lib/ao-connection";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import HashDisplay from "@/components/cryptoui/hash-display";
import { UserPlus, ShieldAlert, Clipboard } from "lucide-react";
import { useActiveAddress } from "arweave-wallet-kit";
import { TOKEN_WHITELIST_MODULE } from "@/config";

export default function TokenWhitelist() {
  const { token } = useToken();
  const activeAddress = useActiveAddress();
  const queryClient = useQueryClient();
  const [newSender, setNewSender] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disableConfirmOpen, setDisableConfirmOpen] = useState(false);

  // Debug values to see the comparison
  console.log("ActiveAddress:", activeAddress);
  console.log("Token Deployer:", token.Deployer);

  // Arweave addresses can have different cases but represent the same address
  // Check if owner, now comparing with case insensitivity
  const isOwner =
    activeAddress &&
    token.Deployer &&
    activeAddress.toLowerCase() === token.Deployer.toLowerCase();

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (open) {
      // Clear input when dialog opens
      setNewSender("");
    }
  };

  const { data: whitelistModule, isFetching: whitelistModuleLoading } =
    useQuery({
      queryKey: [token.TokenProcess, "allowed-senders"],
      queryFn: async () => {
        const response = await dryrun({
          process: token.TokenProcess,
          tags: [{ name: "Action", value: "Whitelist/Get-Whitelist" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        if (!response.Error) {
          if (!response.Messages || response.Messages.length === 0) {
            return {
              allowedSenders: [],
              enabled: false,
              installed: false,
            };
          }

          const responseData = JSON.parse(response.Messages[0].Data) as {
            Whitelist: string[];
            Enabled: boolean;
          };

          return {
            allowedSenders: responseData.Whitelist,
            enabled: responseData.Enabled,
            installed: true,
          };
        }
        throw new Error(response.Error);
      },
      enabled: !!token.TokenProcess,
    });

  console.log("Whitelist Module Data:", whitelistModule);
  const transferRestricted =
    whitelistModule?.enabled !== undefined
      ? whitelistModule.enabled
      : undefined;
  console.log("Transfer Restricted:", transferRestricted);

  const whitelistMutation = useMutation({
    mutationKey: ["whitelist-toggle"],
    mutationFn: async () => {
      const messageId = await message({
        process: token.TokenProcess,
        tags: [
          { name: "Action", value: "Whitelist/Set-Enabled" },
          { name: "Enabled", value: `${!transferRestricted}` },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const response = await result({
        process: token.TokenProcess,
        message: messageId,
      });

      if (!response.Error) {
        return response;
      }
      throw new Error(response.Error);
    },
    onSuccess: (data) => {
      console.log("Whitelist toggled successfully", data);
      queryClient.invalidateQueries({
        queryKey: [token.TokenProcess, "token-info"],
      });
      queryClient.invalidateQueries({
        queryKey: [token.TokenProcess, "allowed-senders"],
      });
    },
  });

  const addAllowedSenderMutation = useMutation({
    mutationKey: ["add-allowed-sender"],
    mutationFn: async (sender: string) => {
      const messageId = await message({
        process: token.TokenProcess,
        tags: [
          { name: "Action", value: "Whitelist/Add-Address" },
          { name: "Address", value: sender },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const response = await result({
        process: token.TokenProcess,
        message: messageId,
      });

      if (!response.Error) {
        return response;
      }
      throw new Error(response.Error);
    },
    onSuccess: (data) => {
      console.log("Added allowed sender successfully", data);
      setNewSender("");
      setDialogOpen(false); // Close the dialog after successful addition
      queryClient.invalidateQueries({
        queryKey: [token.TokenProcess, "allowed-senders"],
      });
    },
  });

  const removeAllowedSenderMutation = useMutation({
    mutationKey: ["remove-allowed-sender"],
    mutationFn: async (sender: string) => {
      const messageId = await message({
        process: token.TokenProcess,
        tags: [
          { name: "Action", value: "Whitelist/Remove-Address" },
          { name: "Address", value: sender },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const response = await result({
        process: token.TokenProcess,
        message: messageId,
      });

      if (!response.Error) {
        return response;
      }
      throw new Error(response.Error);
    },
    onSuccess: (data) => {
      console.log("Removed allowed sender successfully", data);
      queryClient.invalidateQueries({
        queryKey: [token.TokenProcess, "allowed-senders"],
      });
    },
  });

  const evalMutation = useMutation({
    mutationKey: ["eval-install-whitelist"],
    mutationFn: async () => {
      const messageId = await message({
        process: token.TokenProcess,
        tags: [{ name: "Action", value: "Eval" }],
        data: `
        local result = ao.send({
            Target = "${TOKEN_WHITELIST_MODULE}",
            Action = "Install"
        }).receive()
        load(result.Data)()
        `,
        signer: createDataItemSigner(window.arweaveWallet),
      });

      console.log("messageId", messageId);

      const response = await result({
        process: token.TokenProcess,
        message: messageId,
      });

      if (!response.Error) {
        return response;
      }
      throw new Error(response.Error);
    },
    onSuccess: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds
      // Invalidate queries to refresh the UI after installation
      queryClient.invalidateQueries({
        queryKey: [token.TokenProcess, "allowed-senders"],
      });
    },
  });

  if (!isOwner || token.RenounceOwnership) {
    return (
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <div className="bg-muted/30 p-4 border-b">
          <h2 className="text-xl font-bold">Token Whitelist Controls</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control which addresses are allowed to transfer this token
          </p>
        </div>
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Only the token owner can manage whitelist settings.
          </p>

          <div className="flex flex-col gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm font-medium mb-1">Owner Address</p>
              {token.RenounceOwnership ? (
                "nil"
              ) : (
                <HashDisplay hash={token.Deployer} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!whitelistModule) {
    return (
      <fieldset className="rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-lg font-bold animate-pulse">
          Whitelist Module
        </legend>
        <div className="flex flex-col gap-2 animate-pulse">
          <p className="text-sm text-gray-500">
            Loading whitelist information...
          </p>
        </div>
      </fieldset>
    );
  }

  if (!whitelistModule.installed) {
    return (
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <div className="bg-muted/30 p-4 border-b">
          <h2 className="text-xl font-bold">Token Whitelist Controls</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control which addresses are allowed to transfer this token
          </p>
        </div>
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Whitelist Module Not Installed
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            The whitelist module allows you to restrict token transfers to only
            approved addresses. Install the module to control which wallets can
            transfer your token.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              className="flex-1"
              onClick={() => evalMutation.mutate()}
              disabled={evalMutation.isPending}
            >
              {evalMutation.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent animate-spin border-background" />
                  Installing...
                </>
              ) : (
                "Install Whitelist Module"
              )}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Manual Installation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    Manual Whitelist Module Installation
                  </DialogTitle>
                  <DialogDescription>
                    Run the following code in your token process to install the
                    whitelist module.
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs">
                    {`local result = ao.send({
    Target = "${TOKEN_WHITELIST_MODULE}",
    Action = "Install"
}).receive()
load(result.Data)()`}
                  </pre>
                </div>
                <DialogFooter>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(`local result = ao.send({
    Target = "004Yi7N06okHXr06Drdfrn9v_IhQoYrvvUQoViJP2aI",
    Action = "Install"
}).receive()
load(result.Data)()`);
                    }}
                    className="gap-2"
                  >
                    <Clipboard className="h-4 w-4" />
                    Copy Code
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden shadow-sm">
      <div className="bg-muted/30 p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Token Whitelist Controls</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Control which addresses are allowed to transfer this token
          </p>
        </div>
        {/* Removed test button */}
        <Button
          className={cn(
            buttonVariants({
              size: "default",
              variant: transferRestricted ? "destructive" : "default",
            }),
            (transferRestricted === undefined ||
              whitelistMutation.isPending ||
              whitelistModuleLoading) &&
              "opacity-70 cursor-not-allowed"
          )}
          disabled={
            transferRestricted === undefined || whitelistMutation.isPending
          }
          onClick={() => {
            // Only show confirmation when disabling the whitelist
            if (transferRestricted) {
              setDisableConfirmOpen(true);
            } else {
              whitelistMutation.mutate();
            }
          }}
        >
          {whitelistMutation.isPending || whitelistModuleLoading ? (
            <>
              <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent animate-spin border-current" />
              Processing...
            </>
          ) : transferRestricted ? (
            "Disable Whitelist"
          ) : (
            "Enable Whitelist"
          )}
        </Button>

        <AlertDialog
          open={disableConfirmOpen}
          onOpenChange={setDisableConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disable Whitelist?</AlertDialogTitle>
              <AlertDialogDescription>
                <p className="mb-2">
                  Are you sure you want to disable the whitelist?
                </p>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-900 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-200">
                  <p className="font-medium">⚠️ Warning</p>
                  <p className="text-sm mt-1">
                    Disabling the whitelist will{" "}
                    <strong>remove all allowed sender addresses</strong> from
                    your whitelist. Anyone will be able to transfer this token.
                    This action cannot be undone.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => whitelistMutation.mutate()}
              >
                Yes, Disable Whitelist
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border">
          <div>
            <span className="font-medium">Transfer Restrictions</span>
            <p className="text-sm text-muted-foreground mt-1">
              When enabled, only addresses on the whitelist can transfer tokens
            </p>
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              transferRestricted
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {transferRestricted ? "Enabled" : "Disabled"}
          </div>
        </div>

        {transferRestricted && (
          <div className="mt-4">
            <div className="bg-muted/30 rounded-md p-4 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Manage Allowed Senders</h3>

                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Allowed Sender</DialogTitle>
                      <DialogDescription>
                        Enter a wallet address to add it to the whitelist. Only
                        addresses on the whitelist will be able to transfer
                        tokens.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                      <Input
                        type="text"
                        placeholder="Enter wallet address"
                        value={newSender}
                        onChange={(e) => setNewSender(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => handleDialogOpenChange(false)}
                        disabled={addAllowedSenderMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          if (newSender) {
                            addAllowedSenderMutation.mutate(newSender);
                          }
                        }}
                        disabled={
                          !newSender || addAllowedSenderMutation.isPending
                        }
                      >
                        {addAllowedSenderMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent animate-spin border-background" />
                            Adding...
                          </>
                        ) : (
                          "Add to Whitelist"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border overflow-hidden bg-background">
                <Table className="[&_tr:hover]:bg-transparent">
                  <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-medium">
                        Wallet Address
                      </TableHead>
                      <TableHead className="text-right font-medium">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whitelistModuleLoading ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={2} className="h-24 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <div className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin border-primary" />
                            <span>Loading allowed senders...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : whitelistModule?.allowedSenders?.length ? (
                      whitelistModule.allowedSenders.map((sender: string) => (
                        <TableRow
                          key={sender}
                          className="hover:bg-transparent border-b last:border-b-0"
                        >
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                                <span className="text-xs text-primary">
                                  {sender.substring(0, 2)}
                                </span>
                              </div>
                              <HashDisplay hash={sender} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                removeAllowedSenderMutation.mutate(sender)
                              }
                              disabled={removeAllowedSenderMutation.isPending}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={2}
                          className="h-24 text-center py-12"
                        >
                          <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-8 h-8 mb-2 opacity-50"
                            >
                              <title>icon</title>
                              <circle cx="12" cy="8" r="5" />
                              <path d="M20 21a8 8 0 0 0-16 0" />
                            </svg>
                            <p>No allowed senders found</p>
                            <p className="text-sm">
                              Click the "Add Address" button to add wallet
                              addresses
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
