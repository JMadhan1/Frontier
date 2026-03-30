/**
 * Frontier Trade Hub - Wallet Hook
 * 
 * Custom hook for managing Sui wallet connection and balance
 */

import { useCallback, useEffect, useState } from 'react';
import {
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSuiClient,
  useConnectWallet,
  useWallets,
} from '@mysten/dapp-kit';
import { WalletState } from '@/types';
import { debugLog } from '@/utils/config';

/**
 * Hook for managing wallet connection state and operations
 */
export function useWallet() {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { currentWallet, connectionStatus } = useCurrentWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect, isPending: isConnecting } = useConnectWallet();
  const wallets = useWallets();

  const [balance, setBalance] = useState<bigint>(0n);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!currentAccount?.address) {
      setBalance(0n);
      return;
    }

    try {
      const response = await client.getBalance({
        owner: currentAccount.address,
        coinType: '0x2::sui::SUI',
      });
      setBalance(BigInt(response.totalBalance));
      setError(null);
      debugLog('Balance fetched:', response.totalBalance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setError('Failed to fetch wallet balance');
    }
  }, [client, currentAccount?.address]);

  // Refresh balance on account change
  useEffect(() => {
    fetchBalance();
    
    // Set up polling for balance updates
    const interval = setInterval(fetchBalance, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchBalance]);

  // Connect to a specific wallet
  const connectWallet = useCallback((walletName?: string) => {
    const wallet = walletName 
      ? wallets.find(w => w.name === walletName)
      : wallets[0];
      
    if (wallet) {
      connect({ wallet });
    } else {
      setError('No wallet found');
    }
  }, [wallets, connect]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect();
    setBalance(0n);
    setError(null);
  }, [disconnect]);

  // Build wallet state object
  const walletState: WalletState = {
    isConnected: connectionStatus === 'connected',
    address: currentAccount?.address || null,
    balance,
    isConnecting,
    error,
  };

  return {
    ...walletState,
    currentWallet,
    wallets,
    connect: connectWallet,
    disconnect: disconnectWallet,
    refreshBalance: fetchBalance,
  };
}

export default useWallet;