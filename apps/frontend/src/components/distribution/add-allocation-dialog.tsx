import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateToken } from "@/hooks/use-create-token";
import { useDistribution } from "@/hooks/use-distribution";
import { formatUnits, parseUnits } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import numbro from "numbro";
import { useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "../ui/alert";

export function AddAllocationDialog({ disabled }: { disabled?: boolean }) {
  const { allocations, addAllocation, totalSupply } = useDistribution();
  const [open, setOpen] = useState(false);
  const { token } = useCreateToken();

  // total allocated is the sum of all allocations minus the liquidity pool
  const totalAllocated = allocations.reduce(
    (acc, cur) => acc + BigInt(cur.amount),
    BigInt(0)
  );
  const unallocated = BigInt(totalSupply) - totalAllocated;
  const unallocatedAsPercentage = (unallocated * 100n) / BigInt(totalSupply);

  const normaliedTotalSupply = formatUnits(
    BigInt(totalSupply),
    token.Denomination
  );

  const canAddMore = unallocated > 0n;

  const AddAllocationDialogSchema = z.object({
    address: z.string().min(1),
    amount: z
      .number()
      .max(Number(formatUnits(unallocated, token.Denomination))),
    amountPercentage: z.number().min(0).max(Number(unallocatedAsPercentage)),
    vested: z.number().min(0).int(),
  });

  const form = useForm<z.infer<typeof AddAllocationDialogSchema>>({
    resolver: zodResolver(AddAllocationDialogSchema),
    defaultValues: {
      address: "",
      amount: Number(formatUnits(unallocated, token.Denomination)),
      amountPercentage: Number(unallocatedAsPercentage),
      vested: 0,
    },
  });

  function onSubmit(values: z.infer<typeof AddAllocationDialogSchema>) {
    // Add the allocation
    addAllocation(values.address, values.amount.toString(), values.vested);

    // Show a success toast
    toast.success("Allocation added successfully", {
      description: `Added ${values.amount} to ${values.address}`,
    });

    form.reset({
      address: "",
      amount: 0,
      amountPercentage: 0,
      vested: 0,
    });

    // Close the dialog
    setOpen(false);
  }

  const canSubmitAddAllocation =
    totalAllocated + BigInt(form.getValues("amount")) <= BigInt(totalSupply);

  const updateAmount = useCallback(
    (newAmount: number) => {
      const percentage =
        (BigInt(newAmount) * 100n) / BigInt(normaliedTotalSupply);

      form.setValue("amount", newAmount, { shouldValidate: true });
      form.setValue("amountPercentage", Number(percentage), {
        shouldValidate: true,
      });
    },
    [form, normaliedTotalSupply]
  );

  const updatePercentage = useCallback(
    (newPercentage: number) => {
      const amount = (BigInt(totalSupply) * BigInt(newPercentage)) / 100n;
      form.setValue("amountPercentage", newPercentage, {
        shouldValidate: true,
      });
      form.setValue("amount", Number(formatUnits(amount, token.Denomination)), {
        shouldValidate: true,
      });
    },
    [form, totalSupply, token.Denomination]
  );

  const percentages = [10, 25, 50, 75, 100];
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const watchedPercentage = useWatch({
    control: form.control,
    name: "amountPercentage",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={!canAddMore || disabled}>
          {!canAddMore
            ? "Nothing left to allocate, reduce current allocation first."
            : "Add Allocation"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form className="space-y-8">
            <DialogHeader>
              <DialogTitle>Add allocation</DialogTitle>
              <DialogDescription>
                Setup how your coin should be initially distributed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Alert className="border-purple-400">
                  <AlertDescription>
                    <span className="font-bold font-mono">
                      {numbro(
                        formatUnits(unallocated, token.Denomination)
                      ).format({
                        thousandSeparated: true,
                      })}{" "}
                      {token.Ticker}
                    </span>{" "}
                    available for this allocation.
                  </AlertDescription>
                </Alert>
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="address"
                        {...field}
                        className="col-span-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="flex flex-grow flex-col">
                      <FormLabel>
                        <div className="flex items-center">
                          <div className="text-sm">Amount</div>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="amount"
                          {...field}
                          className="col-span-3 w-full"
                          value={watchedAmount}
                          onChange={(event) => {
                            const newAmount = Number(event.target.value) || 0;
                            updateAmount(newAmount);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amountPercentage"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        <div className="flex items-center justify-end">
                          <div className="text-sm">%</div>
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="percentage"
                          {...field}
                          className="col-span-3"
                          value={watchedPercentage}
                          onChange={(event) => {
                            const newPercentage =
                              Number(event.target.value) || 0;
                            updatePercentage(newPercentage);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex space-x-2 justify-between">
                {percentages.map((percentage) => (
                  <Button
                    type="button"
                    key={percentage}
                    variant={
                      watchedPercentage === percentage ? "default" : "outline"
                    }
                    onClick={() => updatePercentage(percentage)}
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={!canSubmitAddAllocation || disabled}
              >
                Add Allocation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
