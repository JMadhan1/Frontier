/**
 * Frontier Trade Hub - Trade Hub Hook
 * 
 * Custom hook for interacting with the TradeHub smart contract
 */

import { useCallback, useEffect, useState } from 'react';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Listing, TradeHubStats, CreateListingForm, StoredTerminal, SUI_CLOCK_OBJECT_ID, DEFAULT_GAS_BUDGET } from '@/types';
import { parseSuiToMist } from '@/utils/format';
import { getTradeHubConfig, TRADE_HUB_MODULE, TRADE_TERMINAL_MODULE, FUNCTIONS, TERMINAL_FUNCTIONS, debugLog } from '@/utils/config';

/**
 * Hook for interacting with the TradeHub contract
 */
export function useTradeHub() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending: isTransactionPending } = useSignAndExecuteTransaction();

  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<TradeHubStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [terminals, setTerminals] = useState<StoredTerminal[]>([]);

  const config = getTradeHubConfig();

  /**
   * Fetch all active listings from the contract
   */
  const fetchListings = useCallback(async () => {
    if (config.tradeHubObjectId === '0x0') {
      debugLog('TradeHub not deployed yet');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch the TradeHub object
      const tradeHub = await client.getObject({
        id: config.tradeHubObjectId,
        options: {
          showContent: true,
        },
      });

      if (!tradeHub.data?.content || tradeHub.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid TradeHub object');
      }

      const fields = tradeHub.data.content.fields as Record<string, unknown>;
      
      // Parse active listing IDs — Sui returns vector<u64> as plain array OR wrapped object
      const rawIds = fields.active_listing_ids;
      const activeIds: string[] = Array.isArray(rawIds)
        ? (rawIds as string[])
        : (rawIds as { fields: { contents: string[] } })?.fields?.contents ?? [];
      
      // Fetch each listing
      const listingPromises = activeIds.map(async (id: string) => {
        const listingData = await client.getDynamicFieldObject({
          parentId: (fields.listings as { fields: { id: { id: string } } }).fields.id.id,
          name: {
            type: 'u64',
            value: id,
          },
        });

        if (listingData.data?.content && listingData.data.content.dataType === 'moveObject') {
          const listingFields = (listingData.data.content.fields as Record<string, unknown>).value as Record<string, unknown>;
          // item_id and item_name are vector<u8> — decode bytes to string
          const decodeBytes = (v: unknown): string => {
            if (Array.isArray(v)) return new TextDecoder().decode(new Uint8Array(v as number[]));
            return String(v);
          };
          return {
            listingId: String(listingFields.listing_id),
            itemId: decodeBytes(listingFields.item_id),
            itemName: decodeBytes(listingFields.item_name),
            quantity: Number(listingFields.quantity),
            price: BigInt(String(listingFields.price ?? '0')),
            seller: String(listingFields.seller),
            timestamp: Number(listingFields.timestamp ?? 0),
            isActive: Boolean(listingFields.is_active),
          } as Listing;
        }
        return null;
      });

      const fetchedListings = (await Promise.all(listingPromises)).filter((l): l is Listing => l !== null);
      setListings(fetchedListings);

      // Parse stats
      setStats({
        totalVolume: BigInt(fields.total_volume as string || '0'),
        totalTrades: Number(fields.total_trades || 0),
        totalListings: Number(fields.listing_counter || 0),
        feeBps: Number(fields.fee_bps || 100),
      });

      setIsMockData(false);
      setLastUpdated(new Date());
      debugLog('Listings fetched:', fetchedListings.length);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Failed to fetch listings:', msg);
      setError(`Failed to fetch: ${msg}`);

      // Use mock data as fallback
      setListings(getMockListings());
      setStats(getMockStats());
      setIsMockData(true);
      setLastUpdated(new Date());
    } finally {
      setIsLoading(false);
    }
  }, [client, config.tradeHubObjectId]);

  /**
   * Create a new listing
   */
  const listItem = useCallback(async (form: CreateListingForm): Promise<string> => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    const price = parseSuiToMist(form.price);
    
    const tx = new Transaction();
    tx.setGasBudget(DEFAULT_GAS_BUDGET);

    tx.moveCall({
      target: `${config.packageId}::${TRADE_HUB_MODULE}::${FUNCTIONS.LIST_ITEM}`,
      arguments: [
        tx.object(config.tradeHubObjectId),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(form.itemId))),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(form.itemName))),
        tx.pure.u64(form.quantity),
        tx.pure.u64(price),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    const result = await signAndExecute({
      transaction: tx as never,
    });

    debugLog('Item listed:', result);
    await fetchListings();
    
    return result.digest;
  }, [currentAccount?.address, config, signAndExecute, fetchListings]);

  /**
   * Purchase a listing
   */
  const buyItem = useCallback(async (listing: Listing): Promise<string> => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    const tx = new Transaction();
    tx.setGasBudget(DEFAULT_GAS_BUDGET);

    // Split coins for payment
    const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(listing.price)]);

    tx.moveCall({
      target: `${config.packageId}::${TRADE_HUB_MODULE}::${FUNCTIONS.BUY_ITEM}`,
      arguments: [
        tx.object(config.tradeHubObjectId),
        tx.pure.u64(BigInt(listing.listingId)),
        payment,
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    const result = await signAndExecute({
      transaction: tx as never,
    });

    debugLog('Item bought:', result);
    await fetchListings();

    return result.digest;
  }, [currentAccount?.address, config, signAndExecute, fetchListings]);

  /**
   * Cancel a listing
   */
  const cancelListing = useCallback(async (listingId: string): Promise<string> => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    const tx = new Transaction();
    tx.setGasBudget(DEFAULT_GAS_BUDGET);

    tx.moveCall({
      target: `${config.packageId}::${TRADE_HUB_MODULE}::${FUNCTIONS.CANCEL_LISTING}`,
      arguments: [
        tx.object(config.tradeHubObjectId),
        tx.pure.u64(BigInt(listingId)),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    const result = await signAndExecute({
      transaction: tx as never,
    });

    debugLog('Listing cancelled:', result);
    await fetchListings();
    
    return result.digest;
  }, [currentAccount?.address, config, signAndExecute, fetchListings]);

  /**
   * Get listings for the current user
   */
  const getMyListings = useCallback((): Listing[] => {
    if (!currentAccount?.address) return [];
    return listings.filter(l => l.seller === currentAccount.address);
  }, [listings, currentAccount?.address]);

  // Load terminals from localStorage when account changes
  useEffect(() => {
    if (!currentAccount?.address) { setTerminals([]); return; }
    try {
      const stored = localStorage.getItem(`terminals_${currentAccount.address}`);
      setTerminals(stored ? JSON.parse(stored) : []);
    } catch { setTerminals([]); }
  }, [currentAccount?.address]);

  // Register a new Trade Terminal from an EVE Frontier Smart Assembly
  const registerTerminal = useCallback(async (assemblyId: string, location: string): Promise<string> => {
    if (!currentAccount?.address) throw new Error('Wallet not connected');

    const tx = new Transaction();
    tx.setGasBudget(DEFAULT_GAS_BUDGET);
    tx.moveCall({
      target: `${config.packageId}::${TRADE_TERMINAL_MODULE}::${TERMINAL_FUNCTIONS.REGISTER}`,
      arguments: [
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(assemblyId))),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(location))),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    const result = await signAndExecute({ transaction: tx as never });

    // Extract created object IDs from transaction effects
    const txDetails = await client.getTransactionBlock({
      digest: result.digest,
      options: { showObjectChanges: true },
    });

    const terminalObj = txDetails.objectChanges?.find(
      (c) => c.type === 'created' && (c as { objectType?: string }).objectType?.includes('TradeTerminal')
    ) as { objectId: string } | undefined;
    const capObj = txDetails.objectChanges?.find(
      (c) => c.type === 'created' && (c as { objectType?: string }).objectType?.includes('TerminalCap')
    ) as { objectId: string } | undefined;

    if (terminalObj && capObj) {
      const newTerminal: StoredTerminal = {
        id: terminalObj.objectId,
        capId: capObj.objectId,
        assemblyId,
        location,
        registeredAt: Date.now(),
      };
      const updated = [...terminals, newTerminal];
      setTerminals(updated);
      localStorage.setItem(`terminals_${currentAccount.address}`, JSON.stringify(updated));
    }

    return result.digest;
  }, [currentAccount?.address, config, signAndExecute, client, terminals]);

  // Sync an in-game item from SSU into the terminal's on-chain inventory
  const syncItemToTerminal = useCallback(async (
    terminalId: string,
    capId: string,
    itemId: string,
    itemName: string,
    quantity: number,
    category: string,
  ): Promise<string> => {
    if (!currentAccount?.address) throw new Error('Wallet not connected');

    const tx = new Transaction();
    tx.setGasBudget(DEFAULT_GAS_BUDGET);
    tx.moveCall({
      target: `${config.packageId}::${TRADE_TERMINAL_MODULE}::${TERMINAL_FUNCTIONS.SYNC_ITEM}`,
      arguments: [
        tx.object(terminalId),
        tx.object(capId),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(itemId))),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(itemName))),
        tx.pure.u64(quantity),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(category))),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    const result = await signAndExecute({ transaction: tx as never });
    return result.digest;
  }, [currentAccount?.address, config, signAndExecute]);

  // List an item from terminal inventory directly onto the marketplace
  const listThroughTerminal = useCallback(async (
    terminalId: string,
    capId: string,
    itemId: string,
    quantity: number,
    priceSui: string,
  ): Promise<string> => {
    if (!currentAccount?.address) throw new Error('Wallet not connected');

    const price = parseSuiToMist(priceSui);
    const tx = new Transaction();
    tx.setGasBudget(DEFAULT_GAS_BUDGET);
    tx.moveCall({
      target: `${config.packageId}::${TRADE_TERMINAL_MODULE}::${TERMINAL_FUNCTIONS.LIST_THROUGH}`,
      arguments: [
        tx.object(terminalId),
        tx.object(config.tradeHubObjectId),
        tx.object(capId),
        tx.pure.vector('u8', Array.from(new TextEncoder().encode(itemId))),
        tx.pure.u64(quantity),
        tx.pure.u64(price),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    const result = await signAndExecute({ transaction: tx as never });
    await fetchListings();
    return result.digest;
  }, [currentAccount?.address, config, signAndExecute, fetchListings]);

  // Fetch listings on mount and account change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Auto-refresh listings every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => { fetchListings(); }, 15000);
    return () => clearInterval(interval);
  }, [fetchListings]);

  return {
    listings,
    myListings: getMyListings(),
    stats,
    isLoading,
    isTransactionPending,
    error,
    isMockData,
    lastUpdated,
    terminals,
    fetchListings,
    listItem,
    buyItem,
    cancelListing,
    registerTerminal,
    syncItemToTerminal,
    listThroughTerminal,
  };
}

// ===========================================
// Mock Data (for development without deployed contract)
// ===========================================

function getMockListings(): Listing[] {
  return [
    {
      listingId: '0',
      itemId: 'TRIT_001',
      itemName: 'Tritanium Ore',
      quantity: 1000,
      price: 500000000n, // 0.5 SUI
      seller: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      timestamp: Date.now() - 3600000,
      isActive: true,
    },
    {
      listingId: '1',
      itemId: 'PYER_001',
      itemName: 'Pyerite',
      quantity: 500,
      price: 1200000000n, // 1.2 SUI
      seller: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      timestamp: Date.now() - 7200000,
      isActive: true,
    },
    {
      listingId: '2',
      itemId: 'MEXA_001',
      itemName: 'Mexallon',
      quantity: 200,
      price: 2500000000n, // 2.5 SUI
      seller: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
      timestamp: Date.now() - 1800000,
      isActive: true,
    },
    {
      listingId: '3',
      itemId: 'ISO_001',
      itemName: 'Isogen',
      quantity: 100,
      price: 5000000000n, // 5 SUI
      seller: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
      timestamp: Date.now() - 600000,
      isActive: true,
    },
    {
      listingId: '4',
      itemId: 'NOCX_001',
      itemName: 'Nocxium',
      quantity: 50,
      price: 10000000000n, // 10 SUI
      seller: '0xffffeeeeddddccccbbbbaaaa0000999988887777666655554444333322221111',
      timestamp: Date.now() - 300000,
      isActive: true,
    },
  ];
}

function getMockStats(): TradeHubStats {
  return {
    totalVolume: 125000000000n, // 125 SUI
    totalTrades: 47,
    totalListings: 89,
    feeBps: 100,
  };
}

export default useTradeHub;