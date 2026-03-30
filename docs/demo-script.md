# Demo Video Script - Frontier Trade Hub

**Target Length**: 3-5 minutes
**Platform**: YouTube or Loom (1080p minimum)
**Audio**: Clear narration

---

## Scene 1: Introduction (30 seconds)

**[Screen: EVE Frontier space scene or logo]**

> "In EVE Frontier, players need to trade resources to survive and thrive. But today, there's no trustless way to do it. You either trust strangers on Discord, or you don't trade at all. I built Frontier Trade Hub to change that."

**[Transition: Show the dApp loading screen]**

---

## Scene 2: Problem Statement (30 seconds)

**[Screen: Show Discord trading channels, forum posts]**

> "The current trading experience is fragmented. Players post items in Discord, negotiate in DMs, and hope the other person doesn't scam them. There's no price discovery, no escrow, and no transparency."

**[Show mock data of fragmented trading]**

> "Frontier Trade Hub solves this with a decentralized marketplace built on Sui blockchain."

---

## Scene 3: Solution Overview (30 seconds)

**[Screen: Show the full dApp interface]**

> "Frontier Trade Hub is a peer-to-peer marketplace that integrates directly with EVE Frontier's Smart Storage Units. It's built with Sui Move smart contracts and a React frontend."

**[Show architecture diagram briefly]**

> "The system has two core modules: TradeHub handles all marketplace logic, and TradeTerminal bridges in-game items to the on-chain marketplace."

---

## Scene 4: Live Demo - Listing an Item (60 seconds)

**[Screen: Navigate to Create Listing tab]**

> "Let me show you how it works. First, I'll connect my Sui wallet."

**[Click Connect Wallet, show connection]**

> "Now I'll create a listing. I have 1000 units of Tritanium Ore in my SSU that I want to sell."

**[Fill in the form]**
- Item ID: TRIT_001
- Item Name: Tritanium Ore
- Quantity: 1000
- Price: 0.5 SUI

> "The interface shows me a summary including the 1% platform fee. When I click Create Listing, it signs a transaction through my Sui wallet."

**[Show the transaction signing in wallet popup]**

> "The listing is now live on-chain. Let me show you the transaction in the explorer."

**[Show explorer link]**

---

## Scene 5: Live Demo - Buying an Item (60 seconds)

**[Screen: Navigate to All Listings tab]**

> "Now let's look at the marketplace from a buyer's perspective. I can see all active listings with search and sort capabilities."

**[Show search/sort functionality]**

> "I'll buy this Pyerite listing. Clicking Buy opens a confirmation modal showing the item details, seller address, and my balance."

**[Show BuyModal]**

> "After confirming, the smart contract handles everything: validates the payment, splits the funds - 99% to the seller, 1% platform fee - and marks the listing as sold."

**[Show the purchase transaction]**

---

## Scene 6: Smart Assembly Integration (45 seconds)

**[Screen: Show Smart Assembly architecture diagram]**

> "The key innovation is Smart Assembly integration. Players register their SSU as a Trade Terminal in-game."

**[Show TradeTerminal contract on explorer]**

> "The TradeTerminal module bridges in-game inventory to the on-chain marketplace. When a player syncs items from their SSU, those items become available for listing."

**[Show terminal registration flow]**

> "This creates a seamless experience where players interact with the marketplace without leaving the game. The terminal handles all the blockchain complexity behind the scenes."

---

## Scene 7: Technical Highlights (30 seconds)

**[Screen: Show code snippets or architecture]**

> "Under the hood, we're using Sui's shared object model for the TradeHub, enabling concurrent marketplace access. Events are emitted for every state change, allowing the frontend to update in real-time."

**[Show contract code briefly]**

> "The frontend uses React 18 with TypeScript, Tailwind CSS, and the official Sui dApp Kit for wallet integration. It's fully responsive with an EVE-inspired dark theme."

**[Show mobile view briefly]**

---

## Scene 8: Future Vision (15 seconds)

**[Screen: Show roadmap or closing screen]**

> "This is just the beginning. Future phases include Smart Gate integration for cross-region trading, auction systems, and real-time price analytics. Frontier Trade Hub aims to become the default marketplace for EVE Frontier."

**[Show project URL and GitHub link]**

> "Thank you for watching. The code is open source at github.com/your-team/frontier-trade-hub. Built for the EVE Frontier Hackathon 2026."

---

## Recording Tips

1. **Screen Resolution**: Record at 1920x1080
2. **Cursor**: Use a cursor highlight tool
3. **Audio**: Use a good microphone, record in a quiet room
4. **Pacing**: Practice the script 2-3 times before recording
5. **Editing**: Add transitions, zoom into key areas, add captions
6. **Music**: Optional - use royalty-free ambient space music
7. **Length**: Keep it under 5 minutes, ideally 3-4 minutes
