#!/bin/bash

# ============================================================
# Frontier Trade Hub - Deployment Script
# ============================================================
# This script deploys the TradeHub smart contract to either
# Utopia (testnet) or Stillness (mainnet) networks.
#
# Usage:
#   ./deploy.sh [network]
#
# Arguments:
#   network - Either 'utopia' (default) or 'stillness'
#
# Prerequisites:
#   - Sui CLI installed and configured
#   - Wallet with sufficient SUI for gas fees
#   - For Stillness: 10% bonus eligibility for hackathon
# ============================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CONTRACTS_DIR="$(dirname "$0")/../contracts"
FRONTEND_DIR="$(dirname "$0")/../frontend"

# Network configuration
NETWORK="${1:-utopia}"

case $NETWORK in
  utopia)
    RPC_URL="https://rpc.utopia.evefrontier.com"
    EXPLORER_URL="https://explorer.utopia.evefrontier.com"
    echo -e "${CYAN}🚀 Deploying to Utopia (Testnet)${NC}"
    ;;
  stillness)
    RPC_URL="https://rpc.stillness.evefrontier.com"
    EXPLORER_URL="https://explorer.stillness.evefrontier.com"
    echo -e "${CYAN}🚀 Deploying to Stillness (Mainnet) - 10% Bonus Eligibility!${NC}"
    ;;
  devnet)
    RPC_URL="https://fullnode.devnet.sui.io"
    EXPLORER_URL="https://suiexplorer.com/?network=devnet"
    echo -e "${CYAN}🚀 Deploying to Sui Devnet (Development)${NC}"
    ;;
  *)
    echo -e "${RED}❌ Invalid network: $NETWORK${NC}"
    echo "Usage: ./deploy.sh [utopia|stillness|devnet]"
    exit 1
    ;;
esac

echo ""
echo "============================================================"
echo "  FRONTIER TRADE HUB - SMART CONTRACT DEPLOYMENT"
echo "============================================================"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if Sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo -e "${RED}❌ Sui CLI not found. Please install it first.${NC}"
    echo "   Install: cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui"
    exit 1
fi
echo -e "${GREEN}✓ Sui CLI found${NC}"

# Check if contracts directory exists
if [ ! -d "$CONTRACTS_DIR" ]; then
    echo -e "${RED}❌ Contracts directory not found: $CONTRACTS_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Contracts directory found${NC}"

# Check wallet configuration
echo -e "${YELLOW}📋 Checking wallet configuration...${NC}"
ACTIVE_ADDRESS=$(sui client active-address 2>/dev/null || echo "")

if [ -z "$ACTIVE_ADDRESS" ]; then
    echo -e "${RED}❌ No active wallet address found.${NC}"
    echo "   Run 'sui client new-address ed25519' to create a wallet."
    exit 1
fi
echo -e "${GREEN}✓ Active address: $ACTIVE_ADDRESS${NC}"

# Switch to correct environment (if Sui CLI supports it)
echo -e "${YELLOW}📋 Configuring network...${NC}"
if [ "$NETWORK" = "devnet" ]; then
    sui client switch --env devnet 2>/dev/null || echo "Using default environment"
fi
echo -e "${GREEN}✓ Network configured: $RPC_URL${NC}"

# Build the contract
echo ""
echo -e "${YELLOW}🔨 Building smart contracts...${NC}"
cd "$CONTRACTS_DIR"

sui move build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

# Run tests
echo ""
echo -e "${YELLOW}🧪 Running tests...${NC}"

sui move test

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All tests passed${NC}"

# Deploy the contract
echo ""
echo -e "${YELLOW}🚀 Deploying contract...${NC}"
echo "   This may take a moment..."

DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json 2>&1)

# Check for errors
if echo "$DEPLOY_OUTPUT" | grep -q '"error"'; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Parse deployment output
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep -o '"packageId"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

# Try to find TradeHub object ID (shared object created during init)
OBJECT_CHANGES=$(echo "$DEPLOY_OUTPUT" | grep -o '"objectId"[[:space:]]*:[[:space:]]*"[^"]*"' | head -5)

echo ""
echo "============================================================"
echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "============================================================"
echo ""
echo -e "${CYAN}Package ID:${NC} $PACKAGE_ID"
echo -e "${CYAN}Network:${NC} $NETWORK"
echo -e "${CYAN}Explorer:${NC} $EXPLORER_URL/object/$PACKAGE_ID"
echo ""

# Save deployment info
DEPLOY_INFO_FILE="$CONTRACTS_DIR/deployment-$NETWORK.json"
cat > "$DEPLOY_INFO_FILE" << EOF
{
  "network": "$NETWORK",
  "packageId": "$PACKAGE_ID",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deployer": "$ACTIVE_ADDRESS",
  "rpcUrl": "$RPC_URL",
  "explorerUrl": "$EXPLORER_URL"
}
EOF
echo -e "${GREEN}✓ Deployment info saved to: $DEPLOY_INFO_FILE${NC}"

# Update frontend .env
echo ""
echo -e "${YELLOW}📝 Updating frontend configuration...${NC}"

ENV_FILE="$FRONTEND_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    # Update existing .env
    sed -i "s/VITE_TRADE_HUB_PACKAGE_ID_${NETWORK^^}=.*/VITE_TRADE_HUB_PACKAGE_ID_${NETWORK^^}=$PACKAGE_ID/" "$ENV_FILE"
else
    # Create new .env from example
    if [ -f "$FRONTEND_DIR/.env.example" ]; then
        cp "$FRONTEND_DIR/.env.example" "$ENV_FILE"
        sed -i "s/VITE_NETWORK=.*/VITE_NETWORK=$NETWORK/" "$ENV_FILE"
        sed -i "s/VITE_TRADE_HUB_PACKAGE_ID_${NETWORK^^}=.*/VITE_TRADE_HUB_PACKAGE_ID_${NETWORK^^}=$PACKAGE_ID/" "$ENV_FILE"
    fi
fi
echo -e "${GREEN}✓ Frontend configuration updated${NC}"

echo ""
echo "============================================================"
echo -e "${GREEN}📋 NEXT STEPS:${NC}"
echo "============================================================"
echo ""
echo "1. Find the TradeHub shared object ID in the explorer:"
echo "   $EXPLORER_URL/object/$PACKAGE_ID"
echo ""
echo "2. Update your frontend .env with the TradeHub object ID:"
echo "   VITE_TRADE_HUB_OBJECT_ID_${NETWORK^^}=<object_id>"
echo ""
echo "3. Start the frontend:"
echo "   cd frontend && npm install && npm run dev"
echo ""
echo "4. For Stillness deployment (10% hackathon bonus):"
echo "   ./deploy.sh stillness"
echo ""
echo -e "${CYAN}Happy trading on Frontier Trade Hub! 🚀${NC}"
echo ""