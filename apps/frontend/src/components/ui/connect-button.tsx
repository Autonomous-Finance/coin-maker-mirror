import {
  ConnectButton as ArweaveConnectButton,
  useConnection,
} from "arweave-wallet-kit";
import { Button } from "./button";
import ShineBorder from "./shine-border";

export function ConnectButtonFancy() {
  const { connect } = useConnection();

  async function handleConnect() {
    await connect();
  }

  return (
    <Button
      className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
      onClick={() => handleConnect()}
    >
      <ShineBorder
        className="text-center text-2xl font-bold capitalize"
        color={["#2B14C8", "#98C4D3", "#4B0885"]}
      >
        Connect your wallet
      </ShineBorder>
    </Button>
  );
}

export default function ConnectButton() {
  return (
    <div>
      <ArweaveConnectButton profileModal={true} showBalance={true} />
    </div>
  );
}
