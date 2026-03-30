/**
 * Frontier Trade Hub - Main Entry Point
 *
 * Initializes the React application with all necessary providers:
 * - Sui Wallet Provider for blockchain connectivity
 * - React Query for data fetching
 * - React Router for navigation
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import '@mysten/dapp-kit/dist/index.css';

// Initialize React Query client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

// Network configuration for EVE Frontier
// Utopia = Testnet, Stillness = Mainnet
const networks = {
  utopia: {
    url: import.meta.env.VITE_SUI_RPC_UTOPIA || 'https://fullnode.testnet.sui.io',
  },
  stillness: {
    url: import.meta.env.VITE_SUI_RPC_STILLNESS || 'https://fullnode.mainnet.sui.io',
  },
  // Fallback to Sui testnet for development
  devnet: {
    url: import.meta.env.VITE_SUI_RPC_DEVNET || 'https://fullnode.testnet.sui.io:443',
  },
};

// Get current network from environment, default to devnet (testnet)
const currentNetwork = (import.meta.env.VITE_NETWORK as keyof typeof networks) || 'devnet';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={currentNetwork}>
        <WalletProvider autoConnect>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
