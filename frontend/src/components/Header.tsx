/**
 * Frontier Trade Hub - Header Component (v0 design)
 */

import { ConnectButton } from '@mysten/dapp-kit';
import { Rocket, Wallet } from 'lucide-react';
import { MarketplaceTab } from '@/types';
import { formatSui, truncateAddress, cn } from '@/utils/format';
import { getNetworkConfig } from '@/utils/config';

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

const tabs: { id: MarketplaceTab; label: string; badge?: string }[] = [
  { id: 'all', label: 'All Listings' },
  { id: 'my-listings', label: 'My Listings' },
  { id: 'create', label: 'Create Listing' },
  { id: 'terminals', label: 'Smart Terminals', badge: 'EVE' },
];

export default function Header({ wallet, activeTab, onTabChange }: HeaderProps) {
  const networkConfig = getNetworkConfig();

  return (
    <header className="bg-[#0d1117] border-b border-[#21262d] sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-14 gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-cyber flex items-center justify-center shadow-cyber">
              <Rocket className="w-5 h-5 text-[#0d1117]" />
            </div>
            <span className="text-sm font-bold tracking-widest">
              <span className="text-cyber-400">FRONTIER</span>{' '}
              <span className="text-white">TRADE HUB</span>
            </span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center flex-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 h-14 text-sm font-medium transition-all border-b-2 whitespace-nowrap',
                    isActive
                      ? 'border-cyber-400 text-white'
                      : 'border-transparent text-[#7d8590] hover:text-[#c9d1d9]'
                  )}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Network + Wallet */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Network indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-orange/10 border border-neon-orange/30 rounded-full text-xs text-neon-orange font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-orange" />
              {networkConfig.displayName}
            </div>

            {/* Wallet display */}
            {wallet.isConnected && wallet.address ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-lg">
                <div className="w-6 h-6 rounded bg-cyber-400/20 flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5 text-cyber-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-cyber-400 leading-tight">{formatSui(wallet.balance)} SUI</p>
                  <p className="text-[10px] text-[#7d8590] font-mono leading-tight">{truncateAddress(wallet.address)}</p>
                </div>
              </div>
            ) : null}

            <ConnectButton connectText="Connect Wallet" className="!text-xs" />
          </div>

        </div>
      </div>
    </header>
  );
}
