# Deployment Guide - Frontier Trade Hub

## Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Sui CLI** installed and configured
- **Sui Wallet** with testnet/mainnet SUI
- **Git** for version control

## Step 1: Setup Development Environment

```bash
# Clone repository
git clone https://github.com/your-team/frontier-trade-hub.git
cd frontier-trade-hub

# Install frontend dependencies
cd frontend
npm install
cp .env.example .env

# Verify Sui CLI
sui --version
sui client active-address
```

## Step 2: Build Smart Contracts

```bash
cd contracts
sui move build
```

Expected output: `BUILD SUCCESSFUL`

## Step 3: Run Tests

```bash
cd contracts
sui move test
```

## Step 4: Deploy to Sui Testnet

### Option A: Use the deployment script

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh utopia
```

### Option B: Manual deployment

```bash
cd contracts

# Switch to testnet
sui client switch --env testnet

# Request testnet tokens
sui client faucet

# Deploy
sui client publish --gas-budget 100000000 --json > deployment.json
```

### Capture Deployment Info

From the deployment output, extract:
- **Package ID**: The deployed module address
- **TradeHub Object ID**: The shared object created during `init`

## Step 5: Update Frontend Configuration

Edit `frontend/.env`:

```env
VITE_NETWORK=devnet
VITE_TRADE_HUB_PACKAGE_ID_DEVNET=0xYOUR_PACKAGE_ID
VITE_TRADE_HUB_OBJECT_ID_DEVNET=0xYOUR_TRADEHUB_OBJECT_ID
VITE_SUI_RPC_DEVNET=https://fullnode.devnet.sui.io
```

## Step 6: Build Frontend

```bash
cd frontend
npm run build
```

The `dist/` folder contains the production build.

## Step 7: Deploy to Stillness (April 1+)

```bash
./scripts/deploy.sh stillness
```

Update `.env` with Stillness addresses:

```env
VITE_NETWORK=stillness
VITE_TRADE_HUB_PACKAGE_ID_STILLNESS=0xYOUR_STILLNESS_PACKAGE_ID
VITE_TRADE_HUB_OBJECT_ID_STILLNESS=0xYOUR_STILLNESS_OBJECT_ID
```

## Step 8: Register Smart Assembly (In-Game)

1. Deploy SSU in EVE Frontier
2. Note the Assembly ID
3. Call `register_terminal` with the Assembly ID
4. Note the Terminal Object ID
5. Email to community@evefrontier.com

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_NETWORK` | Active network | `utopia`, `stillness`, `devnet` |
| `VITE_TRADE_HUB_PACKAGE_ID_*` | Contract package ID | `0xabc...` |
| `VITE_TRADE_HUB_OBJECT_ID_*` | Shared TradeHub object | `0xdef...` |
| `VITE_SUI_RPC_*` | Network RPC URL | `https://...` |
| `VITE_DEBUG` | Enable debug logging | `true` / `false` |

## Troubleshooting

### "TradeHub not deployed yet"
- Verify `.env` has correct package/object IDs
- Check the network matches your deployment

### "Wallet not connected"
- Install Sui Wallet browser extension
- Switch to the correct network in wallet

### Build fails
- Run `npm install` to update dependencies
- Check Node.js version (18+)
- Clear cache: `rm -rf node_modules && npm install`
