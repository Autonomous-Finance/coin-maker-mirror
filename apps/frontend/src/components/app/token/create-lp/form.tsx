import { CurrencyDisplayInside } from "@/components/cryptoui/currency-display";
import TokenLogo from "@/components/cryptoui/token-logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Switch } from "@/components/ui/switch";
import {
  DEXI_SUBSCRIBE_USD_PRICE,
  PAYMENT_TOKENS,
  PAIR_TOKENS,
} from "@/config";
import { useCreateLP } from "@/context/create-lp";
import { useToken } from "@/hooks/use-token";
import useTokenBalance from "@/hooks/use-token-balance";
import { cn, formatUnits, parseUnits } from "@/lib/utils";
import type { Tag, Token } from "@/types";
import { createAMMMachine } from "@/xstate/machines/create-amm";
import { zodResolver } from "@hookform/resolvers/zod";
import { dryrun } from "@/lib/ao-connection";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMachine } from "@xstate/react";
import { AnimatePresence, motion } from "framer-motion";
import fromExponential from "from-exponential";
import {
  AreaChartIcon,
  BarChart2Icon,
  CandlestickChartIcon,
  CheckCircle2,
  ChevronRight,
  FolderClockIcon,
  HistoryIcon,
  LoaderIcon,
  ReceiptIcon,
  UsersIcon,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useHopperPrice from "@/hooks/use-hopper-price";
import ArweaveImage from "@/components/cryptoui/arweave-image";
import TickerDisplay from "@/components/cryptoui/ticker-display";
import PercentagesGroup from "../../percentages-group";
import HashDisplay from "@/components/cryptoui/hash-display";
import numbro from "numbro";
import DexiSubscribeInfobox from "@/components/dexi-subscribe-infobox";
import Arweave from "arweave";
import PaymentTokenInfoBox from "@/components/payment-token-info-box";

const USD_PRICE = DEXI_SUBSCRIBE_USD_PRICE;

export default function CreateLiquidityPoolForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    pairToken,
    setPairToken,
    setTokenAmount,
    setPairTokenAmount,
    tokenAmount,
    pairTokenAmount,
  } = useCreateLP();
  const { token } = useToken();
  const navigate = useNavigate({
    from: "/token/$tokenId/create-liquidity-pool",
  });
  const [isPairTokenLoading, setIsPairTokenLoading] = useState(false);

  const selectedPairToken =
    pairToken?.TokenProcess || PAIR_TOKENS[0].TokenProcess;
  const selectedPairTokenDenomination =
    pairToken?.Denomination || PAIR_TOKENS[0].Denomination;

  const { data: tokenBalance, isLoading: tokenBalanceIsLoading } =
    useTokenBalance(token.TokenProcess);
  const { data: pairTokenBalance, isLoading: pairTokenBalanceIsLoading } =
    useTokenBalance(selectedPairToken);

  const tokenMaxAmount =
    Number(formatUnits(BigInt(tokenBalance || "0"), token.Denomination)) || 0;
  const pairTokenMaxAmount =
    Number(
      formatUnits(
        BigInt(pairTokenBalance || "0"),
        pairToken?.Denomination || 18
      )
    ) || 0;

  const formSchema = z.object({
    address: z.string().min(1),
    tokenAmount: z.number().min(1).max(tokenMaxAmount),
    pairTokenAmount: z.number().min(1).max(pairTokenMaxAmount),
    dexiRegister: z.boolean().optional(),
    paymentToken: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: selectedPairToken,
      tokenAmount: Number(parseUnits(tokenAmount, token.Denomination)) || 0,
      pairTokenAmount:
        Number(parseUnits(pairTokenAmount, selectedPairTokenDenomination)) || 0,
      dexiRegister: false,
      paymentToken: PAYMENT_TOKENS.filter((pt) => !pt.disabled)[0].value,
    },
  });

  // PERCENTAGES GROUP
  const percentages = [10, 25, 50, 75, 100];

  // Calculate how much percentage is tokenAmount from tokenMaxAmount
  const tokenAmountPercentage =
    (Number(form.watch("tokenAmount")) / tokenMaxAmount) * 100;

  // Calculate how much percentage is pairTokenAmount from pairTokenMaxAmount
  const pairTokenAmountPercentage =
    (Number(form.watch("pairTokenAmount")) / pairTokenMaxAmount) * 100;

  function handleSelectTokenAmountPercentage(percentage: number) {
    const tokenAmount = tokenMaxAmount * (percentage / 100);
    form.setValue("tokenAmount", tokenAmount);
  }

  function handleSelectPairTokenAmountPercentage(percentage: number) {
    const pairTokenAmount = pairTokenMaxAmount * (percentage / 100);
    form.setValue("pairTokenAmount", pairTokenAmount);
  }

  const paymentTokenDetails = PAYMENT_TOKENS.find(
    (paymentToken) => paymentToken.value === form.getValues("paymentToken")
  );

  const {
    data: paymentTokenPrice,
    isLoading: isPaymentTokenPriceLoading,
    isRefetching: isPaymentTokenRefeching,
  } = useHopperPrice(form.getValues("paymentToken"));

  const {
    data: paymentTokenBalance,
    isLoading: isLoadingPaymentToken,
    isRefetching: isRefetchingPaymentToken,
  } = useTokenBalance(form.getValues("paymentToken"));

  const totalPriceReal = paymentTokenPrice ? USD_PRICE * paymentTokenPrice : 0;

  // Add 5% to totalPrice
  const totalPrice = totalPriceReal + totalPriceReal * 0.05;

  const hasEnoughPaymentTokenBalance = form.getValues("dexiRegister")
    ? Number(
        formatUnits(
          BigInt(paymentTokenBalance || "0"),
          paymentTokenDetails?.denomination || 18
        )
      ) >= totalPrice
    : true;

  async function onBlurPairToken() {
    try {
      setIsPairTokenLoading(true);
      const pairTokenValue = form.getValues("address");

      if (!pairTokenValue) {
        throw new Error("Pair token address not set");
      }

      const messageResult = await dryrun({
        process: pairTokenValue,
        tags: [{ name: "Action", value: "Info" }],
        data: "",
      });

      if (messageResult.Messages[0].Tags) {
        const Name = messageResult.Messages[0].Tags.find(
          (tag: Tag) => tag.name === "Name"
        );

        const Ticker = messageResult.Messages[0].Tags.find(
          (tag: Tag) => tag.name === "Ticker"
        );

        const Denomination = messageResult.Messages[0].Tags.find(
          (tag: Tag) => tag.name === "Denomination"
        );

        const Logo = messageResult.Messages[0].Tags.find(
          (tag: Tag) => tag.name === "Logo"
        );

        if (Name.value && Ticker.value && Denomination.value) {
          setPairToken({
            TokenProcess: pairTokenValue,
            Name: Name?.value || "Unknown",
            Ticker: Ticker?.value || "Unknown",
            Denomination: Number(Denomination?.value) || 0,
            Logo: Logo?.value || "",
          });
        } else {
          throw new Error("Pair token info not found");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding pair token", {
        description:
          "An error occurred while adding the pair token. Please try again.",
      });
    } finally {
      setIsPairTokenLoading(false);
    }
  }

  async function onBlurTokenAmount() {
    const tokenAmount = form.getValues("tokenAmount");

    if (tokenAmount) {
      setTokenAmount(
        parseUnits(tokenAmount.toString(), token.Denomination).toString()
      );
    }
  }

  async function onBlurPairTokenAmount() {
    const pairTokenAmount = form.getValues("pairTokenAmount");

    if (!pairToken) {
      return;
    }

    if (pairTokenAmount) {
      setPairTokenAmount(
        parseUnits(
          pairTokenAmount.toString(),
          pairToken.Denomination
        ).toString()
      );
    }
  }

  const [state, send] = useMachine(createAMMMachine, {
    input: {
      tokenB: token.TokenProcess,
      tokenA: selectedPairToken,
      tokenBAmount: parseUnits(
        form.getValues("tokenAmount").toString(),
        token.Denomination
      ).toString(),
      tokenAAmount: parseUnits(
        form.getValues("pairTokenAmount").toString(),
        pairToken?.Denomination ?? 18
      ).toString(),
      dexiRegister: !!form.getValues("dexiRegister"),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    /* setIsLoading(true); */

    if (!token || !pairToken) {
      throw new Error("Token or Pair Token not set");
    }

    if (state.matches("idle")) {
      send({
        type: "START",
        tokenB: token.TokenProcess,
        tokenA: selectedPairToken,
        tokenBAmount: parseUnits(
          values.tokenAmount.toString(),
          token.Denomination
        ).toString(),
        tokenAAmount: parseUnits(
          values.pairTokenAmount.toString(),
          pairToken.Denomination
        ).toString(),
        dexiRegister: !!values.dexiRegister,
        dexiPaymentToken: values.paymentToken,
        dexiPaymentTokenValue: parseUnits(
          totalPrice.toString(),
          paymentTokenDetails?.denomination || 18
        ).toString(),
      });
    }
  }

  const steps = Object.entries(state.context.steps).map(([id, details]) => ({
    id,
    details,
  }));

  if (state.matches("completed")) {
    toast.success("🚀 Liquidity pool created!", {
      description: "The liquidity pool has been created.",
    });

    navigate({
      to: "/token/$tokenId",
      params: {
        tokenId: token.TokenProcess,
      },
    });

    return null;
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full grid grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="p-4 border border-dashed rounded-md bg-purple-700/10 border-primary/30 hover:border-primary/80">
              <FormField
                control={form.control}
                name="tokenAmount"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2 font-mono">
                          <TokenLogo token={token as Token} big="w-12 h-12" />
                          <div className="flex flex-col gap-2 text-xs">
                            <span className="text-lg font-bold">
                              <TickerDisplay>{token.Ticker}</TickerDisplay>
                            </span>
                            <HashDisplay hash={token.TokenProcess} />
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-right text-muted-foreground">
                            BALANCE
                          </div>
                          {token && tokenBalance && (
                            <CurrencyDisplayInside
                              amount={fromExponential(tokenBalance || 0) || "0"}
                              decimals={token.Denomination}
                              ticker={token.Ticker}
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter pair token amount"
                            className="text-lg h-14"
                            {...field}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value) || 0)
                            }
                            onBlurCapture={() => onBlurTokenAmount()}
                            disabled={tokenBalanceIsLoading}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                      <PercentagesGroup
                        percentages={percentages}
                        selectedPercentage={tokenAmountPercentage}
                        handlerFunction={handleSelectTokenAmountPercentage}
                      />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={() => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center justify-center text-xl">
                      Pair Token
                    </div>
                  </FormLabel>
                  <div className="grid grid-cols-3 space-x-2">
                    {PAIR_TOKENS.map((pt) => (
                      <Button
                        type="button"
                        key={pt.TokenProcess}
                        variant={
                          form.getValues("address") === pt.TokenProcess
                            ? "secondary"
                            : "outline"
                        }
                        className={cn(
                          "flex items-center gap-2 font-mono",
                          form.getValues("address") === pt.TokenProcess &&
                            "bg-primary/20 border-primary/80 border"
                        )}
                        onClick={() => {
                          setPairToken(pt);
                          form.setValue("address", pt.TokenProcess);
                          onBlurPairToken();
                        }}
                        disabled={isPairTokenLoading}
                      >
                        <ArweaveImage
                          src={pt.Logo}
                          alt={pt.Name}
                          className="w-6 h-6"
                        />
                        <TickerDisplay>{pt.Ticker}</TickerDisplay>
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                  <PaymentTokenInfoBox token={form.getValues("address")} />
                </FormItem>
              )}
            />

            <div className="p-4 border border-dashed rounded-md bg-purple-700/10 border-primary/30 hover:border-primary/80">
              <FormField
                control={form.control}
                name="pairTokenAmount"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-4">
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-2 font-mono">
                          <TokenLogo
                            token={pairToken as Token}
                            big="w-12 h-12"
                          />
                          <div className="flex flex-col gap-2 text-xs">
                            <span className="text-lg font-bold">
                              <TickerDisplay>{pairToken?.Ticker}</TickerDisplay>
                            </span>
                            <HashDisplay hash={pairToken?.TokenProcess || ""} />
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-right text-muted-foreground">
                            BALANCE
                          </div>
                          {token && tokenBalance && (
                            <CurrencyDisplayInside
                              amount={
                                fromExponential(pairTokenBalance || 0) || "0"
                              }
                              decimals={pairToken?.Denomination || 18}
                              ticker={pairToken?.Ticker}
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter pair token amount"
                            {...field}
                            onChange={(event) =>
                              field.onChange(Number(event.target.value) || 0)
                            }
                            onBlurCapture={() => onBlurPairTokenAmount()}
                            disabled={pairTokenBalanceIsLoading || !pairToken}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                      <PercentagesGroup
                        percentages={percentages}
                        selectedPercentage={pairTokenAmountPercentage}
                        handlerFunction={handleSelectPairTokenAmountPercentage}
                      />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {form.getValues("dexiRegister") && (
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="paymentToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Token</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your desired Payment Token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_TOKENS.map((paymentToken) => (
                            <SelectItem
                              key={paymentToken.value}
                              value={paymentToken.value}
                              disabled={
                                paymentToken.disabled || isLoadingPaymentToken
                              }
                            >
                              <div className="flex items-center gap-1">
                                <span>
                                  <ArweaveImage
                                    src={paymentToken.logo}
                                    className="w-5 h-5"
                                  />
                                </span>
                                {paymentToken.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Price will be converted to the selected payment token.
                      </FormDescription>
                      <FormMessage />
                      <PaymentTokenInfoBox
                        token={form.getValues("paymentToken")}
                      />
                    </FormItem>
                  )}
                />
                <Alert className="space-y-4 border-violet-500 bg-violet-500/20 text-violet-300 text-lg flex flex-col items-center gap-2">
                  Price in ${paymentTokenDetails?.label}
                  {isPaymentTokenPriceLoading || isPaymentTokenRefeching ? (
                    <div>
                      <LoaderIcon className="animate-spin" />
                    </div>
                  ) : (
                    <span className="text-2xl font-bold font-mono">
                      {numbro(totalPrice).format({ mantissa: 3 })} $
                      {paymentTokenDetails?.label}
                    </span>
                  )}
                </Alert>
              </div>
            )}
          </div>

          <div>
            <div className="space-y-8">
              <DexiSubscribeInfobox />

              <FormField
                control={form.control}
                name="dexiRegister"
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      "flex flex-row items-center justify-between rounded-lg border p-4",
                      form.getValues("dexiRegister")
                        ? "bg-purple-600/30 border-purple-600/80"
                        : "bg-purple-700/10 border-purple-600/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src="/dexi-logo.svg"
                        alt="Dexi"
                        className="w-8 h-8"
                      />
                      <div className="space-y-0.5">
                        <FormLabel className="text-md flex items-center mb-2 gap-1 text-purple-300">
                          Subscribe now!
                        </FormLabel>
                        <FormDescription className="text-sm text-muted-foreground text-purple-300">
                          Subscribe now and gain valuable insights!
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
          </div>
        </div>
        <div className="w-full mx-auto rounded-none md:rounded-2xl shadow-input col-span-4 flex flex-col space-y-6">
          <div className="flex gap-4">
            <Link
              to="/token/$tokenId"
              params={{ tokenId: token.TokenProcess }}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              className="flex flex-grow items-center gap-2"
              disabled={
                isLoading ||
                tokenBalanceIsLoading ||
                pairTokenBalanceIsLoading ||
                !pairToken ||
                !token ||
                !hasEnoughPaymentTokenBalance
              }
            >
              {isLoading ? (
                "Processing..."
              ) : (
                <>
                  {!hasEnoughPaymentTokenBalance
                    ? "Insufficient Payment Token Balance"
                    : "Create Liquidity Pool"}
                  <ChevronRight />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
      <AnimatePresence mode="wait">
        {state.matches("running") && (
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
            className="w-full h-full fixed inset-0 z-30 flex items-center justify-center backdrop-blur-2xl top-0 left-0 !m-0"
          >
            <div className="h-96 relative flex flex-col gap-4">
              {steps.map((step) => (
                <motion.div
                  key={step.details.label}
                  className={cn(
                    "flex gap-2 items-center",
                    step.details.status === "pending" && "opacity-50",
                    step.details.status === "failed" && "text-red-500",
                    step.details.enabled !== undefined &&
                      step.details.enabled === false &&
                      "line-through"
                  )}
                  initial={{ y: -200 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 100 }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.details.status === "current" && (
                      <LoaderIcon className="animate-spin" />
                    )}
                    {step.details.status === "done" && <CheckCircle2 />}
                    {step.details.status === "pending" && <CheckCircle2 />}
                    {step.details.status === "failed" && <XCircle />}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div className="flex items-center">
                      {step.details.label}
                      {step.details.status === "failed" && (
                        <Button
                          variant="link"
                          onClick={() => send({ type: "RETRY" })}
                        >
                          retry
                        </Button>
                      )}
                    </motion.div>

                    {step.details.result && (
                      <motion.div
                        className="text-sm text-muted-foreground font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 100 }}
                        transition={{ duration: 0.5 }}
                      >
                        {step.details.result}
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
              {/* {state.matches({ running: "completed" }) && (
								<motion.div>
									<Link
										to="/token/$tokenId"
										params={{
											tokenId: token.TokenProcess,
										}}
										className={cn(buttonVariants())}
									>
										Go to your Pool
									</Link>
								</motion.div>
							)} */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Form>
  );
}
