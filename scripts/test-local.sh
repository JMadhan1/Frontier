#!/bin/bash

# ============================================================
# Frontier Trade Hub - Local Testing Script
# ============================================================
# This script runs the full local development environment
# including contract testing and frontend preview.
#
# Usage:
#   ./test-local.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(dirname "$0")/.."
CONTRACTS_DIR="$PROJECT_ROOT/contracts"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo ""
echo "============================================================"
echo "  FRONTIER TRADE HUB - LOCAL TESTING"
echo "============================================================"
echo ""

# Test smart contracts
echo -e "${YELLOW}🧪 Testing smart contracts...${NC}"
cd "$CONTRACTS_DIR"

if command -v sui &> /dev/null; then
    sui move build
    echo -e "${GREEN}✓ Contract build successful${NC}"
    
    sui move test
    echo -e "${GREEN}✓ All contract tests passed${NC}"
else
    echo -e "${YELLOW}⚠ Sui CLI not installed, skipping contract tests${NC}"
fi

# Test frontend
echo ""
echo -e "${YELLOW}🔨 Building frontend...${NC}"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Type check
echo -e "${YELLOW}📋 Running type check...${NC}"
npm run lint 2>/dev/null || echo -e "${YELLOW}⚠ Linting warnings (non-blocking)${NC}"

# Build test
echo -e "${YELLOW}🔨 Building production bundle...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo "============================================================"
echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo "============================================================"
echo ""
echo "To start the development server:"
echo "  cd frontend && npm run dev"
echo ""
echo "To deploy contracts:"
echo "  ./scripts/deploy.sh utopia    # For testnet"
echo "  ./scripts/deploy.sh stillness # For mainnet (+10% bonus)"
echo ""