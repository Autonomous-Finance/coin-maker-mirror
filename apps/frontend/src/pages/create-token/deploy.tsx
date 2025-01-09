import DeployTokenForm from "@/components/app/create-token/deploy-token-form";
import { type Step, StepsLoadingProvider } from "@/context/steps-loading";

export default function CreateTokenDeploy() {
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

  return (
    <StepsLoadingProvider initialSteps={deploySteps}>
      <DeployTokenForm />
    </StepsLoadingProvider>
  );
}
