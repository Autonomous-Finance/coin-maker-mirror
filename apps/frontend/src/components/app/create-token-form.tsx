import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DistributionProvider } from "@/context/distribution-context";
import { type Step, StepsLoadingProvider } from "@/context/steps-loading";
import { useCreateToken } from "@/hooks/use-create-token";
import { useLogs } from "@/hooks/use-logs";
import { useStepsLoading } from "@/hooks/use-steps-loading";
import readRegistryMessage from "@/lib/aoconnect/read-registry-message";
import { cn, parseUnits } from "@/lib/utils";
import type { Tag } from "@/types";
import { createDataItemSigner, message } from "@permaweb/aoconnect";
import { dryrun } from "@/lib/ao-connection";
import { Link, useNavigate } from "@tanstack/react-router";
import { useActiveAddress } from "arweave-wallet-kit";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  FileQuestionIcon,
  LoaderIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ArweaveImage from "../cryptoui/arweave-image";
import { CurrencyDisplayInside } from "../cryptoui/currency-display";
import LoadingState from "../loading-state";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ShineBorder from "../ui/shine-border";
import { Switch } from "../ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import DistributionForm from "./create-token/distribution-form";
import DisplayLogs from "./display-logs";
import { UploadLogoForm } from "./upload-logo-form";
import ENV from "@/env";

// Enum for steps
// 0: Token Settings
// 1: Social Media
// 2: Distribution
// 4: Deploy Token
// 5: Token Deployed

export enum CREATE_STEPS {
  TOKEN_SETTINGS = 0,
  SOCIAL_MEDIA = 1,
  DISTRIBUTION = 2,
  DEPLOY_TOKEN = 3,
  TOKEN_DEPLOYED = 4,
}

function TokenSettingsForm() {
  const { token, setStep, setToken } = useCreateToken();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    Name: z.string().min(2),
    Ticker: z.string().min(2).max(50),
    Denomination: z.number().int().min(1),
    TotalSupply: z.string().min(1),
    Description: z.string(),
    Logo: z.string(),
    RenounceOwnership: z.boolean(),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Set new token values
      setToken({
        ...token,
        ...values,
        TotalSupply: parseUnits(
          values.TotalSupply,
          values.Denomination
        ).toString(),
      });

      setStep(CREATE_STEPS.SOCIAL_MEDIA);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("🚫 Form could not be submitted", {
        description:
          "An error occurred while validating your inputs. Please check them and retry.",
      });
      setIsLoading(false);
    }
  }

  async function handleUploadLogo(txid: string) {
    return form.setValue("Logo", txid);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...token,
      RenounceOwnership: false,
    },
  });

  return (
    <div className="container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div
            className={cn(
              "max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-2 space-y-12",
              isLoading ? "opacity-50" : null
            )}
          >
            <fieldset className="grid gap-6 rounded-lg border p-6">
              <legend className="-ml-1 px-1 text-lg font-bold">
                Coin Settings
              </legend>
              <p className="text-sm text-muted-foreground">
                Set up the on-chain properties of your coin and how it will
                appear when viewed in wallets and exchanges.
              </p>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Test Token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="Ticker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticker</FormLabel>
                      <FormControl>
                        <Input placeholder="TSTT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Denomination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Denomination</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="18"
                          {...field}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="TotalSupply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Total Supply</span>
                        <div className="font-mono flex items-end gap-2">
                          <CurrencyDisplayInside
                            amount={parseUnits(
                              field.value,
                              form.getValues("Denomination")
                            ).toString()}
                            decimals={form.getValues("Denomination")}
                            ticker=""
                          />
                          <span className="text-muted-foreground text-xs">
                            * 10^{form.getValues("Denomination")}
                          </span>{" "}
                          {form.getValues("Ticker")}
                        </div>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="1000000"
                            {...field}
                            onChange={(event) =>
                              field.onChange(
                                BigInt(event.target.value).toString() || "0"
                              )
                            }
                            className="relative w-full"
                          />
                          <Select
                            onValueChange={(value) =>
                              form.setValue("TotalSupply", value)
                            }
                          >
                            <SelectTrigger className="absolute top-1/2 -translate-y-1/2 right-1 w-[180px]">
                              <SelectValue placeholder="Select Predefined" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="1000000">
                                  1,000,000
                                </SelectItem>
                                <SelectItem value="10000000">
                                  10,000,000
                                </SelectItem>
                                <SelectItem value="100000000">
                                  100,000,000
                                </SelectItem>
                                <SelectItem value="1000000000">
                                  1,000,000,000
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A test token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Logo"
                  render={({ field }) => (
                    <FormItem>
                      <div className="w-full flex items-center justify-between">
                        <FormLabel>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex gap-2 items-center">
                                  Logo
                                  <FileQuestionIcon className="w-4 h-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Arweave transaction ID containing the logo
                                  image.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <UploadLogoForm handleUploadLogo={handleUploadLogo} />
                      </div>
                      <FormControl>
                        <div className="flex items-center gap-4">
                          <ArweaveImage src={field.value} />
                          <Input
                            className="flex-grow"
                            placeholder="txid"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="RenounceOwnership"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4 pr-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            Renounce Ownership
                          </FormLabel>
                          <FormDescription>
                            By renouncing ownership, you will make the token
                            immutable. This will improve trust in the token as
                            it will be impossible to change the token's
                            properties.
                          </FormDescription>
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
          </div>
          <div className="w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-4 flex flex-col space-y-12 max-w-lg">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => form.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="flex flex-grow items-center gap-2"
                size="lg"
              >
                {isLoading ? (
                  "Saving details..."
                ) : (
                  <>
                    Continue to Social Media
                    <ChevronRight />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

function SocialMediaForm() {
  const { token, setStep, setToken } = useCreateToken();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    Telegram: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(
            value
          ),
        {
          message: "Please provide a valid URL",
        }
      ),
    Twitter: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(
            value
          ),
        {
          message: "Please provide a valid URL",
        }
      ),
    Website: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(
            value
          ),
        {
          message: "Please provide a valid URL",
        }
      ),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Set new token values
      setToken({
        ...token,
        ...values,
      });

      setStep(CREATE_STEPS.DISTRIBUTION);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("🚫 Form could not be submitted", {
        description:
          "An error occurred while validating your inputs. Please check them and retry.",
      });
      setIsLoading(false);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: token,
  });

  return (
    <div className="container">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div
            className={cn(
              "max-w-lg w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-2 space-y-12",
              isLoading ? "opacity-50" : null
            )}
          >
            <fieldset className="grid gap-6 rounded-lg border p-4">
              <legend className="-ml-1 px-1 text-lg font-bold">
                Social Media
              </legend>
              <p className="text-sm text-muted-foreground">
                Setup your Telegram, Twitter, and website links.
              </p>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Telegram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://t.me/test" {...field} />
                      </FormControl>
                      <FormDescription>Add the telegram link.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X</FormLabel>
                      <FormControl>
                        <Input placeholder="https://x.com/test" {...field} />
                      </FormControl>
                      <FormDescription>
                        Add the token X profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="Website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://test.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </fieldset>
          </div>
          <div className="w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-4 flex flex-col space-y-12 max-w-lg">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setStep(CREATE_STEPS.TOKEN_SETTINGS)}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex flex-grow items-center gap-2"
              >
                {isLoading ? (
                  "Saving details..."
                ) : (
                  <>
                    Continue to Distribution
                    <ChevronRight />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

function DeployTokenForm() {
  const { token, setStep } = useCreateToken();
  const [isLoading, setIsLoading] = useState(false);
  const { logs, addLog } = useLogs();
  const { steps, updateStep } = useStepsLoading();
  const navigate = useNavigate({ from: "/create-token" });

  async function onSubmit() {
    setIsLoading(true);

    try {
      // Update step status
      updateStep(1, "current");

      // Add the token to the TokenRegistry
      addLog("Adding token to TokenRegistry...");

      const tags = [
        { name: "Action", value: "Add-Token" },
        { name: "Name", value: token.Name },
        { name: "TotalSupply", value: token.TotalSupply },
        { name: "Balances", value: JSON.stringify(token.Balances) },
        { name: "Ticker", value: token.Ticker },
        { name: "Denomination", value: token.Denomination.toString() },
        { name: "Description", value: token.Description },
        { name: "Telegram", value: token.Telegram },
        { name: "Twitter", value: token.Twitter },
        { name: "Website", value: token.Website },
        { name: "Logo", value: token.Logo },
      ];

      if (token.RenounceOwnership) {
        tags.push({ name: "RenounceOwnership", value: "true" });
      }

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
            toast.success("🚀 Token process spawned successfully!");

            return tokenProcess.value;
          }

          // Try again
          if (tries < 5) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return await queryTokenProcessId(internalId, tries + 1);
          }

          throw new Error("Token process ID not found");
        }

        if (tries < 5) {
          // Try again
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return await queryTokenProcessId(internalId, tries + 1);
        }

        throw new Error("Token process ID not found");
      };

      // Update step status
      updateStep(2, "current");

      // Query the token process
      const tokenProcess = await queryTokenProcessId(registerTokenMsgId);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      updateStep(2, "success");

      // Add the token to the TokenRegistry
      setIsLoading(false);

      setStep(CREATE_STEPS.TOKEN_DEPLOYED);

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
    }
  }

  return (
    <div className="container">
      <div className="w-full mx-auto rounded-none md:rounded-2xl p-4 shadow-input col-span-4 flex flex-col space-y-12 max-w-3xl">
        <div className="relative flex flex-grow h-full overflow-hidden items-center justify-center rounded-lg border border-dashed shadow-sm py-20">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Ready to deploy your token?
            </h3>
            <p className="max-w-xl text-sm text-muted-foreground mb-12">
              Your token is ready to be deployed to the AO.
              <br />
              Once deployed, it will be available for trading on the AO network.
            </p>

            <div className="w-full text-left">
              <pre>{JSON.stringify(token, null, 2)}</pre>
            </div>

            <Button
              onClick={() => onSubmit()}
              disabled={isLoading}
              variant="none"
              size="lg"
            >
              <ShineBorder
                className="text-center text-2xl font-bold capitalize"
                color={["#2B14C8", "#98C4D3", "#4B0885"]}
              >
                Deploy Token
              </ShineBorder>
            </Button>
          </div>
        </div>
        {logs?.length ? <DisplayLogs logs={logs} /> : null}

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
    </div>
  );
}

function TokenDeployed() {
  return (
    <div className="flex flex-col items-center gap-6">
      <LoadingState
        title="Token is being deployed..."
        subtitle="You can close this page now, the token will be available in your Dashboard soon."
      />

      <Link to="/tokens" className={cn(buttonVariants())}>
        Go to dashboard
      </Link>
    </div>
  );
}

export default function CreateTokenForm() {
  const { step } = useCreateToken();
  const { token } = useCreateToken();
  const address = useActiveAddress();

  const deploySteps: Step[] = [
    {
      id: 1,
      label: "Adding token to TokenRegistry",
      status: "pending",
    },
    {
      id: 2,
      label: "Spawning token process",
      status: "pending",
    },
  ];

  switch (step as CREATE_STEPS) {
    case CREATE_STEPS.TOKEN_SETTINGS:
      return <TokenSettingsForm />;
    case CREATE_STEPS.SOCIAL_MEDIA:
      return <SocialMediaForm />;
    case CREATE_STEPS.DISTRIBUTION:
      return (
        <DistributionProvider
          totalSupply={token.TotalSupply}
          initialAllocations={[
            {
              address: address || "",
              amount: token.TotalSupply,
              percentage: 100,
              vested: 0,
            },
          ]}
        >
          <DistributionForm />
        </DistributionProvider>
      );
    case CREATE_STEPS.DEPLOY_TOKEN:
      return (
        <StepsLoadingProvider initialSteps={deploySteps}>
          <DeployTokenForm />
        </StepsLoadingProvider>
      );
    case CREATE_STEPS.TOKEN_DEPLOYED:
      return <TokenDeployed />;
    default:
      return null;
  }
}
