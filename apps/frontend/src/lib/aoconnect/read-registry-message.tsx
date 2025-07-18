import ENV from "@/env";
import { result } from "@permaweb/aoconnect";

const readRegistryMessage = async ({ messageId }: { messageId: string }) => {
  const messageResult = await result({
    // the arweave TXID of the message
    message: messageId,
    // the arweave TXID of the process
    process: ENV.VITE_TOKEN_FACTORY_PROCESS,
  });

  return messageResult;
};

export default readRegistryMessage;
