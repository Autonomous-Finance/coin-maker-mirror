import ArweaveImage from "@/components/cryptoui/arweave-image";
import PaymentTokenInfoBox from "@/components/payment-token-info-box";
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
import LoadingSpinner from "@/components/ui/loading-spinners";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEXI_AMM_MONITOR,
  DEXI_SUBSCRIBE_USD_PRICE,
  DEXI_URL,
  PAYMENT_TOKENS,
} from "@/config";
import { useLP } from "@/context/lp";
import useDexiSubscribed from "@/hooks/use-dexi-subscribed";
import useHopperPrice from "@/hooks/use-hopper-price";
import useTokenBalance from "@/hooks/use-token-balance";
import { formatUnits, parseUnits } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { CheckCheckIcon, LoaderIcon, XCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  paymentToken: z.string(),
});

export default function PoolDexiSubscription() {
  const lp = useLP();

  const {
    data: poolDetails,
    isLoading,
    refetch,
  } = useDexiSubscribed({
    pool: lp.address,
    enabled: true,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentToken: PAYMENT_TOKENS.filter((pt) => !pt.disabled)[0].value,
    },
  });

  const paymentTokenDetails = PAYMENT_TOKENS.find(
    (paymentToken) => paymentToken.value === form.getValues("paymentToken")
  );

  const {
    data: paymentTokenPrice,
    isLoading: isPaymentTokenPriceLoading,
    isRefetching: isPaymentTokenRefeching,
  } = useHopperPrice(form.getValues("paymentToken"));

  const { data: paymentTokenBalance } = useTokenBalance(
    form.getValues("paymentToken")
  );

  const totalPriceReal = paymentTokenPrice
    ? DEXI_SUBSCRIBE_USD_PRICE * paymentTokenPrice
    : 0;

  // Add 5% to the price
  const totalPrice = totalPriceReal + totalPriceReal * 0.05;

  const hasEnoughPaymentTokenBalance =
    Number(
      formatUnits(
        BigInt(paymentTokenBalance || "0"),
        paymentTokenDetails?.denomination || 18
      )
    ) >= totalPrice;

  const activateAMM = useMutation({
    mutationKey: ["activate-amm", lp.address],
    mutationFn: async ({
      paymentToken,
      paymentValue,
    }: {
      paymentToken: string;
      paymentValue: string;
    }) => {
      const dexiRegister = await message({
        process: paymentToken,
        tags: [
          { name: "Action", value: "Transfer" },
          {
            name: "Quantity",
            value: paymentValue.toString(),
          },
          {
            name: "Recipient",
            value: DEXI_AMM_MONITOR,
          },
          {
            name: "X-Action",
            value: "Activate-AMM",
          },
          {
            name: "X-AMM-Process",
            value: lp.address,
          },
        ],
        data: "",
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const dexiRegisterResult = await result({
        process: paymentToken,
        message: dexiRegister,
      });

      console.log("dexiRegisterResult", dexiRegisterResult);

      toast.success("🚀 Liquidity pool subscribed to DEXI!", {
        description: "The liquidity pool has been subscribed to DEXI.",
      });

      return dexiRegisterResult;
    },
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading || !poolDetails) {
    return <LoadingSpinner />;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("onSubmit", values);

    const response = await activateAMM.mutateAsync({
      paymentToken: values.paymentToken,
      paymentValue: parseUnits(
        totalPrice.toString(),
        paymentTokenDetails?.denomination || 18
      ).toString(),
    });

    console.log("handleRegisterAMM", response);
  }

  if (poolDetails.amm_status === "public") {
    return (
      <div className="space-y-6">
        <div className="text-sm font-mono mb-2 border border-emerald-600 rounded-xl py-4 px-2 bg-emerald-900/30 flex items-center gap-4 text-emerald-500">
          <CheckCheckIcon className="text-emerald-500 w-10 h-10" /> Your pool is
          already subscribed to DEXI.
        </div>

        <Link to={`${DEXI_URL}/#/pool/${lp.address}`} target="_blank">
          <Button variant="secondary" className="w-full">
            View on DEXI
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6 h-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="text-sm font-mono mb-2 border border-orange-600 rounded-xl p-4 bg-orange-900/30 flex items-center gap-4 text-orange-500 justify-between">
          <div className="flex gap-4 items-center">
            <XCircleIcon className="text-orange-500 w-10 h-10" /> This pool is
            not subscribed to DEXI yet.
          </div>
        </div>
        <div className="space-y-8 flex flex-1 flex-col justify-around">
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
                        disabled={paymentToken.disabled}
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
                <PaymentTokenInfoBox token={form.getValues("paymentToken")} />
              </FormItem>
            )}
          />
          <Alert className="space-y-4 border-violet-500 bg-violet-500/20 text-violet-300 text-lg flex flex-col items-center gap-2">
            Price in {paymentTokenDetails?.label}
            {isPaymentTokenPriceLoading || isPaymentTokenRefeching ? (
              <div>
                <LoaderIcon className="animate-spin" />
              </div>
            ) : (
              <span className="text-2xl font-bold font-mono">
                {totalPrice.toFixed(4)} {paymentTokenDetails?.label}
              </span>
            )}
          </Alert>
          <Button
            type="submit"
            disabled={!hasEnoughPaymentTokenBalance || activateAMM.isPending}
            className="w-full"
          >
            {hasEnoughPaymentTokenBalance
              ? "Subscribe to DEXI"
              : "Insufficient Balance"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
