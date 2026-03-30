# Integration Architecture - Frontier Trade Hub

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVE FRONTIER GAME                               │
│                                                                          │
│  ┌──────────────────────┐          ┌──────────────────────┐            │
│  │    Player A           │          │    Player B           │            │
│  │    (Seller)           │          │    (Buyer)            │            │
│  │                       │          │                       │            │
│  │  ┌─────────────────┐ │          │  ┌─────────────────┐ │            │
│  │  │  Smart SSU       │ │          │  │  Smart SSU       │ │            │
│  │  │  (Storage)       │ │          │  │  (Storage)       │ │            │
│  │  └────────┬─────────┘ │          │  └────────┬─────────┘ │            │
│  │           │            │          │           │            │            │
│  │  ┌────────▼─────────┐ │          │  ┌────────▼─────────┐ │            │
│  │  │  Trade Terminal   │ │          │  │  Trade Terminal   │ │            │
│  │  │  (Smart Assembly) │ │          │  │  (Smart Assembly) │ │            │
│  │  └────────┬─────────┘ │          │  └────────┬─────────┘ │            │
│  └───────────┼───────────┘          └───────────┼───────────┘            │
│              │                                   │                        │
└──────────────┼───────────────────────────────────┼────────────────────────┘
               │                                   │
               │    Sui Blockchain                 │
               │                                   │
    ┌──────────▼───────────────────────────────────▼──────────┐
    │                                                          │
    │   ┌─────────────────────────────────────────────────┐   │
    │   │              trade_terminal.move                 │   │
    │   │                                                  │   │
    │   │  • register_terminal()                           │   │
    │   │  • sync_item_from_ssu()                          │   │
    │   │  • list_item_through_terminal()                  │   │
    │   │  • get_terminal_info()                           │   │
    │   │  • get_item()                                    │   │
    │   └──────────────────────┬──────────────────────────┘   │
    │                          │                               │
    │                          │ calls                         │
    │                          ▼                               │
    │   ┌─────────────────────────────────────────────────┐   │
    │   │               trade_hub.move                     │   │
    │   │                                                  │   │
    │   │  • list_item()                                   │   │
    │   │  • buy_item()                                    │   │
    │   │  • cancel_listing()                              │   │
    │   │  • get_active_listings()                         │   │
    │   │  • get_stats()                                   │   │
    │   └─────────────────────────────────────────────────┘   │
    │                                                          │
    │                    Sui Blockchain                        │
    └──────────────────────────────────────────────────────────┘
               │
               │  RPC Queries + Transaction Submission
               │
    ┌──────────▼──────────────────────────────────────────────┐
    │                                                          │
    │              React Frontend (dApp)                        │
    │                                                          │
    │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
    │   │ Dashboard│ │ Listings │ │   Buy    │ │  Create  │ │
    │   │          │ │  Table   │ │  Modal   │ │ Listing  │ │
    │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
    │                                                          │
    │   Hooks: useTradeHub  useWallet  useToast               │
    │                                                          │
    │   @mysten/dapp-kit + @mysten/sui.js                     │
    │                                                          │
    └──────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Listing an Item (Seller Flow)

```
Player's SSU → Trade Terminal (in-game)
    ↓
sync_item_from_ssu() → Updates terminal inventory on-chain
    ↓
list_item_through_terminal() → Calls trade_hub::list_item()
    ↓
ItemListed event emitted → Frontend picks up via RPC
    ↓
Item appears in marketplace listings
```

### 2. Buying an Item (Buyer Flow)

```
Buyer browses marketplace (React dApp)
    ↓
Clicks "Buy" → BuyModal shows confirmation
    ↓
Signs transaction → trade_hub::buy_item()
    ↓
Payment split: seller gets 99%, platform gets 1%
    ↓
ItemSold event emitted → Both parties notified
```

### 3. Smart Assembly ↔ Sui Bridge

```
In-game SSU Inventory
    ↓ (player action)
Trade Terminal reads inventory state
    ↓ (on-chain sync)
SsuItem records created on-chain
    ↓ (listing creation)
BridgeRecord links SSU item → TradeHub listing
    ↓ (purchase)
Funds flow through TradeHub → Seller receives SUI
```

## Contract Module Relationships

```
frontier_trade_hub::trade_hub
├── TradeHub (shared object)
├── Listing (store)
├── AdminCap (capability)
├── Events: ItemListed, ItemSold, ListingCancelled
└── Functions: list_item, buy_item, cancel_listing

frontier_trade_hub::trade_terminal
├── TradeTerminal (shared object)
├── SsuItem (store)
├── TerminalCap (capability)
├── BridgeRecord (store)
├── Events: TerminalRegistered, ItemSynced, TerminalListed
└── Functions: register_terminal, sync_item_from_ssu,
               list_item_through_terminal, toggle_terminal
```

## Network Configuration

| Network | RPC URL | Explorer | Use Case |
|---------|---------|----------|----------|
| Utopia (Testnet) | rpc.utopia.evefrontier.com | explorer.utopia.evefrontier.com | Development & Testing |
| Stillness (Mainnet) | rpc.stillness.evefrontier.com | explorer.stillness.evefrontier.com | Production (+10% bonus) |
| Sui Devnet | fullnode.devnet.sui.io | suiexplorer.com | Fallback for development |
