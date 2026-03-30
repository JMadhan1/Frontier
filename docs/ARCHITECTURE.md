# Frontier Trade Hub - Technical Architecture

## System Architecture

Frontier Trade Hub is a decentralized marketplace built on three layers:

1. **Smart Contracts** (Sui Move) - On-chain marketplace logic
2. **Frontend** (React + TypeScript) - User interface
3. **Bridge Layer** (Trade Terminal) - Smart Assembly integration

## Smart Contract Architecture

### Module: `trade_hub.move`

The core marketplace contract handling all trading logic.

**Shared Object**: `TradeHub`
- `listing_counter: u64` - Auto-incrementing listing ID
- `listings: Table<u64, Listing>` - All listings indexed by ID
- `active_listing_ids: vector<u64>` - Quick lookup for active listings
- `owner: address` - Platform admin
- `total_volume: u64` - Cumulative trade volume (MIST)
- `total_trades: u64` - Number of completed trades
- `fee_bps: u64` - Platform fee in basis points (100 = 1%)

**Entry Functions**:
| Function | Description | Access |
|----------|-------------|--------|
| `list_item` | Create marketplace listing | Anyone |
| `buy_item` | Purchase a listing | Anyone (not seller) |
| `cancel_listing` | Remove own listing | Seller only |
| `update_fee` | Change fee percentage | Admin only |
| `transfer_ownership` | Transfer admin rights | Admin only |

**Events**:
- `ItemListed` - New listing created
- `ItemSold` - Listing purchased
- `ListingCancelled` - Listing removed
- `TradeHubCreated` - Contract initialized

### Module: `trade_terminal.move`

Smart Assembly bridge connecting in-game SSU to on-chain marketplace.

**Shared Object**: `TradeTerminal`
- `assembly_id: String` - EVE Frontier Smart Assembly ID
- `owner: address` - Terminal owner
- `location: String` - In-game location
- `is_active: bool` - Terminal status
- `inventory: Table<String, SsuItem>` - Synced SSU items

**Entry Functions**:
| Function | Description |
|----------|-------------|
| `register_terminal` | Create a new trade terminal from an SSU |
| `sync_item_from_ssu` | Sync inventory from in-game SSU |
| `list_item_through_terminal` | List item on TradeHub via terminal |
| `toggle_terminal` | Activate/deactivate terminal |
| `update_location` | Update terminal location |

## Frontend Architecture

### Component Hierarchy

```
App.tsx
├── Header.tsx          - Navigation, wallet, network badge
├── Dashboard.tsx       - Market stats (volume, trades, listings)
├── ListingsTable.tsx   - All active listings with search/sort
├── MyListings.tsx      - Current user's listings
├── CreateListing.tsx   - New listing form
├── BuyModal.tsx        - Purchase confirmation modal
└── ToastContainer.tsx  - Notification toasts
```

### State Management

- **useTradeHub** - Contract interaction (list, buy, cancel, fetch)
- **useWallet** - Wallet connection and balance
- **useToast** - Notification system

### Data Flow

```
User Action → Hook → Transaction → Sui RPC → Event → UI Update
```

## Deployment Architecture

```
Developer Machine
├── Sui CLI → Build & Test contracts
├── Deploy Script → Publish to network
├── Frontend Build → Vite production build
└── Hosting → Vercel/Netlify/GitHub Pages

Networks:
├── Sui Devnet (development fallback)
├── Utopia (EVE Frontier testnet)
└── Stillness (EVE Frontier mainnet)
```

## Security Considerations

- **Access Control**: Capability-based (AdminCap, TerminalCap)
- **Input Validation**: All user inputs validated in Move
- **Payment Safety**: Coin splitting with excess refund
- **No Reentrancy**: Move's linear type system prevents reentrancy
- **Fee Cap**: Maximum fee capped at 10% (1000 bps)
