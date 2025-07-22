import CreateLiquidityPoolForm from "@/components/app/token/create-lp/form";
import { PAIR_TOKENS } from "@/config";
import { CreateLPProvider } from "@/context/create-lp";

export default function CreateLiquidityPoolPage() {
  return (
    <CreateLPProvider initialPairToken={PAIR_TOKENS[0]}>
      <div className="gap-12 rounded-none md:rounded-2xl shadow-input">
        <fieldset className="col-span-1 grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-lg font-bold">
            Create Liquidity Pool
          </legend>
          <div className="w-full mx-auto flex flex-col gap-6">
            <CreateLiquidityPoolForm />
          </div>
        </fieldset>
      </div>
    </CreateLPProvider>
  );
}
