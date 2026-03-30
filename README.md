# Frontier Trade Hub

> **Decentralized P2P Marketplace for EVE Frontier**

A trustless, transparent marketplace built on Sui blockchain that integrates with EVE Frontier's Smart Storage Units (SSU), enabling players to trade in-game items directly without intermediaries.

## Hackathon Submission

- **Event**: Sui x EVE Frontier Hackathon 2026
- **Prize Pool**: $80,000 USD
- **Deadline**: March 31, 2026
- **Bonus**: +10% for Stillness (Mainnet) deployment

## Problem

EVE Frontier players have no decentralized trading infrastructure. Current options are informal Discord/forum trading with high scam risk, no price discovery, and no escrow mechanism.

## Solution

Frontier Trade Hub provides:
- **Trustless Trading**: Smart contracts handle all transactions automatically
- **Price Transparency**: All listings visible on-chain for fair price discovery
- **Smart Assembly Integration**: Trade directly from in-game SSU via Trade Terminals
- **Low Fees**: 1% platform fee, configurable by admin

## Architecture

```
┌──────────────────────────────────────────────────┐
│               EVE Frontier Game                  │
│                                                   │
│   Player SSU → Trade Terminal (Smart Assembly)   │
│                      │                            │
└──────────────────────┼────────────────────────────┘
                       │ Sui Blockchain
              ┌────────▼────────┐
              │  trade_terminal │ ← bridges in-game → on-chain
              │    .move        │
              └────────┬────────┘
                       │ calls
              ┌────────▼────────┐
              │   trade_hub     │ ← core marketplace logic
              │    .move        │
              └────────┬────────┘
                       │ RPC
              ┌────────▼────────┐
              │  React Frontend │ ← player interface
              │  (TypeScript)   │
              └─────────────────┘
```

## Smart Contracts

### `trade_hub.move` - Core Marketplace
- `list_item()` - Create marketplace listing
- `buy_item()` - Purchase a listing (auto payment split)
- `cancel_listing()` - Remove own listing
- Events: `ItemListed`, `ItemSold`, `ListingCancelled`

### `trade_terminal.move` - Smart Assembly Bridge
- `register_terminal()` - Register SSU as Trade Terminal
- `sync_item_from_ssu()` - Sync inventory from in-game SSU
- `list_item_through_terminal()` - List item via terminal to TradeHub

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Sui Move |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (EVE-inspired dark theme) |
| Wallet | @mysten/dapp-kit |
| State | React Query + Custom Hooks |

## Quick Start

```bash
# Setup
cd frontend && npm install && cp .env.example .env

# Development
npm run dev
# → http://localhost:3000

# Deploy contracts
cd contracts && sui move build && sui move test
sui client publish --gas-budget 100000000
```

## Project Structure

```
frontier-trade-hub/
├── contracts/
│   ├── sources/
│   │   └── trade_hub.move          # Core marketplace
│   ├── smart-assembly/
│   │   └── trade_terminal.move     # Smart Assembly bridge
│   └── Move.toml
├── frontend/
│   ├── src/
│   │   ├── components/             # UI components
│   │   ├── hooks/                  # useTradeHub, useWallet, useToast
│   │   ├── data/eve-items.ts       # EVE item database
│   │   ├── types/                  # TypeScript interfaces
│   │   └── utils/                  # Formatting, config
│   └── package.json
├── scripts/
│   ├── deploy.sh                   # Contract deployment
│   └── setup.sh                    # Dev environment setup
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── demo-script.md
│   └── smart-assembly-research.md
├── SUBMISSION.md
└── README.md
```

## Features

### Marketplace
- List items with quantity, price, and item metadata
- Browse/search/sort all active listings
- Buy items with automatic SUI payment and fee split
- Cancel own listings
- My Listings dashboard with earnings summary

### Smart Assembly Integration
- Register SSU as Trade Terminal in-game
- Sync inventory from SSU to on-chain
- Bridge listings from terminal to marketplace
- Multiple terminals per player

### UI/UX
- EVE-inspired dark space theme with cyan accents
- Real-time stats dashboard (volume, trades, listings)
- Transaction confirmation modals
- Toast notifications for all actions
- Responsive design

## License

MIT
