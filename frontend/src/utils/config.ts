/**
 * Frontier Trade Hub - Configuration
 *
 * Network and contract configuration for different environments
 */

import { TradeHubConfig } from '@/types';

// ===========================================
// Network Configuration
// ===========================================

export type NetworkType = 'utopia' | 'stillness' | 'devnet';

interface NetworkConfig {
  name: string;
  displayName: string;
  rpcUrl: string;
  explorerUrl: string;
  packageId: string;
  tradeHubObjectId: string;
}

/**
 * Network configurations for EVE Frontier and Sui
 */
export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  // Utopia - EVE Frontier Testnet
  utopia: {
    name: 'utopia',
    displayName: 'Utopia (Testnet)',
    rpcUrl: import.meta.env.VITE_SUI_RPC_UTOPIA || 'https://fullnode.testnet.sui.io',
    explorerUrl: 'https://explorer.utopia.evefrontier.com',
    packageId: import.meta.env.VITE_TRADE_HUB_PACKAGE_ID_UTOPIA || '0x0',
    tradeHubObjectId: import.meta.env.VITE_TRADE_HUB_OBJECT_ID_UTOPIA || '0x0',
  },
  // Stillness - EVE Frontier Mainnet (Production)
  stillness: {
    name: 'stillness',
    displayName: 'Stillness (Mainnet)',
    rpcUrl: import.meta.env.VITE_SUI_RPC_STILLNESS || 'https://fullnode.mainnet.sui.io',
    explorerUrl: 'https://explorer.stillness.evefrontier.com',
    packageId: import.meta.env.VITE_TRADE_HUB_PACKAGE_ID_STILLNESS || '0x0',
    tradeHubObjectId: import.meta.env.VITE_TRADE_HUB_OBJECT_ID_STILLNESS || '0x0',
  },
  // Sui Devnet - For development / hackathon demo
  devnet: {
    name: 'devnet',
    displayName: 'Sui Devnet',
    rpcUrl: import.meta.env.VITE_SUI_RPC_DEVNET || 'https://fullnode.devnet.sui.io:443',
    explorerUrl: 'https://suiscan.xyz/devnet',
    packageId: import.meta.env.VITE_TRADE_HUB_PACKAGE_ID_DEVNET || '0x268008bce8db9538011752023339f0bdf5c0dcb9a5569e8f566d58bdc1a6b03a',
    tradeHubObjectId: import.meta.env.VITE_TRADE_HUB_OBJECT_ID_DEVNET || '0x2ea0a6bf4e96438103823f227ed96004ba2f17140a26defec2f83c5d31bf98c0',
  },
};

/**
 * Get the current network from environment
 */
export function getCurrentNetwork(): NetworkType {
  const network = import.meta.env.VITE_NETWORK as NetworkType;
  return network && NETWORK_CONFIGS[network] ? network : 'devnet';
}

/**
 * Get configuration for a specific network
 */
export function getNetworkConfig(network?: NetworkType): NetworkConfig {
  return NETWORK_CONFIGS[network || getCurrentNetwork()];
}

/**
 * Get TradeHub configuration
 */
export function getTradeHubConfig(): TradeHubConfig {
  const network = getCurrentNetwork();
  const config = getNetworkConfig(network);

  return {
    packageId: config.packageId,
    tradeHubObjectId: config.tradeHubObjectId,
    network,
  };
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(txDigest: string, network?: NetworkType): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/txblock/${txDigest}`;
}

/**
 * Get explorer URL for an object
 */
export function getExplorerObjectUrl(objectId: string, network?: NetworkType): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/object/${objectId}`;
}

/**
 * Get explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, network?: NetworkType): string {
  const config = getNetworkConfig(network);
  return `${config.explorerUrl}/address/${address}`;
}

// ===========================================
// Module Constants
// ===========================================

/**
 * Trade Hub module name
 */
export const TRADE_HUB_MODULE = 'trade_hub';

/**
 * Trade Terminal module name
 */
export const TRADE_TERMINAL_MODULE = 'trade_terminal';

/**
 * Move function names
 */
export const FUNCTIONS = {
  LIST_ITEM: 'list_item',
  BUY_ITEM: 'buy_item',
  CANCEL_LISTING: 'cancel_listing',
} as const;

/**
 * Trade Terminal function names
 */
export const TERMINAL_FUNCTIONS = {
  REGISTER: 'register_terminal',
  SYNC_ITEM: 'sync_item_from_ssu',
  LIST_THROUGH: 'list_item_through_terminal',
  TOGGLE: 'toggle_terminal',
} as const;

/**
 * Event types emitted by the contract
 */
export const EVENT_TYPES = {
  ITEM_LISTED: 'ItemListed',
  ITEM_SOLD: 'ItemSold',
  LISTING_CANCELLED: 'ListingCancelled',
  TRADE_HUB_CREATED: 'TradeHubCreated',
} as const;

/**
 * Debug mode flag
 */
export const DEBUG_MODE = import.meta.env.VITE_DEBUG === 'true';

/**
 * Log debug message if debug mode is enabled
 */
export function debugLog(...args: unknown[]): void {
  if (DEBUG_MODE) {
    console.log('[Frontier Trade Hub]', ...args);
  }
}
