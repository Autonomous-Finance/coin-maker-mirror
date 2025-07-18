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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateToken } from "@/hooks/use-create-token";
import { useDistribution } from "@/hooks/use-distribution";
import { formatUnits } from "@/lib/utils";
import type { Allocation } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";
import { useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "../ui/alert";
import numbro from "numbro";

export function EditAllocationDialog({
  disabled,
  allocation,
}: {
  disabled?: boolean;
  allocation: Allocation;
}) {
  const { allocations, totalSupply, editAllocation } = useDistribution();
  const [open, setOpen] = useState(false);
  const { token } = useCreateToken();

  const totalAllocated = allocations.reduce(
    (acc, cur) => acc + BigInt(cur.amount),
    BigInt(0)
  );
  const availableForEdit =
    BigInt(totalSupply) - totalAllocated + BigInt(allocation.amount);
  const availableForEditPercentage =
    (availableForEdit * 100n) / BigInt(totalSupply);

  const normaliedTotalSupply = formatUnits(
    BigInt(availableForEdit),
    token.Denomination
  );

  const EditAllocationDialogSchema = z.object({
    address: z.string().min(1),
    amount: z
      .number()
      .max(Number(formatUnits(availableForEdit, token.Denomination))),
    amountPercentage: z.number().min(0).max(Number(availableForEditPercentage)),
    vested: z.number().min(0).int(),
  });

  const form = useForm<z.infer<typeof EditAllocationDialogSchema>>({
    resolver: zodResolver(EditAllocationDialogSchema),
    defaultValues: {
      address: allocation.address,
      amount: Number(
        formatUnits(BigInt(allocation.amount), token.Denomination)
      ),
      amountPercentage: Number(
        (BigInt(allocation.amount) * 100n) / BigInt(totalSupply)
      ),
      vested: allocation.vested,
    },
  });

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

  function onSubmit(values: z.infer<typeof EditAllocationDialogSchema>) {
    editAllocation(values.address, values.amount.toString(), values.vested);

    toast.success("Allocation edited successfully", {
      description: `Updated allocation for ${values.address}`,
    });

    setOpen(false);
  }

  const canSubmitEditAllocation =
    totalAllocated -
      BigInt(allocation.amount) +
      BigInt(form.getValues("amount")) <=
    BigInt(totalSupply);

  const percentages = [10, 25, 50, 75, 100];
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const watchedPercentage = useWatch({
    control: form.control,
    name: "amountPercentage",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="px-1" disabled={disabled}>
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form className="space-y-8">
            <DialogHeader>
              <DialogTitle>Edit allocation</DialogTitle>
              <DialogDescription>
                Modify the allocation for this address.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <Alert className="border-purple-400">
                  <AlertDescription>
                    <span className="font-bold font-mono">
                      {numbro(
                        formatUnits(availableForEdit, token.Denomination)
                      ).format({
                        thousandSeparated: true,
                      })}{" "}
                      {token.Ticker}
                    </span>{" "}
                    available to edit this allocation.
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
                        disabled
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
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="amount"
                          {...field}
                          value={watchedAmount}
                          className="col-span-3 w-full"
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
                      <FormLabel>%</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="percentage"
                          {...field}
                          value={watchedPercentage}
                          className="col-span-3"
                          min={0}
                          max={100}
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
                disabled={!canSubmitEditAllocation || disabled}
              >
                Update Allocation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
