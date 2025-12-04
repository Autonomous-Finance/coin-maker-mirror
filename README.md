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
- `VITE_HB_NODE_URL` - Hyperbridge node URL (default: `https://hb.zoao.dev`)
- `VITE_APP_VER` - Application version
- `VITE_GIT_HASH` - Git commit hash

## Security Considerations

⚠️ **Important Security Notes:**

1. **Environment Variables**: Never commit `.env` files to version control. The `.gitignore` file is configured to exclude these files.

2. **Deployment Scripts**: The `permaweb-deploy.js` script requires sensitive credentials:
   - `DEPLOY_KEY` - Base64-encoded Arweave wallet JSON (required)
   - `DEPLOY_WALLET` - Wallet address for balance checks (optional, has default)
   - `ANT_PROCESS` - ANT process ID (optional, has default)
   
   These should be set as environment variables and never committed to the repository.

3. **Public Addresses**: This repository contains public blockchain addresses and process IDs. These are safe to expose as they are already public on-chain.

4. **Wallet Integration**: The application uses client-side wallet connections (Arweave Wallet Kit). Private keys never leave the user's browser.

5. **No Backend Secrets**: This is a frontend-only application that interacts directly with the AO network. There are no backend API keys or secrets stored in this codebase.

For more detailed security information, see [SECURITY.md](SECURITY.md).

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
