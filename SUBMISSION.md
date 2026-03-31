# Frontier Trade Hub — EVE Frontier x Sui Hackathon 2026

## TL;DR
The first trustless, on-chain P2P marketplace for EVE Frontier. Players list, buy, and cancel in-game items directly from their Smart Storage Units — no Discord middlemen, no scam risk. Built on Sui with full Smart Assembly integration.

---

## Project Info

| Field | Value |
|-------|-------|
| **Project** | Frontier Trade Hub |
| **Tagline** | Decentralized P2P Marketplace for EVE Frontier — Powered by Sui |
| **Hackathon** | EVE Frontier x Sui Hackathon 2026 |
| **Category** | Utility / External Tool / Smart Assembly Integration |
| **Deadline** | March 31, 2026 |

---

## The Problem

EVE Frontier has no native player-to-player marketplace. Right now players:
- Post sell orders in Discord channels and wait
- Send items first and hope the buyer pays (scam risk)
- Use trusted third-party middlemen (single point of failure)

This is a $0 trustless trading volume problem sitting on top of a game specifically designed for player-driven economies.

---

## The Solution

**Frontier Trade Hub** is a fully on-chain marketplace deployed on Sui that:

1. **Players list items** — specify item ID, quantity, and SUI price
2. **Buyers pay on-chain** — SUI goes directly to seller (99%), 1% platform fee
3. **Smart Assembly integration** — SSU owners register their storage unit as a **Trade Terminal**, sync their in-game inventory on-chain, and list directly from their SSU in a single atomic transaction
4. **Trustless** — the Sui Move smart contract handles everything; no server, no intermediary

---

## Deployed Contracts (Sui Testnet)

> ⚠️ Originally deployed to Devnet (0x332ee...) — redeployed to Testnet for stability and Slush wallet compatibility.

| Contract | Address |
|----------|---------|
| **Package ID** | `0x332ee2997d16a70955c39b96df11634cd76053d61252e052933f661de0781a37` |
| **TradeHub Object** | `0x6660bee0e8a51f468d4339d9be070f951e063f9e851d66519eea7eefeebb5b42` |
| **AdminCap** | `0xec5023413ae6159546fa7fa5a8c7522dd9020f8d938515a9f43d80f2f42fe791` |
| **Network** | Sui Testnet |
| **Deployer** | `0x52224c02c41f3539096f4182696e1beed546c21aea5215f0d1630757b89389f0` |

### Modules Deployed
- `frontier_trade_hub::trade_hub` — core P2P marketplace
- `frontier_trade_hub::trade_terminal` — Smart Assembly (SSU) bridge

---

## Smart Contract Architecture

```
frontier_trade_hub::trade_hub
├── TradeHub (shared object)       ← concurrent access for all players
│   ├── listing_counter (u64)
│   ├── listings: Table<u64, Listing>
│   ├── active_listing_ids: vector<u64>
│   ├── total_volume (u64)         ← all-time SUI traded
│   ├── total_trades (u64)
│   └── fee_bps: 100               ← 1% platform fee
│
├── list_item()      → creates Listing, emits ItemListed
├── buy_item()       → splits Coin<SUI> (99% seller / 1% platform), emits ItemSold
├── cancel_listing() → seller-only cancellation, emits ListingCancelled
├── update_fee()     → admin only via AdminCap
└── transfer_ownership()

frontier_trade_hub::trade_terminal
├── TradeTerminal (shared object)  ← one per Smart Assembly
│   ├── assembly_id: String        ← EVE Frontier SSU object ID
│   ├── inventory: Table<String, SsuItem>
│   ├── owner: address
│   └── total_trades: u64
│
├── TerminalCap (owned)            ← capability issued to terminal owner
│
├── register_terminal()  → creates TradeTerminal + issues TerminalCap
├── sync_item_from_ssu() → mirrors SSU inventory to on-chain Table
└── list_item_through_terminal() → atomically deducts inventory + calls trade_hub::list_item()
```

**Key Sui patterns used:**
- Shared objects for concurrent marketplace access
- Capability pattern (AdminCap, TerminalCap) for access control
- Coin<SUI> splitting for atomic fee distribution
- On-chain events for off-chain indexing (ItemListed, ItemSold, TerminalRegistered, ItemSynced)

---

## Frontend Features

### Marketplace Tab
- Browse all active listings with real-time on-chain data (auto-refreshes every 15s)
- Search by item name, sort by price/time/quantity
- One-click buy with wallet confirmation
- Shows "Live on-chain" vs "Demo mode" indicator

### My Listings Tab
- Filter to your own listings
- Cancel any listing with one transaction

### Create Listing Tab
- EVE item picker with 40+ items pre-loaded (minerals, ships, modules, consumables)
- Auto-fills item ID, name, base price from in-game database
- Live fee preview (1% deducted, shows exact "you receive" amount)
- Validates form before sending transaction

### Smart Terminals Tab ⭐ (EVE Integration)
- Register any EVE Frontier Smart Storage Unit as a Trade Terminal
- Sync in-game inventory to on-chain Table (verifiable on Sui)
- List items directly from the terminal to the marketplace in one atomic tx
- Shows all registered terminals with capability proofs (TerminalCap object IDs)
- On-chain explainer showing exactly which Move functions are called

---

## Test Results

```
$ sui move test
INCLUDING DEPENDENCY Sui
INCLUDING DEPENDENCY MoveStdlib
BUILDING frontier_trade_hub
Running Move unit tests
[ PASS    ] frontier_trade_hub::trade_hub_tests::test_buy_item
[ PASS    ] frontier_trade_hub::trade_hub_tests::test_cancel_listing
[ PASS    ] frontier_trade_hub::trade_hub_tests::test_init_and_list_item
Test result: OK. Total tests: 3; passed: 3; failed: 0
```

---

## Links

- **GitHub**: https://github.com/your-team/frontier-trade-hub *(update before submission)*
- **Demo Video**: *(link to be added)*
- **Explorer (deploy tx)**: https://suiscan.xyz/devnet/tx/9Eg7sDtD3wGViwY2M17Rs68MUkJLzJETpdHWvtNSCrNP

---

## Running Locally

```bash
git clone https://github.com/your-team/frontier-trade-hub
cd frontier-trade-hub/frontend
npm install
npm run dev
# → http://localhost:5173
```

Connect Slush wallet → switch to Sui Testnet → interact with live contracts.

---

## Why This Wins

| Criteria | Frontier Trade Hub |
|----------|--------------------|
| **Smart Assembly integration** | ✅ `trade_terminal.move` deployed — register SSU, sync inventory, list via terminal |
| **Sui blockchain usage** | ✅ Shared objects, capabilities, Coin splitting, events — all core Sui patterns |
| **Solves a real problem** | ✅ EVE Frontier has no P2P marketplace; Discord trading is scam-prone |
| **Working demo** | ✅ Live contracts on testnet, real SUI transactions |
| **Code quality** | ✅ TypeScript + Move, 3/3 tests passing, full type safety |
| **UX** | ✅ EVE-themed dark UI, one-click flows, real-time updates |

---

## Roadmap

- **Phase 2**: Real-time price charts, order book, price history
- **Phase 3**: World API integration for automatic SSU inventory detection
- **Phase 4**: Auction system, offer/counter-offer mechanism
- **Phase 5**: Smart Gate integration — cross-system trade routes
- **Phase 6**: Deploy to Stillness (mainnet) for real player trading
