import { Button } from "@/components/ui/button";
import ShineBorder from "@/components/ui/shine-border";
import { useCreateToken } from "@/hooks/use-create-token";
import { useLogs } from "@/hooks/use-logs";
import { useStepsLoading } from "@/hooks/use-steps-loading";
import readRegistryMessage from "@/lib/aoconnect/read-registry-message";
import { cn, formatUnits, parseUnits } from "@/lib/utils";
import type { Tag } from "@/types";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { dryrun } from "@/lib/ao-connection";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, LoaderIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import numbro from "numbro";
import ArweaveImage from "@/components/cryptoui/arweave-image";
import { CurrencyDisplayInside } from "@/components/cryptoui/currency-display";
import ENV from "@/env";
import { TOKEN_WHITELIST_MODULE } from "@/config";

export default function DeployTokenForm() {
  const { token } = useCreateToken();
  const [isLoading, setIsLoading] = useState(false);
  const { addLog } = useLogs();
  const { steps, updateStep } = useStepsLoading();
  const navigate = useNavigate({ from: "/create-token" });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const totalSupply = parseUnits(token.TotalSupply, token.Denomination);

  async function onSubmit() {
    setIsLoading(true);
    setError(null);

    try {
      // Update step status
      updateStep(1, "current");

      // Add the token to the TokenRegistry
      addLog("Adding token to TokenRegistry...");

      const tags = [
        { name: "Action", value: "Add-Token" },
        { name: "Name", value: token.Name },
        { name: "TotalSupply", value: totalSupply.toString() },
        { name: "Balances", value: JSON.stringify(token.Balances) },
        { name: "Ticker", value: token.Ticker },
        { name: "Denomination", value: token.Denomination.toString() },
        { name: "Description", value: token.Description },
        { name: "Telegram", value: token.Telegram },
        { name: "Twitter", value: token.Twitter },
        { name: "Website", value: token.Website },
        { name: "Logo", value: token.Logo },
        {
          name: "RenounceOwnership",
          value: token.RenounceOwnership ? "true" : "false",
        },
      ];

      const registerTokenMsgId = await message({
        process: ENV.VITE_TOKEN_FACTORY_PROCESS,
        tags: tags,
        signer: createDataItemSigner(window.arweaveWallet),
      });

      addLog(`Token added to TokenRegistry with ID: ${registerTokenMsgId}`);

      const messageResult = await readRegistryMessage({
        messageId: registerTokenMsgId,
      });

      addLog(`Token added to TokenRegistry with ID: ${registerTokenMsgId}.`);
      addLog(
        `Token Registry Result: ${JSON.stringify(messageResult, null, 2)}`
      );

      toast.success("🚀 Token added to TokenRegistry successfully!", {
        description:
          "The token has been added to the TokenRegistry successfully. You can now view it in the Tokens page.",
      });

      console.log("Token Registry Result", messageResult);

      // Update step status
      updateStep(1, "success");

      const queryTokenProcessId = async (
        internalId: string,
        tries = 1
      ): Promise<string> => {
        const result = await dryrun({
          process: ENV.VITE_TOKEN_FACTORY_PROCESS,
          tags: [
            { name: "Action", value: "Query-Token-Process" },
            { name: "InternalId", value: internalId },
          ],
        });

        if (result.Messages.length) {
          const firstMessage = result.Messages[0];
          console.log("First Message", firstMessage);

          const tokenProcess = firstMessage.Tags.find(
            (tag: Tag) => tag.name === "Token-Process"
          );

          if (tokenProcess && tokenProcess.value !== "") {
            addLog(`Token Process ID: ${tokenProcess.value}`);
            toast.success("🚀 Token process deployed successfully!");

            return tokenProcess.value;
          }

          // Try again
          if (tries < 15) {
            await new Promise((resolve) => setTimeout(resolve, 10000));
            return await queryTokenProcessId(internalId, tries + 1);
          }

          throw new Error("Token process ID not found");
        }

        if (tries < 15) {
          // Try again
          await new Promise((resolve) => setTimeout(resolve, 10000));
          return await queryTokenProcessId(internalId, tries + 1);
        }

        throw new Error("Token process ID not found");
      };

      // Update step status
      updateStep(2, "current");

      // Query the token process
      const tokenProcess = await queryTokenProcessId(registerTokenMsgId);

      updateStep(2, "success");

      // If token has a whitelist module, install it
      if (token.WhitelistModule) {
        // Update step status
        updateStep(3, "current");

        // Send EVAL message to load the Whitelist Module
        const messageId = await message({
          process: tokenProcess,
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
          process: tokenProcess,
          message: messageId,
        });

        await new Promise((resolve) => setTimeout(resolve, 5000));

        console.log("response eval", response);

        toast.success("Whitelist Module installed", {
          description: "The whitelist module has been installed successfully.",
        });

        // Update step status
        updateStep(3, "success");
      }

      // Calculate step IDs dynamically
      const infoStepId = token.WhitelistModule ? 4 : 3;
      const cronStepId = token.WhitelistModule ? 5 : 4;

      // Send Info action to the newly created token process
      updateStep(infoStepId, "current");
      addLog("📊 Sending Info action to token process...");
      try {
        const infoMessageId = await message({
          process: tokenProcess,
          tags: [{ name: "Action", value: "Info" }],
          signer: createDataItemSigner(window.arweaveWallet),
        });

        console.log("Info message sent:", infoMessageId);
        addLog("✅ Info action sent successfully");
        updateStep(infoStepId, "success");
      } catch (error) {
        console.error("Failed to send Info action:", error);
        addLog("⚠️ Failed to send Info action (non-critical)");
        updateStep(infoStepId, "success"); // Mark as success since it's non-critical
      }

      // Set up HB cron for the token process
      updateStep(cronStepId, "current");
      addLog("⏰ Setting up HB cron for token process...");
      try {
        const hbNodeUrl = ENV.VITE_HB_NODE_URL;
        if (hbNodeUrl) {
          const cronUrl = `${hbNodeUrl}/~cron@1.0/every?cron-path=/${tokenProcess}~process@1.0/now&interval=1-minute`;
          const response = await fetch(cronUrl, { method: "GET" });

          if (response.ok) {
            console.log("HB cron setup successful");
            addLog("✅ HB cron setup completed");
            updateStep(cronStepId, "success");
          } else {
            console.error("HB cron setup failed:", response.status);
            addLog("⚠️ HB cron setup failed (non-critical)");
            updateStep(cronStepId, "success"); // Mark as success since it's non-critical
          }
        } else {
          updateStep(cronStepId, "success"); // Skip if no HB URL
        }
      } catch (error) {
        console.error("Failed to setup HB cron:", error);
        addLog("⚠️ Failed to setup HB cron (non-critical)");
        updateStep(cronStepId, "success"); // Mark as success since it's non-critical
      }

      // Add the token to the TokenRegistry
      setIsLoading(false);

      navigate({
        to: "/token/$tokenId",
        params: {
          tokenId: tokenProcess,
        },
      });
    } catch (error) {
      addLog("🚫 Failed to deploy token");
      console.error(error);
      toast.error("🚫 Failed to deploy token", {
        description:
          "An error occurred while deploying the token. Please check the logs for more details.",
      });
      setIsLoading(false);
      setError(
        "An error occurred while spawning the token process. Please try again."
      );
    }
  }

  return (
    <div className="container">
      <div
        className={cn(
          "max-w-4xl w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-2 space-y-12",
          isLoading ? "opacity-50" : null
        )}
      >
        <div className="flex flex-col items-center gap-12">
          <h3 className="text-3xl font-bold tracking-tight text-center">
            Your coin is ready for deployment on the AO network.
          </h3>
          <div className="flex gap-12">
            <div className="flex flex-col justify-center gap-6">
              <p className="max-w-lg text-xl text-muted-foreground">
                Once deployed, you will have the option to create a liquidity
                pool, enabling trading across multiple platforms.
              </p>
              <p className="max-w-lg text-xl text-muted-foreground">
                You can still update the social metadata or renounce ownership
                if it has not been renounced yet.
              </p>
            </div>

            <Card>
              <CardContent>
                <Tabs defaultValue="details" className="w-full space-y-8">
                  <div className="text-center">
                    <TabsList>
                      <TabsTrigger value="details">Token Details</TabsTrigger>
                      <TabsTrigger value="social">Social Metadata</TabsTrigger>
                      <TabsTrigger value="balances">Balances</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="details">
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-[400px]">
                      <div>
                        <dd className="mt-1 text-sm">
                          <ArweaveImage src={token.Logo} />
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm">{token.Name}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Ticker</dt>
                        <dd className="mt-1 text-sm">{token.Ticker}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">
                          Total Supply
                        </dt>
                        <dd className="mt-1 text-sm">
                          {numbro(
                            formatUnits(totalSupply, token.Denomination)
                          ).format({ thousandSeparated: true })}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">
                          Renounce Ownership
                        </dt>
                        <dd className="mt-1 text-sm">
                          {token.RenounceOwnership ? "Yes" : "No"}
                        </dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="font-medium text-gray-500">
                          Description
                        </dt>
                        <dd className="mt-1 text-sm">{token.Description}</dd>
                      </div>
                    </dl>
                  </TabsContent>
                  <TabsContent value="social">
                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-[400px]">
                      <div>
                        <dt className="font-medium text-gray-500">Telegram</dt>
                        <dd className="mt-1 text-sm">
                          {token.Telegram || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Twitter</dt>
                        <dd className="mt-1 text-sm">
                          {token.Twitter || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Website</dt>
                        <dd className="mt-1 text-sm">
                          {token.Website || "N/A"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-500">Logo</dt>
                        <dd className="mt-1 text-sm">{token.Logo || "N/A"}</dd>
                      </div>
                    </dl>
                  </TabsContent>
                  <TabsContent value="balances">
                    <dl className="text-sm overflow-auto max-h-60 w-[400px]">
                      {Object.entries(token.Balances)?.map(
                        ([address, balance]) => (
                          <div key={address}>
                            <dt className="font-mono">{address}</dt>
                            <dd className="text-lg">
                              <CurrencyDisplayInside
                                amount={balance.Amount}
                                decimals={token.Denomination}
                                ticker={token.Ticker}
                              />
                            </dd>
                          </div>
                        )
                      )}
                    </dl>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="max-w-4xl w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-4 flex flex-col space-y-12">
        <div className="flex gap-4 items-center">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.history.back()}
          >
            Back
          </Button>
          <Button
            onClick={() => onSubmit()}
            disabled={isLoading}
            variant="none"
            size="default"
            className="w-full flex-1 p-0"
          >
            <ShineBorder
              className="text-center text-2xl font-bold w-full h-10"
              color={["#2B14C8", "#98C4D3", "#4B0885"]}
            >
              Deploy Token
            </ShineBorder>
          </Button>
        </div>
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md">{error}</div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl top-0 left-0 !m-0"
          >
            <div className="h-96 relative flex flex-col gap-4">
              {steps.map((step) => (
                <motion.div
                  key={step.label}
                  className={cn(
                    "flex gap-2 items-center",
                    step.status === "pending" && "opacity-50"
                  )}
                  initial={{ y: -200 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {step.status === "current" && (
                    <LoaderIcon className="animate-spin" />
                  )}
                  {step.status === "success" && <CheckCircle2 />}
                  {step.status === "pending" && <CheckCircle2 />}

                  <span>{step.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-white dark:bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
