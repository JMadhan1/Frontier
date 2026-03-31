/**
 * Frontier Trade Hub - Dashboard Component (v0 design)
 */

import { TrendingUp, ArrowLeftRight, LayoutGrid, Percent } from 'lucide-react';
import { TradeHubStats } from '@/types';
import { formatSui, formatNumber } from '@/utils/format';

interface DashboardProps {
  stats: TradeHubStats | null;
  isLoading: boolean;
  isMockData?: boolean;
  lastUpdated?: Date | null;
}

export default function Dashboard({ stats, isLoading, isMockData, lastUpdated }: DashboardProps) {
  const cards = [
    {
      icon: TrendingUp,
      label: 'TOTAL VOLUME',
      value: stats ? `${formatSui(stats.totalVolume)} SUI` : '0 SUI',
      iconBg: 'bg-cyber-400/15',
      iconColor: 'text-cyber-400',
    },
    {
      icon: ArrowLeftRight,
      label: 'COMPLETED TRADES',
      value: stats ? formatNumber(stats.totalTrades) : '0',
      iconBg: 'bg-neon-green/15',
      iconColor: 'text-neon-green',
    },
    {
      icon: LayoutGrid,
      label: 'TOTAL LISTINGS',
      value: stats ? formatNumber(stats.totalListings) : '0',
      iconBg: 'bg-neon-purple/15',
      iconColor: 'text-neon-purple',
    },
    {
      icon: Percent,
      label: 'TRADING FEE',
      value: stats ? `${(stats.feeBps / 100).toFixed(1)}%` : '1%',
      iconBg: 'bg-neon-orange/15',
      iconColor: 'text-neon-orange',
    },
  ];

  return (
    <div className="flex items-stretch gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex-1 flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 min-w-0"
          >
            <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
              <Icon className={card.iconColor} style={{ width: 18, height: 18 }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#7d8590] tracking-wider uppercase mb-1">
                {card.label}
              </p>
              {isLoading ? (
                <div className="h-6 w-16 bg-[#21262d] rounded animate-pulse" />
              ) : (
                <p className="text-xl font-bold text-white truncate">{card.value}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Demo / Live indicator */}
      <div className="flex flex-col items-center justify-center px-3 shrink-0">
        {isMockData ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-orange/10 border border-neon-orange/30 rounded-full whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-orange animate-pulse" />
            <span className="text-xs text-neon-orange font-medium">Demo mode</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-green/10 border border-neon-green/30 rounded-full whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-neon-green font-medium">Live</span>
          </div>
        )}
        {lastUpdated && (
          <p className="text-[10px] text-[#7d8590] mt-1">{lastUpdated.toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );
}
