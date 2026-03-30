#!/bin/bash

# ============================================================
# Frontier Trade Hub - Setup Script
# ============================================================
# This script sets up the development environment for the
# Frontier Trade Hub project.
#
# Usage:
#   ./setup.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(dirname "$0")/.."
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo ""
echo "============================================================"
echo "  FRONTIER TRADE HUB - DEVELOPMENT SETUP"
echo "============================================================"
echo ""

# Check Node.js
echo -e "${YELLOW}📋 Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm $NPM_VERSION${NC}"

# Check Sui CLI (optional)
echo ""
echo -e "${YELLOW}📋 Checking Sui CLI (optional)...${NC}"
if command -v sui &> /dev/null; then
    SUI_VERSION=$(sui --version 2>/dev/null | head -1)
    echo -e "${GREEN}✓ Sui CLI: $SUI_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Sui CLI not found (required for contract deployment)${NC}"
    echo "  Install: cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui"
fi

# Install frontend dependencies
echo ""
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd "$FRONTEND_DIR"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create .env file
if [ ! -f ".env" ]; then
    echo ""
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created (edit with your contract addresses)${NC}"
fi

echo ""
echo "============================================================"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start development server:"
echo "   cd frontend && npm run dev"
echo ""
echo "2. Deploy contracts (requires Sui CLI):"
echo "   ./scripts/deploy.sh utopia"
echo ""
echo "3. Update frontend/.env with deployed contract addresses"
echo ""
echo -e "${CYAN}Happy building! 🚀${NC}"
echo ""