import SignIn from "@/components/app/sign-in";
import { useConnection } from "arweave-wallet-kit";

export default function Authenticated({
  children,
}: { children: React.ReactNode }) {
  const { connected } = useConnection();

  if (!connected) {
    return <SignIn />;
  }

  return <>{children}</>;
}
