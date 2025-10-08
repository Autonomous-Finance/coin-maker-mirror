import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn, parseUnits } from "@/lib/utils";
import { toast } from "sonner";
import { CurrencyDisplayInside } from "../cryptoui/currency-display";

import { useCreateBondingCurve } from "@/hooks/use-create-bonding-curve";
import Slider from "../ui/slider";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Label } from "../ui/label";

export const BONDING_CURVE_DENOMINATION = 18
export const QUOTE_TOKEN_DENOMINATION = 12
export const BONDING_CURVE_TICKER = "xCOIN"
export const QUOTE_TOKEN_TICKER = "qAR"

export const FORMULA_TEXT = `Price = m * (supply ^ n)`

export const QAR_PROCESS_ID = "NG-0lVX882MG5nhARrSzyprEK6ejonHpdUmaaMPsHE8"

export default function CreateBondingCurveForm() {
  const { curve, curveDerived, setCurve, setCurveForCode, quoteTokenPrice } = useCreateBondingCurve();

  const formSchema = z.object({
    targetMCap: z.number().min(1000).max(10000),
    targetSupply: z.number().min(1000).max(1000000),
    curveRR: z.number().min(0.15).max(0.5),
    curveFee: z.number().min(0).max(5),
    lpTokensToBurn: z.number().min(0).max(100),
    platformAccount: z.string().length(43),
    supplyToken: z.string().length(43),
    supplyTokenTicker: z.string().min(3),
    supplyTokenDenomination: z.number().min(3).max(18),
  });

  async function onChange(event: React.ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = form.getValues();

    // Set new token values
    setCurve({
      ...curve,
      ...values,
      targetMCap: values.targetMCap,
      curveRR: values.curveRR,
      curveFee: values.curveFee,
      lpTokensToBurn: values.lpTokensToBurn,
      devAccount: values.platformAccount,
      supplyToken: values.supplyToken,
      supplyTokenTicker: values.supplyTokenTicker,
      supplyTokenDenomination: values.supplyTokenDenomination,
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Set new token values
      const newCurve = {
        ...curve,
        ...values,
        targetMCap: values.targetMCap,
        curveRR: values.curveRR,
        curveFee: values.curveFee,
        lpTokensToBurn: values.lpTokensToBurn,
        devAccount: values.platformAccount,
        supplyToken: values.supplyToken,
        supplyTokenTicker: values.supplyTokenTicker,
        supplyTokenDenomination: values.supplyTokenDenomination,
      }
      setCurve(newCurve);
      setCurveForCode(newCurve);
    } catch (error) {
      console.error(error);
      toast.error("🚫 Inputs contain errors", {
        description:
          "An error occurred while validating your inputs. Please check them and retry.",
      });
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...curve,
    },
  });


  const hasDecimals = (value: number) => {
    return value.toString().includes('.')
  }


  const hasMoreThanTwoDecimals = (value: number) => {
    return value.toString().includes('.') && value.toString().split('.')[1].length > 2
  }

  return (
    <Form {...form}>
      <form onChange={onChange} onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
        <div className="w-full mx-auto rounded-none md:rounded-2xl shadow-input col-span-2 space-y-12">
          <fieldset className="grid gap-6 rounded-lg border p-6">
            <legend className="-ml-1 px-1 text-lg font-bold">
              Bonding Curve Settings
            </legend>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="targetMCap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span>Target Market Cap (qAR)</span>
                        <Popover>
                            <PopoverTrigger>
                              <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] space-y-2">
                              <p>
                                The total market capitalization at which the bonding curve will migrate liquidity to the Botega DEX.
                              </p>
                            </PopoverContent>
                        </Popover>
                      </div>
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          <div className="font-mono flex items-end gap-2">
                            <CurrencyDisplayInside
                              amount={parseUnits(
                                field.value.toString() ?? "-",
                                QUOTE_TOKEN_DENOMINATION
                              ).toString()}
                              decimals={QUOTE_TOKEN_DENOMINATION}
                              ticker=""
                              noTicker={true}
                            />
                            <span className="text-muted-foreground text-xs">
                              * 10^{QUOTE_TOKEN_DENOMINATION}
                            </span>{" "}
                            {QUOTE_TOKEN_TICKER}
                          </div>
                        {quoteTokenPrice ? (
                          <div className="font-mono flex items-end gap-2 text-sm text-[#9B86FD]">
                            ~ {(field.value * quoteTokenPrice).toFixed(2)}
                            {" USD"}
                          </div>
                        ) : null}
                        </div>
                      ) : null}

                    </FormLabel>
                      <FormControl>
                        <div className="relative flex justify-between items-center gap-6">
                          <div className="flex-grow">
                            <Input
                              {...field}
                              type="number"
                              onChange={(event) => {
                                const val = Number.parseInt(event.target.value)
                                if (hasDecimals(val)) return
                                field.onChange(val)
                              }}
                              className="relative w-full"
                            />
                          </div>
                          <Slider
                            min={1000}
                            max={10000}
                            step = {1000}
                            value={[field.value]}
                            defaultValue={[1984]}
                            onValueChange={(value) => {
                              form.setValue("targetMCap", value[0])
                            }}
                          />
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
                name="targetSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span>Target Supply</span>
                        <Popover>
                            <PopoverTrigger>
                              <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] space-y-2">
                              <p>
                                The issued xCOIN supply at which the bonding curve will migrate liquidity to the Botega DEX.
                              </p>
                            </PopoverContent>
                        </Popover>
                      </div>
                      {field.value ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="font-mono flex items-end gap-2">
                            <CurrencyDisplayInside
                              amount={parseUnits(
                                field.value.toString() ?? "0",
                                BONDING_CURVE_DENOMINATION
                              ).toString()}
                              decimals={BONDING_CURVE_DENOMINATION}
                              ticker=""
                              noTicker={true}
                            />
                            <span className="text-muted-foreground text-xs">
                              * 10^{BONDING_CURVE_DENOMINATION}
                            </span>{" "}
                            {BONDING_CURVE_TICKER}
                          </div>
                        </div>
                      ) : null}

                    </FormLabel>
                      <FormControl>
                        <div className="relative flex justify-between items-center gap-6">
                          <div className="flex-grow">
                            <Input
                              {...field}
                              type="number"
                              onChange={(event) => {
                                const val = Number.parseInt(event.target.value)
                                if (hasDecimals(val)) return
                                field.onChange(val)
                              }}
                              className="relative w-full"
                            />
                          </div>
                          <Slider
                            min={1000}
                            max={1000000}
                            step = {1000}
                            value={[field.value]}
                            defaultValue={[5000]}
                            onValueChange={(value) => {
                              form.setValue("targetSupply", value[0])
                            }}
                          />
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
                name="curveRR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between gap-6">
                      <div className="flex-grow">
                        <span>Reserve Ratio (RR)</span>
                        <Popover>
                            <PopoverTrigger>
                              <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                            </PopoverTrigger>
                            <PopoverContent className="w-[640px] space-y-2">
                                <h4 className="text-xl font-bold">Reserve Ratio (0.15 – 0.5)</h4>

                                <p>
                                  The Reserve Ratio determines how the bonding curve progresses from flatter initial pricing to steeper price increases later on.
                                  Early buyers generally face lower volatility and can capture significant upside, while later buyers experience more pronounced price swings.
                                </p>

                                <ul className="list-disc pl-4">
                                  <li className="font-bold mt-2">Lower Ratio (0.15)</li>
                                  <ul className="list-decimal pl-4">
                                    <li>Starts relatively flat but becomes steep faster as more tokens are bought.</li>
                                    <li>Early participants enjoy lower volatility and higher upside potential.</li>
                                    <li>Later buyers may encounter bigger price jumps and greater unpredictability.</li>
                                  </ul>

                                  <li className="font-bold mt-4">Higher Ratio (0.5)</li>
                                  <ul className="list-decimal pl-4">
                                    <li>Price increases are more gradual, with a smoother progression overall.</li>
                                    <li>Volatility remains lower, and liquidity is generally stronger throughout.</li>
                                    <li>Potential upside is more modest compared to lower ratios.</li>
                                  </ul>
                                </ul>

                                <h5 className="text-lg font-bold">Pros & Cons</h5>
                                <ul className="list-disc pl-4">
                                  <li>Lower Ratios</li>
                                  <ul className="list-decimal pl-4">
                                    <li>Pros: Potential for higher returns (especially for early buyers).</li>
                                    <li>Cons: Greater volatility after the curve steepens, higher risk of sudden sell-offs.</li>
                                  </ul>
                                  <li className="mt-2">Higher Ratios</li>
                                  <ul className="list-decimal pl-4">
                                    <li>Pros: More predictable price changes, steadier liquidity, and less volatility.</li>
                                    <li>Cons: Slower growth potential and less dramatic upside.</li>
                                  </ul>
                                </ul>
                            </PopoverContent>
                        </Popover>
                      </div>
                      <div className="w-[254px] flex justify-between translate-y-6">
                        <span className="text-xs">Gradual</span>
                        <span className="text-xs">Linear</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex justify-between items-center gap-6">
                        <div className="flex-grow">
                          <Input
                            {...field}
                            type="number"
                            onChange={(event) => {
                              const val = Number.parseFloat(event.target.value)
                              if (hasMoreThanTwoDecimals(val)) return
                              field.onChange(val)
                            }}
                            className="relative w-full"
                          />
                        </div>
                          <Slider
                            className="translate-y-2.5"
                            min={0.15}
                            max={0.5}
                            step={0.05}
                            value={[field.value]}
                            defaultValue={[0.4]}
                            onValueChange={(value) => {
                              form.setValue("curveRR", value[0])
                            }}
                          />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="col-span-2">
                <Label>
                  <div className="flex items-center">
                    <span>Accumulated Liquidity</span>
                    <Popover>
                      <PopoverTrigger>
                        <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                      </PopoverTrigger>
                      <PopoverContent className="w-[450px] space-y-2">
                        <p>
                          How much qAR is accumulated in the curve reserve until curve reaches the target.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </Label>  
                <div className="py-1 font-mono text-[#9B86FD]">
                  {curveDerived?.targetLiquidity ? `${curveDerived?.targetLiquidity.toFixed(2)} qAR` : '--'}
                </div>
              </div>
              <div className="col-span-2 ml-auto">
                <Label>
                  <div className="flex items-center">
                    <span>Max. Curve Price</span>
                    <Popover>
                      <PopoverTrigger>
                        <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                      </PopoverTrigger>
                      <PopoverContent className="w-[450px] space-y-2">
                        <p>
                          The xCOIN price reached when the curve reaches its target.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </Label>  
                <div className="py-1 font-mono text-[#9B86FD] flex flex-col">
                  <span>{curveDerived?.targetPrice ? `1 xCOIN = ${curveDerived?.targetPrice.toFixed(4)} qAR`: '--'}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="curveFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span>Transaction Fees (%)</span>
                        <Popover>
                            <PopoverTrigger>
                              <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                            </PopoverTrigger>
                            <PopoverContent className="w-[450px] space-y-2">
                              <p>
                                The percentage of each buy/sell transaction collected as a fee. Displays potential minimum fee earnings below.
                              </p>
                            </PopoverContent>
                        </Popover>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex justify-between items-center gap-6">
                        <div className="flex-grow">
                          <Input
                            {...field}
                            type="number"
                            onChange={(event) => {
                              const val = Number.parseFloat(event.target.value)
                              if (hasMoreThanTwoDecimals(val)) return
                              field.onChange(val)
                            }}
                            className="relative w-full"
                          />
                        </div>
                        <Slider
                          min={0}
                          max={5}
                          step = {0.01}
                          value={[Number.parseFloat(field.value.toFixed(2))]}
                          defaultValue={[1]}
                          onValueChange={(value) => {
                            form.setValue("curveFee", value[0])
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="">
              <Label>
                <div className="flex items-center">
                  <span>Min. Accumulated Fees</span>
                  <Popover>
                    <PopoverTrigger>
                      <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] space-y-2">
                      <p>
                        The minimum amount of fees collected by the bonding curve.
                      </p>
                      <p>
                        This amount is obtained if the curve reaches its target without anyone selling back their tokens (only buyers).
                      </p>
                      <p>
                        Any back and forth in terms of selling and buying will increase the fees collected.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </Label>  
              <div className="py-1 font-mono text-[#9B86FD]">
                {curveDerived?.minFees == 0 || curveDerived?.minFees ? `${curveDerived?.minFees.toFixed(4)} qAR` : '--'}
              </div>
            </div>
          </fieldset>
        </div>
        <div className="w-full mx-auto rounded-none md:rounded-2xl shadow-input col-span-2 space-y-12 mt-2">
          <fieldset className="grid gap-6 rounded-lg border p-6">
            <legend className="-ml-1 px-1 text-lg font-bold">
              Integration Settings
            </legend>
            <div className="grid gap-6 grid-cols-4">
              <div className="col-span-4 text-sm border bg-[#27272A] px-4 py-2.5 rounded-lg flex items-center">
                  <span>📝 Your bonding curve implicitly uses</span>
                  <a
                    href={`https://www.ao.link/#/entity/${QAR_PROCESS_ID}`}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "link" }), "px-1 underline")}
                  >
                  <span className="font-mono text-[#9B86FD]">qAR</span>
                  </a>
                  <span>as a reserve token.</span>
                  <Popover>
                    <PopoverTrigger>
                      <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] space-y-2">
                      <p>
                        You can change this to any asset. We recommend a liquid asset like wAR or AO; however, we do not endorse any specific asset, and the final choice is entirely yours.
                      </p>
                    </PopoverContent>
                </Popover>
              </div>
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="supplyToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span>Curve token process</span>
                          <Popover>
                              <PopoverTrigger>
                                <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                              </PopoverTrigger>
                              <PopoverContent className="w-[450px] space-y-2">
                                <p>
                                  The process ID of your curve token (distributed via the bonding curve).
                                </p>
                              </PopoverContent>
                          </Popover>
                        </div>

                      </FormLabel>
                        <FormControl>
                          <div className="relative flex justify-between items-center gap-4">
                            <div className="flex-grow">
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter the token process ID"
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                                className="relative w-full"
                              />
                            </div>
                          </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* <div className="col-span-2">

              </div> */}
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="supplyTokenTicker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span>Curve token ticker</span>
                          <Popover>
                              <PopoverTrigger>
                                <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                              </PopoverTrigger>
                              <PopoverContent className="w-[450px] space-y-2">
                                <p>
                                  The ticker of your curve token.
                                </p>
                              </PopoverContent>
                          </Popover>
                        </div>

                      </FormLabel>
                        <FormControl>
                          <div className="relative flex justify-between items-center gap-4">
                            <div className="flex-grow">
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter the curve token ticker"
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                                className="relative w-full"
                              />
                            </div>
                          </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="supplyTokenDenomination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span>Curve token denomination</span>
                          <Popover>
                              <PopoverTrigger>
                                <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                              </PopoverTrigger>
                              <PopoverContent className="w-[450px] space-y-2">
                                <p>
                                  The denomination of your curve token.
                                </p>
                              </PopoverContent>
                          </Popover>
                        </div>

                      </FormLabel>
                        <FormControl>
                          <div className="relative flex justify-between items-center gap-4">
                            <div className="flex-grow">
                              <Input
                                {...field}
                                type="number"
                                onChange={(event) =>
                                  field.onChange(Number.parseInt(event.target.value))
                                }
                                className="relative w-full"
                              />
                            </div>
                          </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="platformAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span>Developer Account</span>
                          <Popover>
                              <PopoverTrigger>
                                <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                              </PopoverTrigger>
                              <PopoverContent className="w-[450px] space-y-2">
                                <p>
                                  The account that collects all trading fees and the unburned LP tokens.
                                </p>
                              </PopoverContent>
                          </Popover>
                        </div>

                      </FormLabel>
                        <FormControl>
                          <div className="relative flex justify-between items-center gap-4">
                            <div className="flex-grow">
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter your AO account"
                                onChange={(event) =>
                                  field.onChange(event.target.value)
                                }
                                className="relative w-full"
                              />
                            </div>
                          </div>
                        </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* <div className="col-span-2">
                
                </div> */}
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="lpTokensToBurn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span>LP Tokens Burn Ratio (%)</span>
                          <Popover>
                              <PopoverTrigger>
                                <QuestionMarkCircledIcon className="text-gray-200 mx-1"/>
                              </PopoverTrigger>
                              <PopoverContent className="w-[450px] space-y-2">
                                <p>
                                  Liquidity migration to the Botega DEX produces LP tokens, which the curve receives.
                                  Part of these tokens can be burned, in order to guarantee liquidity on Botega.
                                  Unburned tokens are sent to the platform wallet.
                                </p>
                              </PopoverContent>
                          </Popover>
                        </div>

                      </FormLabel>
                      <FormControl>
                        <div className="relative flex justify-between items-center gap-6">
                          <div className="flex-grow">
                            <Input
                              {...field}
                              type="number"
                              onChange={(event) => {
                                const val = Number.parseFloat(event.target.value)
                                if (hasMoreThanTwoDecimals(val)) return
                                field.onChange(val)
                              }}
                              className="relative w-full"
                            />
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step = {0.01}
                            value={[Number.parseFloat(field.value.toFixed(2))]}
                            defaultValue={[50]}
                            onValueChange={(value) => {
                              form.setValue("lpTokensToBurn", value[0])
                            }}
                          />
                        </div>
                    </FormControl>
                    <FormMessage />
                        
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </fieldset>
        </div>
        <div className="flex w-full flex-col space-between gap-2 mx-auto rounded-none md:rounded-2xl py-4 shadow-input">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex flex-grow items-center gap-2"
            onClick={() => {
              form.reset()
              setCurveForCode(undefined)
            }}
          >
            Reset
          </Button>
        </div>
        <div className="flex w-full flex-col space-between gap-2 mx-auto mt-auto rounded-none md:rounded-2xl shadow-input">
          <Button
            className="flex flex-grow items-center gap-2"
            type="submit"
            size="lg"
          >
              <>
                Generate Code
              </>
          </Button>
        </div>
      </form>
    </Form>
  );
}
