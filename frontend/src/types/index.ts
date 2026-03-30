/**
 * Frontier Trade Hub - Type Definitions
 * 
 * Contains all TypeScript interfaces and types used throughout the application
 */

// ===========================================
// Listing Types
// ===========================================

/**
 * Represents a marketplace listing
 */
export interface Listing {
  /** Unique listing identifier */
  listingId: string;
  /** In-game item ID */
  itemId: string;
  /** Human-readable item name */
  itemName: string;
  /** Quantity of items */
  quantity: number;
  /** Price in SUI (MIST - smallest unit) */
  price: bigint;
  /** Seller's wallet address */
  seller: string;
  /** Unix timestamp when listing was created (ms) */
  timestamp: number;
  /** Whether the listing is still active */
  isActive: boolean;
}

/**
 * Listing status enum
 */
export type ListingStatus = 'active' | 'sold' | 'cancelled';

/**
 * Form data for creating a new listing
 */
export interface CreateListingForm {
  itemId: string;
  itemName: string;
  quantity: number;
  price: string; // String to handle decimal input
}

// ===========================================
// Trade Hub Types
// ===========================================

/**
 * Trade hub statistics
 */
export interface TradeHubStats {
  /** Total trading volume in SUI */
  totalVolume: bigint;
  /** Total number of completed trades */
  totalTrades: number;
  /** Total listings ever created */
  totalListings: number;
  /** Current fee in basis points */
  feeBps: number;
}

/**
 * Trade hub configuration
 */
export interface TradeHubConfig {
  /** Package ID of the deployed contract */
  packageId: string;
  /** Object ID of the shared TradeHub */
  tradeHubObjectId: string;
  /** Current network */
  network: 'utopia' | 'stillness' | 'devnet';
}

// ===========================================
// Event Types
// ===========================================

/**
 * Base event interface
 */
export interface BaseEvent {
  timestamp: number;
  txDigest: string;
}

/**
 * ItemListed event data
 */
export interface ItemListedEvent extends BaseEvent {
  type: 'ItemListed';
  listingId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: bigint;
  seller: string;
}

/**
 * ItemSold event data
 */
export interface ItemSoldEvent extends BaseEvent {
  type: 'ItemSold';
  listingId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: bigint;
  seller: string;
  buyer: string;
}

/**
 * ListingCancelled event data
 */
export interface ListingCancelledEvent extends BaseEvent {
  type: 'ListingCancelled';
  listingId: string;
  itemId: string;
  seller: string;
}

/**
 * Union type for all events
 */
export type TradeHubEvent = ItemListedEvent | ItemSoldEvent | ListingCancelledEvent;

// ===========================================
// Wallet Types
// ===========================================

/**
 * Wallet connection state
 */
export interface WalletState {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Connected wallet address */
  address: string | null;
  /** Wallet balance in SUI */
  balance: bigint;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Connection error message */
  error: string | null;
}

// ===========================================
// UI Types
// ===========================================

/**
 * Tab options for the marketplace
 */
export type MarketplaceTab = 'all' | 'my-listings' | 'create';

/**
 * Sort options for listings
 */
export interface SortOptions {
  field: 'price' | 'timestamp' | 'quantity';
  direction: 'asc' | 'desc';
}

/**
 * Filter options for listings
 */
export interface FilterOptions {
  minPrice?: bigint;
  maxPrice?: bigint;
  itemName?: string;
  seller?: string;
}

/**
 * Toast notification type
 */
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

// ===========================================
// API Response Types
// ===========================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  digest: string;
  status: 'success' | 'failure';
  effects?: Record<string, unknown>;
}

// ===========================================
// Constants
// ===========================================

/** 1 SUI = 1,000,000,000 MIST */
export const MIST_PER_SUI = 1_000_000_000n;

/** Default transaction gas budget */
export const DEFAULT_GAS_BUDGET = 10_000_000n;

/** Sui Clock object ID (shared) */
export const SUI_CLOCK_OBJECT_ID = '0x6';