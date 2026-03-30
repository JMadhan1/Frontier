/**
 * Frontier Trade Hub - Network Configuration
 * 
 * Configuration for different EVE Frontier networks
 * Used by deployment scripts and frontend
 */

export interface NetworkConfig {
  name: string;
  displayName: string;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  faucetUrl?: string;
  chainId?: string;
}

export interface DeploymentConfig {
  packageId: string;
  tradeHubObjectId: string;
  adminCapId?: string;
  deployedAt?: string;
  deployer?: string;
}

// ===========================================
// Network Configurations
// ===========================================

export const networks: Record<string, NetworkConfig> = {
  /**
   * Utopia - EVE Frontier Testnet
   * 
   * Use this for development and testing.
   * Faucet available for test tokens.
   */
  utopia: {
    name: 'utopia',
    displayName: 'Utopia (Testnet)',
    rpcUrl: 'https://rpc.utopia.evefrontier.com',
    wsUrl: 'wss://ws.utopia.evefrontier.com',
    explorerUrl: 'https://explorer.utopia.evefrontier.com',
    faucetUrl: 'https://faucet.utopia.evefrontier.com',
  },

  /**
   * Stillness - EVE Frontier Mainnet
   * 
   * Production network. Deploy here for hackathon bonus (+10%).
   * Real assets - use with caution!
   */
  stillness: {
    name: 'stillness',
    displayName: 'Stillness (Mainnet)',
    rpcUrl: 'https://rpc.stillness.evefrontier.com',
    wsUrl: 'wss://ws.stillness.evefrontier.com',
    explorerUrl: 'https://explorer.stillness.evefrontier.com',
  },

  /**
   * Sui Devnet - Fallback for local development
   * 
   * Standard Sui devnet when EVE Frontier networks are unavailable.
   */
  devnet: {
    name: 'devnet',
    displayName: 'Sui Devnet',
    rpcUrl: 'https://fullnode.devnet.sui.io',
    wsUrl: 'wss://fullnode.devnet.sui.io',
    explorerUrl: 'https://suiexplorer.com/?network=devnet',
    faucetUrl: 'https://faucet.devnet.sui.io',
  },
};

// ===========================================
// Deployment Configurations
// ===========================================

/**
 * Store your deployment addresses here after deploying
 */
export const deployments: Record<string, DeploymentConfig> = {
  utopia: {
    packageId: '0x0', // Replace after deployment
    tradeHubObjectId: '0x0', // Replace after deployment
  },
  stillness: {
    packageId: '0x0', // Replace after deployment
    tradeHubObjectId: '0x0', // Replace after deployment
  },
  devnet: {
    packageId: '0x0', // Replace after deployment
    tradeHubObjectId: '0x0', // Replace after deployment
  },
};

// ===========================================
// Constants
// ===========================================

/**
 * Default gas budget for transactions (in MIST)
 */
export const DEFAULT_GAS_BUDGET = 100_000_000n; // 0.1 SUI

/**
 * Module name in the deployed package
 */
export const MODULE_NAME = 'trade_hub';

/**
 * Sui Clock object ID (shared system object)
 */
export const SUI_CLOCK_OBJECT_ID = '0x6';

/**
 * Move function names
 */
export const FUNCTIONS = {
  LIST_ITEM: 'list_item',
  BUY_ITEM: 'buy_item',
  CANCEL_LISTING: 'cancel_listing',
  UPDATE_FEE: 'update_fee',
  TRANSFER_OWNERSHIP: 'transfer_ownership',
} as const;

/**
 * Event type names emitted by the contract
 */
export const EVENT_TYPES = {
  ITEM_LISTED: `${MODULE_NAME}::ItemListed`,
  ITEM_SOLD: `${MODULE_NAME}::ItemSold`,
  LISTING_CANCELLED: `${MODULE_NAME}::ListingCancelled`,
  TRADE_HUB_CREATED: `${MODULE_NAME}::TradeHubCreated`,
} as const;

// ===========================================
// Helper Functions
// ===========================================

/**
 * Get network configuration by name
 */
export function getNetwork(name: string): NetworkConfig {
  const network = networks[name];
  if (!network) {
    throw new Error(`Unknown network: ${name}`);
  }
  return network;
}

/**
 * Get deployment configuration by network name
 */
export function getDeployment(network: string): DeploymentConfig {
  const deployment = deployments[network];
  if (!deployment) {
    throw new Error(`No deployment found for network: ${network}`);
  }
  return deployment;
}

/**
 * Get the full module path for a function call
 */
export function getModulePath(
  packageId: string,
  functionName: keyof typeof FUNCTIONS
): string {
  return `${packageId}::${MODULE_NAME}::${FUNCTIONS[functionName]}`;
}

/**
 * Format explorer URL for a transaction
 */
export function getTxExplorerUrl(network: string, txDigest: string): string {
  const config = getNetwork(network);
  return `${config.explorerUrl}/txblock/${txDigest}`;
}

/**
 * Format explorer URL for an object
 */
export function getObjectExplorerUrl(network: string, objectId: string): string {
  const config = getNetwork(network);
  return `${config.explorerUrl}/object/${objectId}`;
}

/**
 * Format explorer URL for an address
 */
export function getAddressExplorerUrl(network: string, address: string): string {
  const config = getNetwork(network);
  return `${config.explorerUrl}/address/${address}`;
}

export default {
  networks,
  deployments,
  getNetwork,
  getDeployment,
  getModulePath,
  FUNCTIONS,
  EVENT_TYPES,
  DEFAULT_GAS_BUDGET,
  SUI_CLOCK_OBJECT_ID,
};