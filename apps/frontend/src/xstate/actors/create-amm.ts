import {
  AMM_FACTORY_PROCESS,
  DEXI_AMM_MONITOR,
  DEXI_TOKEN_PROCESS,
} from "@/config";
import type { Tag } from "@/types";
import {
  createDataItemSigner,
  message,
  result,
} from "@permaweb/aoconnect";
import { dryrun } from "@/lib/ao-connection";
import { fromPromise } from "xstate";

type SpawnAMMInput = {
  tokenA: string;
  tokenB: string;
  dexiRegister: boolean;
};

type SpawnAMMOutput = {
  raw: unknown;
  result: {
    skip: boolean;
    value: string;
  };
};

const handleSpawnAMMProcess = fromPromise<SpawnAMMOutput, SpawnAMMInput>(
  async ({ input }) => {
    const result = await dryrun({
      process: AMM_FACTORY_PROCESS,
      tags: [
        { name: "Action", value: "Get-Pool" },
        { name: "Token-A", value: input.tokenA },
        { name: "Token-B", value: input.tokenB },
      ],
    });

    console.log("factory check response", result)

    if (result.Messages.length) {
      const firstMessage = result.Messages[0];

      const ammProcess = firstMessage.Tags.find(
        (tag: Tag) => tag.name === "Pool-Id"
      );

      if (
        ammProcess &&
        ammProcess.value !== "" &&
        ammProcess.value !== "pending"
      ) {
        return { result: { skip: true, value: ammProcess.value }, raw: result };
      }
    }

    const tags = [
      { name: "Action", value: "Add-Pool" },
      { name: "Token-A", value: input.tokenA },
      { name: "Token-B", value: input.tokenB },
    ];

    /* if (input.dexiRegister) {
      tags.push({ name: "User-Will-Subscribe", value: "true" });
    } */

    const spawnAMMProcessMsgId = await message({
      process: AMM_FACTORY_PROCESS,
      tags,
      signer: createDataItemSigner(window.arweaveWallet),
    });

    return {
      raw: spawnAMMProcessMsgId,
      result: {
        skip: false,
        value: spawnAMMProcessMsgId,
      },
    };
  }
);

type GetSpawnResponseInput = {
  messageId: string;
};

type GetSpawnResponseOutput = {
  raw: unknown;
  result: string;
};

const handleGetSpawnResponse = fromPromise<
  GetSpawnResponseOutput,
  GetSpawnResponseInput
>(async ({ input }) => {
  const messageResult = await result({
    process: AMM_FACTORY_PROCESS,
    message: input.messageId,
  });

  if (messageResult.Error) {
    throw new Error(JSON.stringify(messageResult.Error));
  }

  return {
    raw: messageResult,
    result: JSON.stringify(messageResult.Messages),
  };
});

type GetAMMProcessIdInput = {
  tokenA: string;
  tokenB: string;
};

type GetAMMProcessIdOutput = {
  raw: unknown;
  result: string;
};

const handleGetAMMProcessId = fromPromise<
  GetAMMProcessIdOutput,
  GetAMMProcessIdInput
>(async ({ input }) => {
  const result = await dryrun({
    process: AMM_FACTORY_PROCESS,
    tags: [
      { name: "Action", value: "Get-Pool" },
      { name: "Token-A", value: input.tokenA },
      { name: "Token-B", value: input.tokenB },
    ],
  });

  if (result.Messages.length) {
    const firstMessage = result.Messages[0];

    const ammProcess = firstMessage.Tags.find(
      (tag: Tag) => tag.name === "Pool-Id"
    );

    if (
      ammProcess &&
      ammProcess.value !== "" &&
      ammProcess.value !== "pending"
    ) {
      return { result: ammProcess.value, raw: result };
    }

    throw new Error("AMM process ID not found");
  }

  throw new Error("AMM process ID not found");
});

type TestAMMInitInput = {
  processId: string;
};

type TestAMMInitOutput = {
  raw: unknown;
  result: string;
};

const handleTestAMMInit = fromPromise<TestAMMInitOutput, TestAMMInitInput>(
  async ({ input }) => {
    const result = await dryrun({
      process: input.processId,
      tags: [{ name: "Action", value: "Info" }],
    });

    if (result.Messages?.length) {
      const firstMessage = result.Messages[0];

      const tickerTag = firstMessage.Tags.find(
        (tag: Tag) => tag.name === "Ticker"
      );

      if (tickerTag && tickerTag.value !== "") {
        return { result: tickerTag.value, raw: result };
      }

      throw new Error("Ticker tag not found");
    }

    throw new Error("Ticker tag not found");
  }
);

type ProvideLiquidityInput = {
  poolId: string;
  token: string;
  amount: string;
};

type ProvideLiquidityOutput = {
  raw: unknown;
  result: string;
};

const handleProvideLiquidity = fromPromise<
  ProvideLiquidityOutput,
  ProvideLiquidityInput
>(async ({ input }) => {
  const provideLiquidityMsgId = await message({
    process: input.token,
    tags: [
      { name: "Action", value: "Transfer" },
      { name: "Recipient", value: input.poolId },
      {
        name: "Quantity",
        value: input.amount,
      },
      { name: "X-Action", value: "Provide" },
      { name: "X-Slippage-Tolerance", value: "1" },
    ],
    data: "",
    signer: createDataItemSigner(window.arweaveWallet),
  });

  const provideLiquidityMessageResult = await result({
    process: input.token,
    message: provideLiquidityMsgId,
  });

  return {
    raw: provideLiquidityMessageResult,
    result: provideLiquidityMsgId,
  };
});

type TestLiquidityPoolInput = {
  messageId: string;
};

type TestLiquidityPoolOutput = {
  raw: unknown;
  result: string;
};

const handleTestLiquidityPool = fromPromise<
  TestLiquidityPoolOutput,
  TestLiquidityPoolInput
>(async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ result: "OK", raw: null });
    }, 2000);
  });
});

type SubscribeDexiInput = {
  poolId: string;
  dexiPaymentToken: string;
  dexiPaymentTokenValue: string;
};

type SubscribeDexiOutput = {
  raw: unknown;
  result: string;
};

const handleSubscribeDEXI = fromPromise<
  SubscribeDexiOutput,
  SubscribeDexiInput
>(async ({ input }) => {
  const subscribeMsgId = await message({
    process: input.dexiPaymentToken,
    tags: [
      { name: "Action", value: "Transfer" },
      {
        name: "Quantity",
        value: input.dexiPaymentTokenValue,
      },
      {
        name: "Recipient",
        value: DEXI_AMM_MONITOR,
      },
      {
        name: "X-Action",
        value: "Activate-AMM",
      },
      {
        name: "X-AMM-Process",
        value: input.poolId,
      },
    ],
    data: "",
    signer: createDataItemSigner(window.arweaveWallet),
  });
  const provideLiquidityMessageResult = await result({
    process: DEXI_TOKEN_PROCESS,
    message: subscribeMsgId,
  });

  return {
    raw: provideLiquidityMessageResult,
    result: subscribeMsgId,
  };
});

type TestDexiInput = {
  poolId: string;
};

type TestDexiOutput = {
  raw: unknown;
  result: string;
};

const handleTestDEXISubscription = fromPromise<TestDexiOutput, TestDexiInput>(
  async ({ input }) => {
    const messageResult = await dryrun({
      process: DEXI_AMM_MONITOR,
      tags: [
        {
          name: "Action",
          value: "Get-AMM-Registration-Status",
        },
        {
          name: "Process-Id",
          value: input.poolId,
        },
      ],
    });

    if (messageResult.Error) {
      throw new Error(messageResult.Error);
    }

    if (messageResult.Messages[0].Tags) {
      const Status = messageResult.Messages[0].Tags.find(
        (tag: Tag) => tag.name === "Status"
      );

      if (!Status) {
        throw new Error("Status not found in the response.");
      }

      return {
        raw: messageResult,
        result: Status.value,
      };
    }

    throw new Error("Error fetching data.");
  }
);

export {
  handleGetAMMProcessId,
  handleGetSpawnResponse,
  handleProvideLiquidity,
  handleSpawnAMMProcess,
  handleSubscribeDEXI,
  handleTestAMMInit,
  handleTestDEXISubscription,
  handleTestLiquidityPool,
};
