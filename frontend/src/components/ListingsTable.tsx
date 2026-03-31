/**
 * Frontier Trade Hub - Listings Table (v0 design)
 *
 * Dark table with category filter pills, search, sort dropdown, pagination.
 */

import { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, ChevronDown, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Listing } from '@/types';
import { formatSui, truncateAddress, formatRelativeTime, cn } from '@/utils/format';
import { EVE_CATEGORIES } from '@/data/eve-items';

interface ListingsTableProps {
  listings: Listing[];
  isLoading: boolean;
  currentAddress: string | null;
  onBuyClick: (listing: Listing) => void;
  onRefresh: () => void;
}

const PAGE_SIZE = 8;

type SortField = 'timestamp' | 'price' | 'quantity';
type SortDir = 'asc' | 'desc';

// Map itemId → category name + icon + base price
const itemMeta = new Map<string, { category: string; icon: string; basePrice: number }>();
for (const cat of EVE_CATEGORIES) {
  for (const item of cat.items) {
    itemMeta.set(item.id, { category: cat.name, icon: item.icon, basePrice: item.basePrice });
  }
}

function getCategoryIcon(catName: string) {
  switch (catName.toLowerCase()) {
    case 'minerals': return '💎';
    case 'ore': return '⛏️';
    case 'ships': return '🚀';
    case 'modules': return '⚙️';
    case 'consumables': return '💊';
    default: return '📦';
  }
}

export default function ListingsTable({
  listings,
  isLoading,
  currentAddress,
  onBuyClick,
}: ListingsTableProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [, setHoveredRow] = useState<string | null>(null);

  // Build category list from current listings
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of listings) {
      const meta = itemMeta.get(l.itemId);
      const cat = meta?.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, icon: getCategoryIcon(name) }))
      .sort((a, b) => b.count - a.count);
  }, [listings]);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = listings.filter((l) => {
      const matchesSearch =
        !search ||
        l.itemName.toLowerCase().includes(search.toLowerCase()) ||
        l.itemId.toLowerCase().includes(search.toLowerCase()) ||
        l.seller.toLowerCase().includes(search.toLowerCase());

      const matchesCat =
        activeCategory === 'all' ||
        (itemMeta.get(l.itemId)?.category || 'Other') === activeCategory;

      return matchesSearch && matchesCat;
    });

    result = [...result].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'price') return Number(a.price - b.price) * mul;
      if (sortField === 'quantity') return (a.quantity - b.quantity) * mul;
      return (a.timestamp - b.timestamp) * mul;
    });

    return result;
  }, [listings, search, activeCategory, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const setSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
    setPage(1);
  };

  const sortLabel = sortField === 'price' ? 'Price' : sortField === 'quantity' ? 'Qty' : 'Time';

  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d8590]" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search items, IDs, or addresses..."
            className="w-full bg-[#161b22] border border-[#30363d] text-[#c9d1d9] placeholder-[#7d8590] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyber-400 transition-colors"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => { setActiveCategory('all'); setPage(1); }}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
              activeCategory === 'all'
                ? 'bg-cyber-400/20 text-cyber-400 border-cyber-400/40'
                : 'bg-[#161b22] text-[#7d8590] border-[#30363d] hover:text-[#c9d1d9]'
            )}
          >
            All
            <span className={cn(
              'text-[10px] px-1.5 rounded-full',
              activeCategory === 'all' ? 'bg-cyber-400/20 text-cyber-400' : 'bg-[#21262d] text-[#7d8590]'
            )}>
              {listings.length}
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setActiveCategory(cat.name); setPage(1); }}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border whitespace-nowrap',
                activeCategory === cat.name
                  ? 'bg-cyber-400/20 text-cyber-400 border-cyber-400/40'
                  : 'bg-[#161b22] text-[#7d8590] border-[#30363d] hover:text-[#c9d1d9]'
              )}
            >
              <span>{cat.icon}</span>
              {cat.name}
              <span className={cn(
                'text-[10px] px-1.5 rounded-full',
                activeCategory === cat.name ? 'bg-cyber-400/20 text-cyber-400' : 'bg-[#21262d] text-[#7d8590]'
              )}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <button
          onClick={() => {
            const fields: SortField[] = ['timestamp', 'price', 'quantity'];
            const next = fields[(fields.indexOf(sortField) + 1) % fields.length];
            setSortField(next);
            setPage(1);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#7d8590] hover:text-[#c9d1d9] transition-colors shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
          Sort: {sortLabel}
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#21262d]">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#7d8590] tracking-wider uppercase">Item Name</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#7d8590] tracking-wider uppercase">Item ID</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#7d8590] tracking-wider uppercase cursor-pointer hover:text-[#c9d1d9]" onClick={() => setSort('quantity')}>QTY</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-[#7d8590] tracking-wider uppercase cursor-pointer hover:text-[#c9d1d9]" onClick={() => setSort('price')}>PRICE</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#7d8590] tracking-wider uppercase">SELLER</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-[#7d8590] tracking-wider uppercase cursor-pointer hover:text-[#c9d1d9]" onClick={() => setSort('timestamp')}>TIME</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#21262d]">
                  {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-4 bg-[#21262d] rounded animate-pulse" style={{ width: `${40 + (j * 13) % 50}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-[#7d8590]">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p>No listings found</p>
                </td>
              </tr>
            ) : (
              paginated.map((listing) => {
                const meta = itemMeta.get(listing.itemId);
                const isOwn = currentAddress === listing.seller;
                const priceSui = Number(listing.price) / 1e9;
                const isUp = meta ? priceSui <= meta.basePrice * 1.2 : true;

                return (
                  <tr
                    key={listing.listingId}
                    className="border-b border-[#21262d] last:border-0 hover:bg-[#1c2128] transition-colors group"
                    onMouseEnter={() => setHoveredRow(listing.listingId)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Item Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#21262d] flex items-center justify-center text-base shrink-0">
                          {meta?.icon || '📦'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#e6edf3]">{listing.itemName}</p>
                          <p className="text-[11px] text-[#7d8590]">{meta?.category || 'Unknown'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Item ID */}
                    <td className="px-4 py-3.5">
                      <span className="text-[#7d8590] font-mono text-xs">
                        {listing.itemId.length > 10
                          ? `${listing.itemId.slice(0, 6)}..${listing.itemId.slice(-4)}`
                          : listing.itemId}
                      </span>
                    </td>

                    {/* QTY */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-[#c9d1d9]">{listing.quantity.toLocaleString()}</span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isUp ? (
                          <TrendingUp className="w-3 h-3 text-neon-green" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-neon-red" />
                        )}
                        <span className={cn('font-bold', isUp ? 'text-neon-green' : 'text-neon-red')}>
                          {formatSui(listing.price)}
                        </span>
                        <span className="text-[#7d8590] text-xs">SUI</span>
                      </div>
                    </td>

                    {/* Seller */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-[#7d8590]">
                        {truncateAddress(listing.seller)}
                        {isOwn && <span className="ml-1 text-cyber-400">(You)</span>}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[#7d8590]">{formatRelativeTime(listing.timestamp)}</span>
                    </td>

                    {/* Buy button (visible on hover) */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => onBuyClick(listing)}
                        disabled={isOwn || !currentAddress}
                        className={cn(
                          'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          isOwn || !currentAddress
                            ? 'opacity-0 group-hover:opacity-30 bg-[#21262d] text-[#7d8590] cursor-not-allowed'
                            : 'opacity-0 group-hover:opacity-100 bg-cyber-400 text-[#0d1117] hover:bg-cyber-500'
                        )}
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Footer: count + pagination */}
        {!isLoading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#21262d]">
            <span className="text-xs text-[#7d8590]">{filtered.length} listings found</span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded border border-[#30363d] text-[#7d8590] hover:text-[#c9d1d9] hover:border-[#7d8590] disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded border text-xs font-medium transition-colors',
                      page === p
                        ? 'bg-cyber-400 border-cyber-400 text-[#0d1117]'
                        : 'border-[#30363d] text-[#7d8590] hover:text-[#c9d1d9] hover:border-[#7d8590]'
                    )}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded border border-[#30363d] text-[#7d8590] hover:text-[#c9d1d9] hover:border-[#7d8590] disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
