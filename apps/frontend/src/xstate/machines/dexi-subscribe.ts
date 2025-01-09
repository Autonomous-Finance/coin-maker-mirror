import { assign, createMachine } from "xstate";

const dexiSubscribeMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QTADwJYGUCuAjWAxgE7q5gB06EANmAMQBmYALgQBYC0szAhs9rADaABgC6iUAAcA9rHTN00gHYSQqRBwBsAZnLaATAA4AjPoCsAGhABPRNoDsh8gE5h9s2f3DD237-sAvgFWKBg4+MSkFEysbOhKUFy8-LB0EMoU8QBu0gDW0Szs4YQkkgrKmMkCIuJIIDJy5Sp16ggALM5mLs76xobuVrYIDm3khm32mmaa5kEhaFh4JVHkMezxidx8AmkZlEo5+auFbMWRZYpKldtCxrVSsvKXqq1mhl3OPX0DNohthsJyG1zI5TGY5iBQosIiQyMdYhskjc6GAiERpERyJJqHwGBiALbwopLc5Na4pGqqBpPZQvP6dbq9fqWX4Ib4uNrGNrCGZmYT8-naCFQs6wiiSMBKCCI2AksWME5IiliKmPJp0tltXTfFlDCajVzuTzePz+YULUUrCVSmVyqJ0WUwqKUurU9UtRBc7XMwaIMwOIFuDxeHx+NrmsJ2uFKaTMLhRyAOhMuh6NZ4ehCaPrkTSabm833tXTOQyGIxgiPQ5Zwx3V+jpJSZA55ChsHhS2iWsgp+pq9OgVodD5fH2s8t6Zxtf0V4KQi0J8i1yJkFFojFYnHMPFEQltjtgLtgHtu-tqenDpk-IaToGl8vmAWCoKzmMoeB1EUJ1Vp2kZjjGG8yxMcxCw4LVyDMYxjHsLxhE+UtjE0QJZ0-J04SoWhvxpZoBw0LlNDGe9dTsexnEDI0Q1NBxK0PIk4gSJUBCw91cIQQwyM+S9iOGNoCO5CiTVNZD5kjNCKCXMUIGY09WnGJxNEffRXA8aZ9ELbRvBzYFnCmEtgQcXMaIXa1pQYiSomk39WP-XjCOA7izHsYxyODQTfHDFD5zE8gYzjcyyCk10+yss8EEmXRHPswtYPIJSlM0ZlH2EIVPNEutFy-IKfxw0LjA0iDjFU7jXCBPNxgcPlHxSoIgA */
  id: "dexiSubscribe",
  initial: "idle",
  context: {
    subscribedStatus: "",
    subscribed: false,
    error: "",
    registerMessageId: "",
  },
  states: {
    idle: {
      on: {
        "fetch-status": {
          target: "fetching-status",
        },
      },
    },
    "fetching-status": {
      invoke: {
        id: "fetchSubscriptionStatus",
        src: "fetchSubscriptionStatus",
        onDone: [
          {
            guard: ({ event }) => event.output === "paid--complete",
            target: "subscribed",
            actions: assign({
              subscribedStatus: "paid--complete",
              subscribed: true,
            }),
          },
          {
            target: "pending-subscribe",
            actions: assign({
              subscribedStatus: ({ event }) => event.output,
              subscribed: false,
            }),
          },
        ],
        onError: {
          target: "not-subscribed",
          actions: assign({
            subscribedStatus: "",
            subscribed: false,
          }),
        },
      },
    },
    subscribed: {
      type: "final",
    },
    "pending-subscribe": {
      on: {
        "fetch-status": {
          target: "fetching-status",
        },
        subscribe: {
          target: "subscribe",
        },
      },
    },
    "not-subscribed": {
      on: {
        subscribe: {
          target: "subscribe",
        },
      },
    },
    subscribe: {
      invoke: {
        id: "handleSubscribe",
        src: "handleSubscribe",
        onDone: {
          target: "fetching-status",
          actions: assign({
            subscribed: true,
          }),
        },
        onError: {
          target: "not-subscribed",
          actions: assign({
            error: ({ event }) => event.error as string,
          }),
        },
      },
    },
  },
});

export { dexiSubscribeMachine };
