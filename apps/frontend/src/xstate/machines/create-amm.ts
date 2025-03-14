import { assign, log, setup } from "xstate";
import {
  handleGetAMMProcessId,
  handleGetSpawnResponse,
  handleProvideLiquidity,
  handleSpawnAMMProcess,
  handleSubscribeDEXI,
  handleTestAMMInit,
  handleTestDEXISubscription,
  handleTestLiquidityPool,
} from "../actors/create-amm";

const createAMMMachine = setup({
  types: {
    context: {} as {
      steps: {
        [key: string]: {
          enabled: boolean;
          label: string;
          status: string;
          raw?: string;
          result?: string;
          retries: number;
        };
      };
      error: string;
      ammProcessId: string;
      dexiRegister: boolean;
      dexiPaymentToken: string;
      dexiPaymentTokenValue: string;
      tokenA: string;
      tokenB: string;
      tokenAAmount: string;
      tokenBAmount: string;
    },
    children: {} as {
      handleSpawnAMMProcess: "handleSpawnAMMProcess";
      handleGetSpawnResponse: "handleGetSpawnResponse";
    },
  },
  actors: {
    handleSpawnAMMProcess,
    handleGetSpawnResponse,
    handleGetAMMProcessId,
    handleTestAMMInit,
    handleProvideLiquidity,
    handleTestLiquidityPool,
    handleSubscribeDEXI,
    handleTestDEXISubscription,
  },
}).createMachine({
  id: "createAMM",
  initial: "idle",
  context: {
    steps: {
      "spawn-amm-process": {
        enabled: true,
        label: "Spawn AMM Process",
        status: "pending",
        retries: 0,
      },
      "get-spawn-response": {
        enabled: true,
        label: "Get Spawn AMM Response",
        status: "pending",
        retries: 0,
      },
      "get-amm-process-id": {
        enabled: true,
        label: "Get AMM Process ID",
        status: "pending",
        retries: 0,
      },
      "test-amm-init": {
        enabled: true,
        label: "Test that AMM is initialized",
        status: "pending",
        retries: 0,
      },
      "test-dexi-subscription": {
        enabled: false,
        label: "Test AMM is Registered in DEXI",
        status: "pending",
        retries: 0,
      },
      "subscribe-dexi": {
        enabled: false,
        label: "Activate DEXI Subscription",
        status: "pending",
        retries: 0,
      },
      "provide-liquidity-tokenA": {
        enabled: true,
        label: "Provide Liquidity for first token",
        status: "pending",
        retries: 0,
      },
      "provide-liquidity-tokenB": {
        enabled: true,
        label: "Provide Liquidity for second token",
        status: "pending",
        retries: 0,
      },
      "test-liquidity-pool": {
        enabled: true,
        label: "Test that Liquidity Pool is set up",
        status: "pending",
        retries: 0,
      },
    },
    error: "",
    ammProcessId: "",
    dexiRegister: false,
    dexiPaymentToken: "",
    dexiPaymentTokenValue: "",
    tokenA: "",
    tokenB: "",
    tokenAAmount: "",
    tokenBAmount: "",
  },
  states: {
    idle: {
      on: {
        START: {
          target: "#running.spawn-amm-process",
          guard: ({ event }) =>
            event.tokenA &&
            event.tokenB &&
            event.tokenAAmount &&
            event.tokenBAmount,
          actions: [
            log("Starting AMM creation process"),
            assign({
              tokenA: ({ event }) => event.tokenA,
              tokenB: ({ event }) => event.tokenB,
              tokenAAmount: ({ event }) => event.tokenAAmount,
              tokenBAmount: ({ event }) => event.tokenBAmount,
              dexiRegister: ({ event }) => event.dexiRegister,
              dexiPaymentToken: ({ event }) => event.dexiPaymentToken,
              dexiPaymentTokenValue: ({ event }) => event.dexiPaymentTokenValue,
              steps: ({ context, event }) => {
                return {
                  ...context.steps,
                  "test-dexi-subscription": {
                    ...context.steps["test-dexi-subscription"],
                    enabled: event.dexiRegister,
                  },
                  "subscribe-dexi": {
                    ...context.steps["subscribe-dexi"],
                    enabled: event.dexiRegister,
                  },
                };
              },
            }),
          ],
        },
      },
    },
    running: {
      id: "running",
      initial: "spawn-amm-process",
      states: {
        "spawn-amm-process": {
          id: "spawn-amm-process",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "spawn-amm-process": {
                    ...context.steps["spawn-amm-process"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleSpawnAMMProcess",
                src: "handleSpawnAMMProcess",
                input: ({ context }) => ({
                  tokenA: context.tokenA,
                  tokenB: context.tokenB,
                  dexiRegister: context.dexiRegister,
                }),
                onDone: [
                  {
                    guard: ({ event }) => event.output.result.skip,
                    target: "#test-amm-init",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "spawn-amm-process": {
                            ...context.steps["spawn-amm-process"],
                            status: "done",
                            result: event.output.result.value,
                            raw: JSON.stringify(event.output.raw),
                            enabled: !event.output.result.skip,
                          },
                          "get-spawn-response": {
                            ...context.steps["get-spawn-response"],
                            status: "done",
                            result: event.output.result.value,
                            raw: JSON.stringify(event.output.raw),
                            enabled: !event.output.result.skip,
                          },
                          "get-amm-process-id": {
                            ...context.steps["get-amm-process-id"],
                            status: "done",
                            result: event.output.result.value,
                            raw: JSON.stringify(event.output.raw),
                            enabled: !event.output.result.skip,
                          },
                        }),
                      }),
                    ],
                  },
                  {
                    target: "#get-spawn-response",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "spawn-amm-process": {
                            ...context.steps["spawn-amm-process"],
                            status: "done",
                            result: event.output.result.value,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "failed",
                  actions: [
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "spawn-amm-process": {
                          ...context.steps["spawn-amm-process"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
            },
          },
        },
        "get-spawn-response": {
          id: "get-spawn-response",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "get-spawn-response": {
                    ...context.steps["get-spawn-response"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleGetSpawnResponse",
                src: "handleGetSpawnResponse",
                input: ({ context }) => ({
                  messageId: context.steps["spawn-amm-process"]
                    .result as string,
                }),
                onDone: [
                  {
                    target: "#get-amm-process-id",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "get-spawn-response": {
                            ...context.steps["get-spawn-response"],
                            status: "done",
                            result: "OK",
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "failed",
                  actions: [
                    ({ event }) => console.log("Failed", event),
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "get-spawn-response": {
                          ...context.steps["get-spawn-response"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
            },
          },
        },
        "get-amm-process-id": {
          id: "get-amm-process-id",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "get-amm-process-id": {
                    ...context.steps["get-amm-process-id"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleGetAMMProcessId",
                src: "handleGetAMMProcessId",
                input: ({ context }) => ({
                  tokenA: context.tokenA,
                  tokenB: context.tokenB,
                }),
                onDone: [
                  {
                    target: "#test-amm-init",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "get-amm-process-id": {
                            ...context.steps["get-amm-process-id"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "waiting",
                  actions: [
                    ({ event }) => console.log("Failed", event),
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "get-amm-process-id": {
                          ...context.steps["get-amm-process-id"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            waiting: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "get-amm-process-id": {
                    ...context.steps["get-amm-process-id"],
                    status: "current",
                  },
                }),
              }),
              after: {
                1500: {
                  target: "run",
                  actions: assign({
                    steps: ({ context }) => ({
                      ...context.steps,
                      "get-amm-process-id": {
                        ...context.steps["get-amm-process-id"],
                        retries:
                          context.steps["get-amm-process-id"].retries + 1,
                      },
                    }),
                  }),
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
              after: {
                1500: {
                  target: "run",
                  actions: assign({
                    steps: ({ context }) => ({
                      ...context.steps,
                      "get-amm-process-id": {
                        ...context.steps["get-amm-process-id"],
                        retries:
                          context.steps["get-amm-process-id"].retries + 1,
                      },
                    }),
                  }),
                },
              },
            },
          },
        },
        "test-amm-init": {
          id: "test-amm-init",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "test-amm-init": {
                    ...context.steps["test-amm-init"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleTestAMMInit",
                src: "handleTestAMMInit",
                input: ({ context }) => ({
                  processId: context.steps["get-amm-process-id"]
                    .result as string,
                }),
                onDone: [
                  {
                    guard: ({ context }) => context.dexiRegister,
                    target: "#test-dexi-subscription",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "test-amm-init": {
                            ...context.steps["test-amm-init"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                  {
                    target: "#provide-liquidity-tokenA",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "test-amm-init": {
                            ...context.steps["test-amm-init"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "waiting",
                  actions: [
                    ({ event }) => console.log("Failed", event),
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "test-amm-init": {
                          ...context.steps["test-amm-init"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            waiting: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "test-amm-init": {
                    ...context.steps["test-amm-init"],
                    status: "current",
                  },
                }),
              }),
              after: {
                1500: {
                  target: "run",
                  actions: assign({
                    steps: ({ context }) => ({
                      ...context.steps,
                      "test-amm-init": {
                        ...context.steps["test-amm-init"],
                        retries: context.steps["test-amm-init"].retries + 1,
                      },
                    }),
                  }),
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
              after: {
                1500: {
                  target: "run",
                  actions: assign({
                    steps: ({ context }) => ({
                      ...context.steps,
                      "test-amm-init": {
                        ...context.steps["test-amm-init"],
                        retries: context.steps["test-amm-init"].retries + 1,
                      },
                    }),
                  }),
                },
              },
            },
          },
        },
        "provide-liquidity-tokenA": {
          id: "provide-liquidity-tokenA",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "provide-liquidity-tokenA": {
                    ...context.steps["provide-liquidity-tokenA"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleProvideLiquidity",
                src: "handleProvideLiquidity",
                input: ({ context }) => ({
                  poolId: context.steps["get-amm-process-id"].result as string,
                  token: context.tokenA,
                  amount: context.tokenAAmount,
                }),
                onDone: [
                  {
                    target: "#provide-liquidity-tokenB",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "provide-liquidity-tokenA": {
                            ...context.steps["provide-liquidity-tokenA"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "failed",
                  actions: [
                    ({ event }) => console.log("Failed", event),
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "provide-liquidity-tokenA": {
                          ...context.steps["provide-liquidity-tokenA"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
            },
          },
        },
        "provide-liquidity-tokenB": {
          id: "provide-liquidity-tokenB",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "provide-liquidity-tokenB": {
                    ...context.steps["provide-liquidity-tokenB"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleProvideLiquidity",
                src: "handleProvideLiquidity",
                input: ({ context }) => ({
                  poolId: context.steps["get-amm-process-id"].result as string,
                  token: context.tokenB,
                  amount: context.tokenBAmount,
                }),
                onDone: [
                  {
                    target: "#test-liquidity-pool",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "provide-liquidity-tokenB": {
                            ...context.steps["provide-liquidity-tokenB"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "failed",
                  actions: [
                    ({ event }) => console.log("Failed", event),
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "provide-liquidity-tokenB": {
                          ...context.steps["provide-liquidity-tokenB"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
            },
          },
        },
        "test-liquidity-pool": {
          id: "test-liquidity-pool",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "test-liquidity-pool": {
                    ...context.steps["test-liquidity-pool"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleTestLiquidityPool",
                src: "handleTestLiquidityPool",
                input: ({ context }) => ({
                  messageId: context.steps["provide-liquidity-tokenB"]
                    .result as string,
                }),
                onDone: [
                  {
                    target: "#completed-final",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "test-liquidity-pool": {
                            ...context.steps["test-liquidity-pool"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "waiting",
                  actions: [
                    ({ event }) => console.log("Failed", event),
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "test-liquidity-pool": {
                          ...context.steps["test-liquidity-pool"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            waiting: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "test-liquidity-pool": {
                    ...context.steps["test-liquidity-pool"],
                    status: "current",
                  },
                }),
              }),
              after: {
                1500: {
                  target: "run",
                  actions: assign({
                    steps: ({ context }) => ({
                      ...context.steps,
                      "test-liquidity-pool": {
                        ...context.steps["test-liquidity-pool"],
                        retries:
                          context.steps["test-liquidity-pool"].retries + 1,
                      },
                    }),
                  }),
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
              after: {
                1500: {
                  target: "run",
                  actions: assign({
                    steps: ({ context }) => ({
                      ...context.steps,
                      "test-liquidity-pool": {
                        ...context.steps["test-liquidity-pool"],
                        retries:
                          context.steps["test-liquidity-pool"].retries + 1,
                      },
                    }),
                  }),
                },
              },
            },
          },
        },
        "subscribe-dexi": {
          id: "subscribe-dexi",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "subscribe-dexi": {
                    ...context.steps["subscribe-dexi"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleSubscribeDEXI",
                src: "handleSubscribeDEXI",
                input: ({ context }) => ({
                  poolId: context.steps["get-amm-process-id"].result as string,
                  dexiPaymentToken: context.dexiPaymentToken,
                  dexiPaymentTokenValue: context.dexiPaymentTokenValue,
                }),
                onDone: [
                  {
                    target: "#provide-liquidity-tokenA",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "subscribe-dexi": {
                            ...context.steps["subscribe-dexi"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: {
                  target: "failed",
                  actions: [
                    ({ event }) => console.log("Failed", event),
                    assign({
                      steps: ({ context, event }) => ({
                        ...context.steps,
                        "subscribe-dexi": {
                          ...context.steps["subscribe-dexi"],
                          status: "failed",
                          result: (event.error as { message: string }).message,
                          raw: JSON.stringify(event),
                        },
                      }),
                    }),
                  ],
                },
              },
            },
            failed: {
              on: {
                RETRY: "run",
              },
            },
          },
        },
        "test-dexi-subscription": {
          id: "test-dexi-subscription",
          initial: "run",
          states: {
            run: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "test-dexi-subscription": {
                    ...context.steps["test-dexi-subscription"],
                    status: "current",
                  },
                }),
              }),
              invoke: {
                id: "handleTestDEXISubscription",
                src: "handleTestDEXISubscription",
                input: ({ context }) => ({
                  poolId: context.steps["get-amm-process-id"].result as string,
                }),
                onDone: [
                  {
                    guard: ({ event }) =>
                      event.output.result === "paid--complete",
                    target: "#subscribe-dexi",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "test-dexi-subscription": {
                            ...context.steps["test-dexi-subscription"],
                            status: "done",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                  {
                    guard: ({ context, event }) =>
                      event.output.result !== "paid--complete" &&
                      context.steps["test-dexi-subscription"].retries < 5,
                    target: "waiting",
                  },
                  {
                    target: "failed",
                    actions: [
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "test-dexi-subscription": {
                            ...context.steps["test-dexi-subscription"],
                            status: "failed",
                            result: event.output.result,
                            raw: JSON.stringify(event.output.raw),
                          },
                        }),
                      }),
                    ],
                  },
                ],
                onError: [
                  {
                    target: "failed",
                    actions: [
                      ({ event }) => console.log("Failed", event),
                      assign({
                        steps: ({ context, event }) => ({
                          ...context.steps,
                          "test-dexi-subscription": {
                            ...context.steps["test-dexi-subscription"],
                            status: "failed",
                            result: (event.error as { message: string })
                              .message,
                            raw: JSON.stringify(event),
                          },
                        }),
                      }),
                    ],
                  },
                ],
              },
            },
            waiting: {
              entry: assign({
                steps: ({ context }) => ({
                  ...context.steps,
                  "test-dexi-subscription": {
                    ...context.steps["test-dexi-subscription"],
                    status: "current",
                  },
                }),
              }),
              after: {
                1500: {
                  target: "run",
                  actions: assign({
                    steps: ({ context }) => ({
                      ...context.steps,
                      "test-dexi-subscription": {
                        ...context.steps["test-dexi-subscription"],
                        retries:
                          context.steps["test-dexi-subscription"].retries + 1,
                      },
                    }),
                  }),
                },
              },
            },
            failed: {
              on: {
                RETRY: "waiting",
              },
            },
          },
        },
      },
    },
    completed: {
      id: "completed-final",
      type: "final",
    },
    failed: {
      id: "failed",
      type: "final",
    },
  },
});

export { createAMMMachine };
