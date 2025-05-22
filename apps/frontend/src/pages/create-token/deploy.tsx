import DeployTokenForm from "@/components/app/create-token/deploy-token-form";
import { type Step, StepsLoadingProvider } from "@/context/steps-loading";
import { useCreateToken } from "@/hooks/use-create-token";

export default function CreateTokenDeploy() {
  const { token } = useCreateToken();

  const deploySteps: Step[] = [
    {
      id: 1,
      label: "Spawning new process with token blueprint",
      status: "pending",
    },
    {
      id: 2,
      label: "Confirming process initialization",
      status: "pending",
    },
  ];

  if (token.WhitelistModule) {
    deploySteps.push({
      id: 3,
      label: "Installing whitelist module",
      status: "pending",
    });
  }

  return (
    <StepsLoadingProvider initialSteps={deploySteps}>
      <DeployTokenForm />
    </StepsLoadingProvider>
  );
}
