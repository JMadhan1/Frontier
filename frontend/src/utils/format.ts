/**
 * Frontier Trade Hub - Formatting Utilities
 * 
 * Helper functions for formatting values throughout the application
 */

import { MIST_PER_SUI } from '@/types';

/**
 * Format MIST amount to SUI with specified decimal places
 * @param mist Amount in MIST (smallest unit)
 * @param decimals Number of decimal places to show
 * @returns Formatted string representation
 */
export function formatSui(mist: bigint, decimals: number = 4): string {
  const sui = Number(mist) / Number(MIST_PER_SUI);
  return sui.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse SUI amount string to MIST
 * @param sui Amount in SUI as string
 * @returns Amount in MIST as bigint
 */
export function parseSuiToMist(sui: string): bigint {
  const amount = parseFloat(sui);
  if (isNaN(amount) || amount < 0) {
    throw new Error('Invalid SUI amount');
  }
  return BigInt(Math.floor(amount * Number(MIST_PER_SUI)));
}

/**
 * Truncate wallet address for display
 * @param address Full wallet address
 * @param startChars Number of characters to show at start
 * @param endChars Number of characters to show at end
 * @returns Truncated address string
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format timestamp to human-readable date string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param timestamp Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  return 'Just now';
}

/**
 * Format large numbers with abbreviations
 * @param num Number to format
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format listing ID for display
 * @param listingId Full listing ID
 * @returns Formatted listing ID
 */
export function formatListingId(listingId: string): string {
  return `#${listingId.padStart(6, '0')}`;
}

/**
 * Validate Sui address format
 * @param address Address to validate
 * @returns Whether address is valid
 */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise resolving when copy is complete
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Class name utility for conditional classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}