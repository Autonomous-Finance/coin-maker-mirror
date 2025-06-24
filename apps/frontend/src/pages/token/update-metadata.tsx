import { useState } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  X,
  TrendingUp,
  Shield,
  Search,
  LoaderIcon,
} from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToken } from "@/hooks/use-token";
import TickerDisplay from "@/components/cryptoui/ticker-display";
import {
  DEXI_AMM_MONITOR,
  PAYMENT_TOKENS,
  METADATA_UPDATE_USD_PRICE,
} from "@/config";
import useHopperPrice from "@/hooks/use-hopper-price";
import useTokenBalance from "@/hooks/use-token-balance";
import { formatUnits, parseUnits } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UploadLogoForm } from "@/components/app/upload-logo-form";
import { useMutation } from "@tanstack/react-query";
import { createDataItemSigner, message, result } from "@permaweb/aoconnect";
import { useActiveAddress } from "arweave-wallet-kit";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import ArweaveImage from "@/components/cryptoui/arweave-image";
import PaymentTokenInfoBox from "@/components/payment-token-info-box";

const customLinkSchema = z.object({
  key: z.string().min(1, "Label is required"),
  value: z.string().url("Must be a valid URL"),
});

const formSchema = z.object({
  telegram: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^https:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,}$/.test(value),
      {
        message:
          "Please provide a valid Telegram URL (e.g., https://t.me/username)",
      }
    ),
  twitter: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^https:\/\/(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}$/.test(value),
      {
        message:
          "Please provide a valid Twitter/X URL (e.g., https://twitter.com/username)",
      }
    ),
  website: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(value),
      {
        message: "Please provide a valid URL",
      }
    ),
  customLinks: z.array(customLinkSchema),
  description: z.string().min(1, "Description is required"),
  paymentToken: z.string(),
  logo: z.string(),
  cover: z.string(),
});

type FormData = z.infer<typeof formSchema>;

const MotionCard = motion(Card);

export default function EnhanceTokenMetadata() {
  const { token } = useToken();
  console.log("Token", token);
  const [paymentToken, setPaymentToken] = useState(PAYMENT_TOKENS[0].value);
  const userAddress = useActiveAddress();
  const navigate = useNavigate();

  const socials = Array.isArray(token.SocialLinks)
    ? token.SocialLinks
    : (Object.entries(token.SocialLinks).map(([key, value]) => ({
        key,
        value,
      })) as { key: string; value: string }[]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      twitter: socials.find((link) => link.key === "Twitter")?.value,
      telegram: socials.find((link) => link.key === "Telegram")?.value,
      website: socials.find((link) => link.key === "Website")?.value,
      customLinks: socials.filter(
        (link) => !["Twitter", "Telegram", "Website"].includes(link.key)
      ),
      description: token.Description,
      paymentToken: PAYMENT_TOKENS[0].value,
      logo: token.Logo,
      cover: token.CoverImage,
    },
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "customLinks",
  });

  const watchPaymentToken = watch("paymentToken");

  const paymentTokenDetails = PAYMENT_TOKENS.find(
    (token) => token.value === watchPaymentToken
  );

  const {
    data: paymentTokenPrice,
    isLoading: isPaymentTokenPriceLoading,
    isRefetching: isPaymentTokenRefetching,
  } = useHopperPrice(watchPaymentToken);

  const { data: paymentTokenBalance } = useTokenBalance(watchPaymentToken);

  const totalPriceReal = paymentTokenPrice
    ? METADATA_UPDATE_USD_PRICE * paymentTokenPrice
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

  const {
    isPending: isPendingMutation,
    mutateAsync,
    isError,
    error,
  } = useMutation({
    mutationKey: ["update-token-metadata", token.TokenProcess],
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      console.log("Values", values);
      console.log("Payment token price", paymentTokenPrice);

      const updateTokenMsgId = await message({
        process: paymentToken,
        tags: [
          {
            name: "Action",
            value: "Transfer",
          },
          {
            name: "Recipient",
            value: DEXI_AMM_MONITOR,
          },
          {
            name: "Quantity",
            value: parseUnits(
              totalPrice.toString(),
              paymentTokenDetails?.denomination || 18
            ).toString(),
          },
          {
            name: "Sender",
            value: userAddress as string,
          },
          {
            name: "X-Action",
            value: "Update-Token-Profile",
          },
          {
            name: "X-Token-Process",
            value: token.TokenProcess,
          },
          {
            name: "X-Details",
            value: JSON.stringify({
              SocialLinks: [
                {
                  key: "Twitter",
                  value: values.twitter,
                },
                {
                  key: "Telegram",
                  value: values.telegram,
                },
                {
                  key: "Website",
                  value: values.website,
                },
                ...values.customLinks,
              ],
              Description: values.description,
              CoverImage: values.cover,
              Logo: values.logo,
            }),
          },
        ],
        signer: createDataItemSigner(window.arweaveWallet),
      });

      const messageResult = await result({
        // the arweave TXID of the message
        message: updateTokenMsgId,
        // the arweave TXID of the process
        process: paymentToken,
      });

      console.log("Message Result", messageResult);
    },
    onSuccess: () => {
      toast.success("Token metadata updated successfully!");

      return navigate({
        to: "/token/$tokenId",
        params: {
          tokenId: token.TokenProcess,
        },
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
    await mutateAsync(data);
  };

  return (
    <div className="w-full space-y-8 bg-gradient-to-b from-purple-600 via-indigo-600 via-15% to-slate-950 to-40% text-white rounded-3xl pt-12">
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent border-0 mb-12"
      >
        <CardHeader className="text-center mb-12">
          <CardTitle className="text-5xl font-bold">
            Boost <TickerDisplay>{token.Ticker}</TickerDisplay>'s Potential
          </CardTitle>
          <CardDescription className="text-purple-100 text-lg">
            Enhance your metadata and watch your project soar!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <TrendingUp className="w-12 h-12 mb-2" />
              <h3 className="text-xl font-semibold">Increase Visibility</h3>
              <p className="text-purple-100">
                Stand out in the crowded market and attract more investors.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <Shield className="w-12 h-12 mb-2" />
              <h3 className="text-xl font-semibold">Build Trust</h3>
              <p className="text-purple-100">
                Showcase your project's legitimacy and professionalism.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <Search className="w-12 h-12 mb-2" />
              <h3 className="text-xl font-semibold">Improve Discoverability</h3>
              <p className="text-purple-100">
                Make it easier for potential investors to find and understand
                your token.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </MotionCard>

      <Card id="enhance-form" className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Enhance Token Metadata</CardTitle>
          <CardDescription>
            Update your token's metadata to increase visibility and credibility
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="twitter">Twitter Link</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/youraccount"
                    {...register("twitter")}
                  />
                  {errors.twitter && (
                    <p className="text-red-500">{errors.twitter.message}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="telegram">Telegram Link</Label>
                  <Input
                    id="telegram"
                    placeholder="https://t.me/youraccount"
                    {...register("telegram")}
                  />
                  {errors.telegram && (
                    <p className="text-red-500">{errors.telegram.message}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="website">Website Link</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    {...register("website")}
                  />
                  {errors.website && (
                    <p className="text-red-500">{errors.website.message}</p>
                  )}
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Custom Links</Label>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-[1fr,2fr,auto] gap-2 items-center mb-2"
                    >
                      <Input
                        placeholder="Label"
                        {...register(`customLinks.${index}.key`)}
                        aria-label="Custom link label"
                      />
                      <Input
                        placeholder="https://custom.com"
                        {...register(`customLinks.${index}.value`)}
                        aria-label="Custom link URL"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove custom link</span>
                      </Button>
                    </div>
                  ))}
                  {errors.customLinks && (
                    <p className="text-red-500">Invalid custom links</p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ key: "", value: "" })}
                    className="mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Custom Link
                  </Button>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo</FormLabel>
                        <FormControl>
                          <UploadLogoForm
                            handleUploadLogo={(txid) => {
                              field.onChange(txid);
                            }}
                            currentLogo={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={control}
                    name="cover"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <UploadLogoForm
                            handleUploadLogo={(txid) => {
                              field.onChange(txid);
                            }}
                            currentLogo={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Token Description</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="description"
                        placeholder="Describe your token..."
                        {...field}
                      />
                    )}
                  />
                  {errors.description && (
                    <p className="text-red-500">{errors.description.message}</p>
                  )}
                </div>
                <div className="mt-12 space-y-12">
                  <div className="flex flex-col items-center gap-2">
                    <Label>Update Metadata Price</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold font-mono">
                        {METADATA_UPDATE_USD_PRICE}
                      </span>
                      <span className="text-lg text-gray-500">USD</span>
                    </div>

                    <p className="text-purple-300/50">
                      Price will be converted to the selected payment token.
                    </p>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <Label>Payment Token</Label>
                    <Controller
                      name="paymentToken"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(ev) => {
                            field.onChange(ev);
                            setPaymentToken(ev);
                          }}
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
                      )}
                    />
                    <PaymentTokenInfoBox
                      token={form.getValues("paymentToken")}
                    />
                  </div>

                  <Alert className="space-y-4 border-violet-500 bg-violet-500/20 text-violet-300 text-lg flex flex-col items-center gap-2">
                    Price in {paymentTokenDetails?.label}
                    {isPaymentTokenPriceLoading || isPaymentTokenRefetching ? (
                      <div>
                        <LoaderIcon className="animate-spin" />
                      </div>
                    ) : (
                      <span className="text-2xl font-bold font-mono">
                        {totalPrice.toFixed(3)} {paymentTokenDetails?.label}
                      </span>
                    )}
                  </Alert>
                  <div className="flex justify-between">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={
                          !hasEnoughPaymentTokenBalance ||
                          isPaymentTokenPriceLoading ||
                          isPaymentTokenRefetching ||
                          isPendingMutation
                        }
                      >
                        {hasEnoughPaymentTokenBalance
                          ? `Pay ${totalPrice.toFixed(3)} ${
                              paymentTokenDetails?.label
                            } and Update`
                          : "Insufficient Balance"}
                      </Button>
                    </motion.div>
                  </div>
                  {isError && error ? (
                    <Alert className="text-red-500">{error.message}</Alert>
                  ) : null}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
