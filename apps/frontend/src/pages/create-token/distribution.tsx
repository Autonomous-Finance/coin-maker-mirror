import DistributionForm from "@/components/app/create-token/distribution-form";
import { DistributionProvider } from "@/context/distribution-context";
import { useCreateToken } from "@/hooks/use-create-token";
import { parseUnits } from "@/lib/utils";
import { useActiveAddress } from "arweave-wallet-kit";

export default function CreateTokenDistribution() {
  const { token } = useCreateToken();
  const address = useActiveAddress();

  const totalSupply = parseUnits(
    token.TotalSupply,
    token.Denomination,
  ).toString();

  return (
    <DistributionProvider
      totalSupply={totalSupply}
      initialAllocations={[
        {
          address: address || "",
          amount: totalSupply,
          percentage: 100,
          vested: 0,
        },
      ]}
    >
      <DistributionForm />
    </DistributionProvider>
  );
}
