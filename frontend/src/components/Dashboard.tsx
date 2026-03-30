/**
 * Frontier Trade Hub - Dashboard Component
 * 
 * Displays marketplace statistics and key metrics
 */

import { Activity, ShoppingBag, TrendingUp, Percent } from 'lucide-react';
import { TradeHubStats } from '@/types';
import { formatSui, formatNumber, cn } from '@/utils/format';

interface DashboardProps {
  stats: TradeHubStats | null;
  isLoading: boolean;
}

interface StatCardProps {
  icon: typeof Activity;
  label: string;
  value: string;
  subValue?: string;
  color: 'cyber' | 'green' | 'orange' | 'purple';
  isLoading?: boolean;
}

const colorClasses = {
  cyber: 'text-cyber-400 bg-cyber-400/10 border-cyber-400/30',
  green: 'text-neon-green bg-neon-green/10 border-neon-green/30',
  orange: 'text-neon-orange bg-neon-orange/10 border-neon-orange/30',
  purple: 'text-neon-purple bg-neon-purple/10 border-neon-purple/30',
};

function StatCard({ icon: Icon, label, value, subValue, color, isLoading }: StatCardProps) {
  return (
    <div className="card group">
      <div className="flex items-start justify-between">
        <div className={cn(
          'p-3 rounded-xl border transition-all duration-300',
          colorClasses[color],
          'group-hover:shadow-cyber'
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="mt-4">
        {isLoading ? (
          <div className="skeleton h-8 w-24 mb-1" />
        ) : (
          <p className={cn('text-2xl font-bold font-space', `text-${color === 'cyber' ? 'cyber-400' : `neon-${color}`}`)}>
            {value}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">{label}</p>
        {subValue && (
          <p className="text-xs text-gray-500 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({ stats, isLoading }: DashboardProps) {
  const totalVolume = stats ? formatSui(stats.totalVolume) : '0';
  const totalTrades = stats ? formatNumber(stats.totalTrades) : '0';
  const totalListings = stats ? formatNumber(stats.totalListings) : '0';
  const feePct = stats ? (stats.feeBps / 100).toFixed(1) : '1.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={TrendingUp}
        label="Total Volume"
        value={`${totalVolume} SUI`}
        subValue="All-time trading volume"
        color="cyber"
        isLoading={isLoading}
      />
      
      <StatCard
        icon={ShoppingBag}
        label="Completed Trades"
        value={totalTrades}
        subValue="Successful transactions"
        color="green"
        isLoading={isLoading}
      />
      
      <StatCard
        icon={Activity}
        label="Total Listings"
        value={totalListings}
        subValue="Items ever listed"
        color="orange"
        isLoading={isLoading}
      />
      
      <StatCard
        icon={Percent}
        label="Trading Fee"
        value={`${feePct}%`}
        subValue="Platform fee per trade"
        color="purple"
        isLoading={isLoading}
      />
    </div>
  );
}