# EVE Frontier Smart Assembly Research

## Key Findings

### EVE Frontier + Sui Integration (March 2026)

- **March 11, 2026**: EVE Frontier migrated from Solidity/MUD on OP Sepolia to Sui Move
- The new system uses `evefrontier/world-contracts` (Sui Move, v0.0.21)
- Legacy system: `projectawakening/builder-examples` (Solidity, functional with deployment scripts)

### Smart Assemblies Overview

Smart Assemblies are in-game objects that can be enhanced with custom logic:

1. **Smart Storage Unit (SSU)**: Player-owned storage that can be programmed
2. **Smart Gate**: Programmable stargates with custom routing logic
3. **Smart Turret**: Defensive structures with custom targeting/damage

### Custom Contracts System

"Custom Contracts" = your Move/Solidity code linked to an in-game Smart Assembly:

1. Deploy a contract to Sui (or OP Sepolia for legacy)
2. Get an Object ID from the deployment
3. Link the Object ID to an assembly in-game
4. The assembly runs your contract logic

### Deployment Process

#### To Utopia (Testnet)
- Use Sui testnet RPC: `https://rpc.utopia.evefrontier.com`
- Deploy Move contracts using `sui client publish`
- Link to in-game Smart Assembly via Object ID

#### To Stillness (Mainnet)
- Use Sui mainnet RPC: `https://rpc.stillness.evefrontier.com`
- Deploy after April 1 for hackathon bonus (+10%)
- Get Object ID from deployed in-game object
- Email verification to: community@evefrontier.com

### Hackathon Requirements

**Submission URL**: https://deepsurge.xyz/evefrontier2026
**Deadline**: March 31, 2026
**Stillness Bonus**: +10% score (deploy April 1+)
**Verification Email**: community@evefrontier.com

**Key Criteria**:
- Build "mods" that deploy INTO Smart Assemblies
- Deploy to Stillness for bonus
- Provide Object ID from deployed object
- Demonstrate in-game integration

### Architecture for Frontier Trade Hub

Our approach:
1. Deploy `trade_hub.move` to Sui Testnet (or EVE Utopia)
2. Deploy `trade_terminal.move` as the Smart Assembly bridge
3. Register SSU as a Trade Terminal in-game
4. Players interact with terminal to list/buy items
5. Terminal bridges to on-chain TradeHub contract

### Technical Stack

- **Blockchain**: Sui (Move language)
- **Frontend**: React 18 + TypeScript + Vite
- **Wallet**: @mysten/dapp-kit (Sui Wallet)
- **Styling**: Tailwind CSS with EVE-inspired dark theme
- **Smart Contracts**: Sui Move (framework/mainnet)

### Relevant Links

- EVE Frontier: https://evefrontier.com
- Sui Blockchain: https://sui.io
- Sui Move Docs: https://docs.sui.io
- Hackathon: https://deepsurge.xyz/evefrontier2026
- EVE Frontier GitHub: https://github.com/evefrontier
