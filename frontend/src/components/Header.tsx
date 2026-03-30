/**
 * Frontier Trade Hub - Header Component
 * 
 * Navigation header with branding, tabs, and wallet connection
 */

import { ConnectButton } from '@mysten/dapp-kit';
import { Rocket, LayoutDashboard, List, PlusCircle, RefreshCw } from 'lucide-react';
import { MarketplaceTab } from '@/types';
import { formatSui, truncateAddress, cn } from '@/utils/format';
import { getCurrentNetwork, getNetworkConfig } from '@/utils/config';

interface HeaderProps {
  wallet: {
    isConnected: boolean;
    address: string | null;
    balance: bigint;
    isConnecting: boolean;
  };
  activeTab: MarketplaceTab;
  onTabChange: (tab: MarketplaceTab) => void;
}

const tabs: { id: MarketplaceTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'all', label: 'All Listings', icon: LayoutDashboard },
  { id: 'my-listings', label: 'My Listings', icon: List },
  { id: 'create', label: 'Create Listing', icon: PlusCircle },
];

export default function Header({ wallet, activeTab, onTabChange }: HeaderProps) {
  const network = getCurrentNetwork();
  const networkConfig = getNetworkConfig();

  return (
    <header className="border-b border-space-600 bg-space-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo and branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center shadow-cyber">
                <Rocket className="w-7 h-7 text-space-900" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-green rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-space text-gradient-cyber">
                FRONTIER TRADE HUB
              </h1>
              <p className="text-xs text-gray-500">
                Decentralized Marketplace for EVE Frontier
              </p>
            </div>
          </div>

          {/* Right side - Network badge and wallet */}
          <div className="flex items-center gap-4">
            {/* Network indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-space-800 rounded-full border border-space-600">
              <div className={cn(
                'w-2 h-2 rounded-full',
                network === 'stillness' ? 'bg-neon-green' : 'bg-neon-orange'
              )} />
              <span className="text-xs text-gray-400 font-medium">
                {networkConfig.displayName}
              </span>
            </div>

            {/* Wallet info */}
            {wallet.isConnected && wallet.address && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-space-800/50 rounded-lg border border-space-600">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="text-sm font-semibold text-cyber-400">
                    {formatSui(wallet.balance)} SUI
                  </p>
                </div>
                <div className="w-px h-8 bg-space-600" />
                <div className="text-right">
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-mono text-gray-300">
                    {truncateAddress(wallet.address)}
                  </p>
                </div>
              </div>
            )}

            {/* Connect button */}
            <ConnectButton
              connectText="Connect Wallet"
              className="btn-cyber"
            />
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200',
                  'border-b-2 -mb-px whitespace-nowrap',
                  isActive
                    ? 'border-cyber-400 text-cyber-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-space-500'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}

          {/* Refresh button */}
          <button
            onClick={() => window.location.reload()}
            className="ml-auto flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-cyber-400 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}