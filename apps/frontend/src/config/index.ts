import ENV from "@/env";
import { parseUnits } from "@/lib/utils";
import type { PairToken } from "@/types";

const AO_MODULE = "SBNb1qPQ1TDwpD_mboxm2YllmMLXpWw4U8P9Ff8W9vk";
const AO_SCHEDULER = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";
const AMM_FACTORY_PROCESS = import.meta.env.VITE_AMM_FACTORY_PROCESS || "";
const TOKEN_LOCKER_PROCESS = import.meta.env.VITE_TOKEN_LOCKER_PROCESS || "";
const DEXI_TOKEN_PROCESS = import.meta.env.VITE_PAYMENT_TOKEN_PROCESS || "";
const DEXI_AMM_MONITOR = import.meta.env.VITE_DEXI_PROCESS || "";

const TOKEN_PROCESS_TYPE = "AF-TokenDrop-Token";
const LIQUIDITY_POOL = "Liquidity Pool";

const AO_LINK_URL = "https://www.ao.link";
const BOTEGA_URL = "https://botega.arweave.net";
const DEXI_URL = "https://dexi.arweave.net";

const PAIR_TOKENS: PairToken[] = [
  {
    Name: "AO",
    TokenProcess: "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc",
    Ticker: "AO",
    Logo: "UkS-mdoiG8hcAClhKK8ch4ZhEzla0mCPDOix9hpdSFE",
    Denomination: 12,
  },
  {
    Name: "Wrapped AR",
    TokenProcess: ENV.VITE_WRAPPED_AR_PROCESS,
    Ticker: "wAR",
    Logo: "L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs",
    Denomination: 12,
  },
  {
    Name: "Q Arweave",
    TokenProcess: ENV.VITE_QAR_PROCESS,
    Ticker: "qAR",
    Logo: "26yDr08SuwvNQ4VnhAfV4IjJcOOlQ4tAQLc1ggrCPu0",
    Denomination: 12,
  },
];

const DEXI_SUBSCRIBE_USD_PRICE = 5;
const METADATA_UPDATE_USD_PRICE = 2;

export interface PaymentToken {
  value: string;
  label: string;
  denomination: number;
  logo: string;
  disabled: boolean;
}

const PAYMENT_TOKENS: PaymentToken[] = [
  {
    value: "0syT13r0s0tgPmIed95bJnuSqaD29HQNN8D3ElLSrsc",
    label: "AO",
    denomination: 12,
    logo: "UkS-mdoiG8hcAClhKK8ch4ZhEzla0mCPDOix9hpdSFE",
    disabled: false,
  },
  {
    value: ENV.VITE_WRAPPED_AR_PROCESS,
    label: "wAR",
    denomination: 12,
    logo: "L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs",
    disabled: false,
  },
  {
    value: ENV.VITE_QAR_PROCESS,
    label: "qAR",
    denomination: 12,
    logo: "26yDr08SuwvNQ4VnhAfV4IjJcOOlQ4tAQLc1ggrCPu0",
    disabled: false,
  },
];

// Required DEXI Token balance to enable Dexi Integration
const DEXI_TOKEN_BALANCE_REQUIRED = parseUnits("100", 18);

const TOKEN_WHITELIST_MODULE = "Zd7vLelhAEU0EBEZ5yszRC1n3V9Win4U-7mcprtSZvs"

export {
  AMM_FACTORY_PROCESS,
  AO_LINK_URL,
  AO_MODULE,
  AO_SCHEDULER,
  BOTEGA_URL,
  DEXI_AMM_MONITOR,
  DEXI_TOKEN_BALANCE_REQUIRED,
  DEXI_TOKEN_PROCESS,
  DEXI_URL,
  LIQUIDITY_POOL,
  PAIR_TOKENS,
  TOKEN_LOCKER_PROCESS,
  TOKEN_PROCESS_TYPE,
  DEXI_SUBSCRIBE_USD_PRICE,
  METADATA_UPDATE_USD_PRICE,
  PAYMENT_TOKENS,
  TOKEN_WHITELIST_MODULE
};
