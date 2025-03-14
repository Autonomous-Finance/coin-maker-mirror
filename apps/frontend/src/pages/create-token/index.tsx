import { UploadLogoForm } from "@/components/app/upload-logo-form";
import ArweaveImage from "@/components/cryptoui/arweave-image";
import { CurrencyDisplayInside } from "@/components/cryptoui/currency-display";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCreateToken } from "@/hooks/use-create-token";
import { cn, parseUnits } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import {
  ChevronRight,
  FileQuestionIcon,
  InfoIcon,
  ShieldQuestionIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { QuestionMarkIcon } from "@radix-ui/react-icons";

export default function CreateTokenIndex() {
  const { token, setToken } = useCreateToken();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userAddress = useActiveAddress();
  const { connect } = useConnection();
  const [isCustomSupply, setIsCustomSupply] = useState(false);

  const formSchema = z.object({
    Name: z.string().min(2).max(40),
    Ticker: z
      .string()
      .min(1, "Ticker must be at least 1 character long")
      .max(8, "Ticker cannot exceed 8 characters")
      .regex(
        /^[A-Za-z0-9-]+$/,
        "Ticker can only contain letters, numbers, and hyphens"
      )
      .transform((val) => val.toUpperCase()),
    Denomination: z.number().int().min(1).max(18),
    TotalSupply: z.string().min(1),
    Description: z
      .string()
      .max(240, "Description cannot exceed 240 characters"),
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
      });

      navigate({
        to: "/create-token/social-media",
      });

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
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coin Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Test Token" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                {/*                 <FormField
                  control={form.control}
                  name="Denomination"
                  render={() => (
                    <FormItem>
                      <FormLabel>Denomination</FormLabel>
                      <div className="flex items-center h-[44px] font-mono text-muted-foregrounds">
                        {form.getValues("Denomination")} decimals
                      </div>
                    </FormItem>
                  )}
                /> */}

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
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(BigInt(value || "0").toString());
                              setIsCustomSupply(true);
                            }}
                            className="relative w-full"
                          />
                          <Select
                            value={isCustomSupply ? "custom" : field.value}
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setIsCustomSupply(true);
                              } else {
                                setIsCustomSupply(false);
                                form.setValue("TotalSupply", value);
                              }
                            }}
                          >
                            <SelectTrigger className="absolute top-1/2 -translate-y-1/2 right-1 w-[180px]">
                              <SelectValue placeholder="Select Supply" />
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
                                <SelectItem value="custom">
                                  {isCustomSupply ? field.value : "Custom"}
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
              <div className="space-y-4">
                <FormLabel>Addons</FormLabel>
                <FormField
                  control={form.control}
                  name="RenounceOwnership"
                  render={({ field }) => (
                    <FormItem
                      className={cn(
                        "flex flex-row items-center justify-between rounded-lg border p-4",
                        form.getValues("RenounceOwnership")
                          ? "bg-purple-600/30 border-purple-600/80"
                          : "bg-purple-700/10 border-purple-600/20"
                      )}
                    >
                      <div>
                        <FormLabel className="text-base flex items-center mb-2 gap-1 text-purple-300">
                          <ShieldQuestionIcon size="20" />
                          Renounce Ownership
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger>
                            <div className="text-sm text-muted-foreground flex items-center gap-1 underline underline-offset-2 text-purple-300">
                              What does this mean?
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[450px] space-y-2">
                            <p>
                              By renouncing ownership, you make the core aspects
                              of the token, like{" "}
                              <b>
                                total supply and ownership, permanently fixed
                              </b>
                              , which increases trust.
                            </p>
                            <p>
                              You don&apos;t have to do this immediately; it can
                              be done later when you're ready.
                            </p>
                            <p>
                              However, once renounced, you can still update
                              non-essential details, such as the token's website
                              or description. At the same time, the fundamental
                              properties of the asset remain locked and
                              unchangeable.
                            </p>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
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
              {userAddress ? (
                <Button
                  type="submit"
                  className="flex flex-grow items-center gap-2"
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
              ) : (
                <Button
                  type="button"
                  className="flex flex-grow item-center gap-2"
                  onClick={() => connect()}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
