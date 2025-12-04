# Security Policy

## Supported Versions

This project is **archived and not maintained**. No security updates will be provided.

## Security Considerations

### Environment Variables

- **Never commit `.env` files** to version control
- The `.gitignore` file excludes `.env` files by default
- Environment variables contain sensitive configuration that should be kept private

### Deployment Credentials

The deployment script (`apps/frontend/scripts/permaweb-deploy.js`) requires:

- `DEPLOY_KEY` - Base64-encoded Arweave wallet JSON (sensitive)
- `DEPLOY_WALLET` - Wallet address (public, but configurable)
- `ANT_PROCESS` - ANT process ID (public, but configurable)

**Important**: These should be set as environment variables in your CI/CD system and never committed to the repository.

### Public Information

This repository contains:

- Public blockchain addresses (process IDs, wallet addresses)
- Public contract addresses
- Public API endpoints

These are safe to expose as they are already public on-chain.

### Wallet Security

- The application uses client-side wallet connections
- Private keys never leave the user's browser
- Users are responsible for securing their own wallets
- Always verify you're connecting to the correct application

### Reporting Security Issues

Since this project is archived and not maintained, **security issues will not be addressed**. If you discover a security vulnerability:

1. **Do not** open a public issue
2. Consider forking the repository and fixing it yourself
3. Be aware that no official patches will be released

## Best Practices for Forkers

If you fork this repository:

1. Rotate all deployment credentials
2. Review and update all environment variables
3. Audit the codebase for any additional security concerns
4. Keep dependencies up to date
5. Implement proper CI/CD security practices
6. Use secret management tools for sensitive data

