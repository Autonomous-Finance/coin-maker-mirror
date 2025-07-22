export type Tag = {
  name: string;
  value: string;
};

export type Token = {
  TokenProcess: string;
  Deployer: string;
  Name: string;
  Ticker: string;
  Denomination: number;
  TotalSupply: string;
  Balances: {
    [key: string]: {
      Amount: string;
      Vesting: string;
    };
  };
  Logo: string;
  CoverImage: string;
  SocialLinks: { key: string; value: string }[];
  Description: string;
  Telegram: string;
  Twitter: string;
  Website: string;
  Verified: boolean;
  Status: string;
  LPs?: string[];
  RenounceOwnership?: boolean;
};

export type BondingCurve = {
  targetMCap?: number;
  targetSupply?: number;
  curveRR?: number;
  curveFee?: number;
  supplyToken?: string;
  supplyTokenTicker?: string;
  supplyTokenDenomination?: number;
  lpTokensToBurn?: number;
  devAccount?: string;
}
export type BondingCurveDerived = {
  targetLiquidity?: number;
  targetPrice?: number;
  curveN?: number;
  curveM?: number;
  minFees?: number;
}

export type Allocation = {
  address: string;
  amount: string;
  percentage: number;
  vested: number;
};

export type PairToken = {
  Name: string;
  Ticker: string;
  TokenProcess: string;
  Denomination: number;
  Logo: string;
  disabled?: boolean;
};

export type PoolDetails = {
  Name: string;
  Denomination: string;
  Logo: string;
  Ticker: string;
  token: string;
  pairToken: string;
  tokenReserves: string;
  pairTokenReserves: string;
  [key: string]: string;
};

export type Balance = {
  address: string;
  amount: {
    Balance: string;
    "Current-Timestamp": string;
    "Total-Balance": string;
    "Vested-Amount": string;
    "Vested-Until": string;
  };
};
