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

  deploySteps.push(
    {
      id: deploySteps.length + 1,
      label: "Sending token information",
      description: "Initializing token metadata",
      status: "pending",
    },
    {
      id: deploySteps.length + 2,
      label: "Setting up HyperBeam calls for token",
      description: "Configuring HyperBeam cron",
      status: "pending",
    }
  );

  return (
    <StepsLoadingProvider initialSteps={deploySteps}>
      <DeployTokenForm />
    </StepsLoadingProvider>
  );
}
