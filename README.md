# CoinMaker

> **⚠️ Archived Project - Not Maintained**
> 
> This project is archived and **will not be maintained**. It is provided as-is for educational and reference purposes only. No pull requests or issues will be accepted or addressed.

## About

CoinMaker is a decentralized application (dApp) for creating and managing tokens on the AO network. This repository was initially developed by **[Autonomous Finance (AF)](https://defi.ao)** and served as the codebase for [Coin Maker](https://coin.defi.ao).

This repository mirrors the original private repository and has been made available as open source for educational purposes, to benefit builders in the AO ecosystem.

## Features

- Token creation and management
- Bonding curve functionality
- Liquidity pool (LP) creation and locking
- Token distribution and vesting
- Batch transfer support for efficient multi-recipient transfers
- Whitelisting module for transfer restrictions
- Tree-based balance storage using AO devices
- Integration with AO network processes

## Project Structure

```
coin-maker-mirror/
├── apps/
│   └── frontend/          # React + TypeScript + Vite frontend application
├── packages/
│   └── registry/          # AO process registry and token contracts (Lua)
├── scripts/               # Utility scripts
└── processes.*.yaml       # Process deployment configurations
```

## Technology Stack

- **Frontend**: React, TypeScript, Vite, TanStack Router
- **Styling**: Tailwind CSS
- **Runtime**: Bun
- **Blockchain**: AO Network
- **Smart Contracts**: Lua (AO processes)

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.0.15 or later
- Node.js (if not using Bun)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Autonomous-Finance/coin-maker-mirror
cd coin-maker-mirror
```

2. Install dependencies:

```bash
bun install
```

3. Generate environment variables:

The application requires environment variables to be configured. Run the following script to fetch them from the registry:

```bash
cd apps/frontend
bun run scripts/generate-env.ts
```

This will create a `.env` file with the necessary configuration. Alternatively, you can manually create a `.env` file based on the schema defined in `src/validate-env.ts`.

4. Run the development server:

```bash
cd apps/frontend
bun dev
```

The application will be available at `http://localhost:5173` (or the port specified by Vite).

### Additional Scripts

- `bun dev` - Start the frontend development server
- `bun frontend:format` - Format frontend code
- `bun frontend:lint` - Lint frontend code

### Environment Variables

The application requires the following environment variables (prefixed with `VITE_`):

- `VITE_ENV` - Environment: `staging` or `production`
- `VITE_REGISTRY_PROCESS` - Registry process ID
- `VITE_TOKEN_FACTORY_PROCESS` - Token factory process ID
- `VITE_AMM_FACTORY_PROCESS` - AMM factory process ID
- `VITE_TOKEN_LOCKER_PROCESS` - Token locker process ID
- `VITE_PAYMENT_TOKEN_PROCESS` - Payment token process ID
- `VITE_DEXI_PROCESS` - DEXI process ID
- `VITE_WRAPPED_AR_PROCESS` - Wrapped AR token process ID
- `VITE_QAR_PROCESS` - QAR token process ID
- `VITE_HB_NODE_URL` - Hyperbridge node URL
- `VITE_APP_VER` - Application version
- `VITE_GIT_HASH` - Git commit hash

## Token Architecture

### Tree Device for Balances

The token contracts use AO's device system to efficiently store and update balances. The balance storage leverages a **tree device** (`trie@1.0`) which provides:

- **Efficient Storage**: Balances are stored in a Merkle tree structure, enabling efficient updates and queries
- **Patch Updates**: Balance changes are propagated using the `patch@1.0` device, which sends incremental updates to the balance tree
- **Initialization**: On token deployment, the balances tree is initialized with `balances = { device = "trie@1.0" }` to set up the tree structure
- **Incremental Updates**: After transfers, only the affected addresses are patched, minimizing data transfer and storage costs

The patch mechanism sends balance updates in the following format:
```lua
{
  device = 'patch@1.0',
  balances = {
    [address] = balance_amount,
    ...
  },
  ['token-info'] = {
    name = Name,
    ticker = Ticker,
    logo = Logo,
    denomination = Denomination,
    supply = TotalSupply
  }
}
```

### Batch Transfer

The token contracts support **atomic batch transfers** for efficiently sending tokens to multiple recipients in a single transaction:

- **CSV Format**: Transfers are specified in CSV format: `recipient_address,quantity`
- **Atomicity**: All transfers succeed or all fail - no partial executions
- **Aggregation**: Multiple transfers to the same recipient are automatically aggregated
- **Notifications**: Sends batch debit notices to the sender and individual credit notices to recipients (unless `Cast` tag is set)

**Example CSV format:**
```
recipient_address_1,100
recipient_address_2,200
recipient_address_3,150
```

**Features:**
- Validates all entries before processing
- Checks sufficient balance before execution
- Updates balances atomically
- Sends appropriate notifications
- Patches the balance tree with all affected addresses

### Whitelisting Module

The whitelisting module provides **transfer restriction capabilities** for token contracts:

- **Enable/Disable**: Whitelist can be enabled or disabled by the token owner
- **Address Management**: Add or remove addresses from the whitelist individually or in batches
- **Transfer Guard**: Automatically intercepts transfer attempts and validates sender against the whitelist
- **Owner Control**: Only the token owner can modify whitelist settings

**Actions:**
- `Whitelist/Add-Address` - Add a single address to the whitelist
- `Whitelist/Add-Address-Batch` - Add multiple addresses at once
- `Whitelist/Remove-Address` - Remove an address from the whitelist
- `Whitelist/Get-Whitelist` - Query current whitelist state
- `Whitelist/Set-Enabled` - Enable or disable the whitelist

When enabled, only addresses on the whitelist can send transfers. Recipients are not restricted - anyone can receive tokens.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This software is provided "as is", without warranty of any kind. The original developers (Autonomous Finance) are not responsible for any issues, bugs, or security vulnerabilities that may exist in this codebase. Use at your own risk.

## Contributing

**This project is archived and not accepting contributions.** If you wish to fork this project and maintain your own version, you are free to do so under the terms of the MIT License.

## Links

- [Coin Maker (Live Application)](https://coin.defi.ao)
- [Autonomous Finance](https://defi.ao)
- [AO Network](https://ao.ar.io)
