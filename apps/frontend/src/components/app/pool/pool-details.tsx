import HashDisplay from "@/components/cryptoui/hash-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  AO_LINK_URL,
  BOTEGA_URL,
  DEXI_URL,
  TOKEN_LOCKER_PROCESS,
} from "@/config";
import { useLP } from "@/context/lp";
import useTokenBalance from "@/hooks/use-token-balance";
import useUserLockedTokens from "@/hooks/user-user-locked-tokens";
import { cn, formatUnits, parseUnits } from "@/lib/utils";
import type { Tag } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import PoolDexiSubscription from "./pool-dexi-subscription";
import PoolReserves from "./pool-reserves";
import aolinkLogo from "/aolink-logo.svg";
import barkLogo from "/bark-logo.svg";
import dexiLogo from "/dexi-logo.svg";
import TickerDisplay from "@/components/cryptoui/ticker-display";
import numbro from "numbro";
import PercentagesGroup from "../percentages-group";
import DexiSubscribeInfobox from "@/components/dexi-subscribe-infobox";
import LPLockingInfobox from "@/components/lp-locking-infobox";
dayjs.extend(relativeTime);

function ClaimLockedTokensForm({
  availableToClaim,
}: {
  availableToClaim: bigint;
}) {
  const lp = useLP();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    quantity: z.number().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity:
        Number(
          formatUnits(availableToClaim, Number(lp.details.Denomination))
        ) || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (quantity: number) => {
      // Claim locked tokens
      const msg = await message({
        process: TOKEN_LOCKER_PROCESS,
        tags: [
          { name: "Action", value: "Claim-Tokens" },
          { name: "Token", value: lp.address },
          {
            name: "Quantity",
            value: parseUnits(
              String(quantity),
              Number(lp.details.Denomination)
            ).toString(),
          },
        ],
        data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const res = await result({
        process: TOKEN_LOCKER_PROCESS,
        message: msg,
      });

      // if res.Messages contains a message with the tag name "Error", throw an error containing the tag value
      if (
        res.Messages.find((msg) =>
          msg.Tags.find((tag: Tag) => tag.name === "Error")
        )
      ) {
        throw new Error(
          res.Messages.find((msg) =>
            msg.Tags.find((tag: Tag) => tag.name === "Error")
          )?.Tags.find((tag: Tag) => tag.name === "Error")?.value
        );
      }

      // return the Message Data from the one that contains tag Action = Claimed-Tokens
      return res.Messages.find((msg) =>
        msg.Tags.find(
          (tag: Tag) => tag.name === "Action" && tag.value === "Claimed-Tokens"
        )
      )?.Data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("🚀 Tokens successfully claimed", {
        description: "Your tokens have been successfully claimed.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error Claiming Tokens.", {
        description: "An error occurred while trying to claim locked tokens.",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    return mutation.mutateAsync(values.quantity);
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {mutation.isError ? (
        <Alert variant="destructive">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "An error occurred while trying to claim locked tokens."}
        </Alert>
      ) : null}

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter quantity to claim"
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

          <div className="w-full flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Loading..." : "Claim Locked Tokens"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function LockTokensForm({ balance }: { balance?: string }) {
  const lp = useLP();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    amount: z.number().max(Number(balance || "0")),
    period: z.number(),
  });

  const formattedBalance = Number(
    Math.floor(
      Number(
        formatUnits(BigInt(balance || "0"), Number(lp.details.Denomination))
      )
    )
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: formattedBalance,
      period: 365,
    },
  });

  // PERCENTAGES GROUP
  const percentages = [10, 25, 50, 75, 100];
  const days = [
    {
      label: "3m",
      value: 90,
    },
    {
      label: "6m",
      value: 180,
    },
    {
      label: "1y",
      value: 365,
    },
    {
      label: "2y",
      value: 730,
      tooltip:
        "Locking for more than 1 year will mark this as a safe investment.",
    },
    {
      label: "4y",
      value: 1460,
      tooltip:
        "Locking for more than 1 year will mark this as a safe investment.",
    },
  ];

  // Calculate how much percentage is tokenAmount from tokenMaxAmount
  const tokenAmountPercentage = Number(
    ((Number(form.watch("amount")) / formattedBalance) * 100).toFixed(0)
  );

  function handleSelectTokenAmountPercentage(percentage: number) {
    const tokenAmount = Math.floor(formattedBalance * (percentage / 100));
    form.setValue("amount", tokenAmount);
  }

  function handleSelectDays(days: number) {
    form.setValue("period", days);
  }

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Format the period to miliseconds
      const miliseconds = values.period * 24 * 60 * 60 * 1000;

      const tokenTransferMsg = await message({
        process: lp.address,
        tags: [
          { name: "Action", value: "Transfer" },
          { name: "Recipient", value: TOKEN_LOCKER_PROCESS },
          {
            name: "Quantity",
            value: parseUnits(
              String(values.amount),
              Number(lp.details.Denomination)
            ).toString(),
          },
          { name: "X-Action", value: "Lock-Tokens" },
          { name: "X-Period", value: String(miliseconds) },
        ],
        data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      return result({
        process: lp.address,
        message: tokenTransferMsg,
      });
    },
    onSuccess: () => {
      toast.success("🚀 Tokens successfully locked", {
        description: "Your tokens have been successfully locked up.",
      });

      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error Locking up Tokens.", {
        description: "An error occurred while trying to lock up tokens.",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    return mutation.mutateAsync(values);
  }

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  <span className="font-mono">
                    {numbro(
                      formatUnits(
                        BigInt(balance || "0"),
                        Number(lp.details.Denomination)
                      )
                    ).format({
                      thousandSeparated: true,
                      mantissa: 0,
                    })}
                  </span>
                </div>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter LP token amount"
                  type="number"
                  step={0.1}
                  {...field}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </FormControl>
              <PercentagesGroup
                percentages={percentages}
                selectedPercentage={tokenAmountPercentage}
                handlerFunction={handleSelectTokenAmountPercentage}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Period (days)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter days to lock"
                  {...field}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </FormControl>
              <PercentagesGroup
                percentages={days}
                selectedPercentage={form.watch("period")}
                handlerFunction={handleSelectDays}
                noPercent
              />
              <FormMessage />
              <Alert className="mt-4">
                <AlertDescription>
                  Your tokens will be locked until{" "}
                  {dayjs()
                    .add(form.watch("period"), "day")
                    .format("DD MMM, YYYY")}
                  .
                </AlertDescription>
              </Alert>
            </FormItem>
          )}
        />

        <div className="w-full flex justify-end">
          <Button
            type="submit"
            disabled={mutation.isPending || formattedBalance === 0}
          >
            {mutation.isPending ? "Loading..." : "Lock Tokens"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function PoolDetails() {
  const lp = useLP();
  const { data: balance } = useTokenBalance(lp.address);
  const { data: lockedTokens } = useUserLockedTokens(lp.address);

  let availableToClaim = 0n;

  if (lockedTokens) {
    availableToClaim = lockedTokens.reduce((acc, token) => {
      if (dayjs().isAfter(dayjs(Number(token?.End)))) {
        return acc + BigInt(token?.Amount || "0");
      }

      return acc;
    }, 0n);
  }

  return (
    <div className="space-y-16">
      <fieldset className="rounded-lg border grid grid-cols-4 gap-6 p-4">
        <legend className="-ml-1 px-1 text-lg font-bold">Pool Details</legend>
        <div className="col-span-4 flex items-center justify-between gap-8">
          <div>
            <HashDisplay
              hash={lp.address}
              copyButton={true}
              format="full"
              link={`https://ao.link/#/entity/${lp.address}`}
            />
            {lp.details?.token && lp.details.pairToken && (
              <PoolReserves
                token={lp.details.token}
                pairToken={lp.details.pairToken}
                tokenReserves={lp.details.tokenReserves}
                pairTokenReserves={lp.details.pairTokenReserves}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`${AO_LINK_URL}/#/entity/${lp.address}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              <img src={aolinkLogo} alt="View on AO Link" className="h-3" />
            </a>
            <a
              href={`${BOTEGA_URL}/#/pools`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              <img src={barkLogo} alt="View on Botega" className="h-5" />
            </a>
            <a
              href={`${DEXI_URL}/#/pool/${lp.address}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              <img src={dexiLogo} alt="View on Dexi" className="h-5" />
            </a>
          </div>
        </div>
      </fieldset>
      <fieldset className="grid grid-cols-4 gap-4">
        <div className="col-span-2 flex flex-col gap-12">
          <div className="space-y-4">
            <fieldset className="rounded-lg border flex flex-col gap-6 p-4">
              <legend className="-ml-1 px-1 text-md font-bold">
                Lock <TickerDisplay>{lp.details.Ticker}</TickerDisplay>
              </legend>
              <LockTokensForm balance={balance} />
            </fieldset>
          </div>
        </div>
        <div className="col-span-2 flex flex-grow flex-col gap-6">
          {lockedTokens && lockedTokens.length > 0 ? (
            <div className="space-y-4">
              <fieldset className="rounded-lg border flex flex-col gap-6 p-4">
                <legend className="-ml-1 px-1 text-md font-bold">
                  Locked {lp.details.Name} Tokens
                </legend>
                {lockedTokens.map((token, index) => (
                  <div
                    key={index}
                    className="text-sm border border-yellow-500/50 p-4 bg-yellow-500/20 rounded-lg"
                  >
                    <span className="font-bold">
                      {numbro(
                        Number(
                          formatUnits(
                            BigInt(token?.Amount || "0"),
                            Number(lp.details.Denomination)
                          )
                        )
                      ).format({ thousandSeparated: true })}
                    </span>{" "}
                    locked until{" "}
                    <span className="font-bold">
                      {dayjs(Number(token?.End)).format("DD MMM, YYYY, HH:ss")}.
                    </span>
                  </div>
                ))}
              </fieldset>
              <fieldset className="rounded-lg border flex flex-col gap-6 p-4">
                <legend className="-ml-1 px-1 text-md font-bold">
                  Claim Locked {lp.details.Name} Tokens
                </legend>
                <ClaimLockedTokensForm availableToClaim={availableToClaim} />
              </fieldset>
            </div>
          ) : (
            <LPLockingInfobox />
          )}
        </div>
      </fieldset>
      <fieldset className="rounded-lg border grid grid-cols-4 gap-6 p-4">
        <legend className="-ml-1 px-1 text-lg font-bold flex gap-2 items-center">
          <img src={dexiLogo} alt="Dexi Logo" />
          Dexi Subscription
        </legend>

        <div className="col-span-2">
          <PoolDexiSubscription />
        </div>
        <div className="col-span-2 flex items-center">
          <DexiSubscribeInfobox />
        </div>
      </fieldset>
    </div>
  );
}
