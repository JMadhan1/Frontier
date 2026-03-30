/**
 * Frontier Trade Hub - Listings Table Component
 * 
 * Displays all active marketplace listings with buy functionality
 */

import { useState } from 'react';
import { Search, RefreshCw, ExternalLink, ShoppingCart, ArrowUpDown } from 'lucide-react';
import { Listing, SortOptions } from '@/types';
import { formatSui, truncateAddress, formatRelativeTime, formatListingId, cn } from '@/utils/format';
import { getExplorerAddressUrl } from '@/utils/config';

interface ListingsTableProps {
  listings: Listing[];
  isLoading: boolean;
  currentAddress: string | null;
  onBuyClick: (listing: Listing) => void;
  onRefresh: () => void;
}

export default function ListingsTable({
  listings,
  isLoading,
  currentAddress,
  onBuyClick,
  onRefresh,
}: ListingsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'timestamp',
    direction: 'desc',
  });

  // Filter and sort listings
  const filteredListings = listings
    .filter((listing) =>
      listing.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.itemId.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const multiplier = sortOptions.direction === 'asc' ? 1 : -1;
      switch (sortOptions.field) {
        case 'price':
          return Number(a.price - b.price) * multiplier;
        case 'quantity':
          return (a.quantity - b.quantity) * multiplier;
        case 'timestamp':
        default:
          return (a.timestamp - b.timestamp) * multiplier;
      }
    });

  // Toggle sort
  const toggleSort = (field: SortOptions['field']) => {
    setSortOptions((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Sort indicator
  const SortIndicator = ({ field }: { field: SortOptions['field'] }) => (
    <ArrowUpDown
      className={cn(
        'w-3 h-3 ml-1 transition-colors',
        sortOptions.field === field ? 'text-cyber-400' : 'text-gray-500'
      )}
    />
  );

  return (
    <div className="card">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-space text-gray-100">
            Active Listings
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {filteredListings.length} items available for purchase
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-cyber pl-10 w-64"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-secondary !px-3"
            title="Refresh listings"
          >
            <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-cyber">
          <thead>
            <tr>
              <th>Listing ID</th>
              <th>Item</th>
              <th>
                <button
                  onClick={() => toggleSort('quantity')}
                  className="flex items-center hover:text-cyber-400 transition-colors"
                >
                  Quantity
                  <SortIndicator field="quantity" />
                </button>
              </th>
              <th>
                <button
                  onClick={() => toggleSort('price')}
                  className="flex items-center hover:text-cyber-400 transition-colors"
                >
                  Price
                  <SortIndicator field="price" />
                </button>
              </th>
              <th>Seller</th>
              <th>
                <button
                  onClick={() => toggleSort('timestamp')}
                  className="flex items-center hover:text-cyber-400 transition-colors"
                >
                  Listed
                  <SortIndicator field="timestamp" />
                </button>
              </th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}>
                      <div className="skeleton h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredListings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingCart className="w-12 h-12 text-gray-600" />
                    <p>No listings found</p>
                    {searchTerm && (
                      <p className="text-sm">Try adjusting your search</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredListings.map((listing) => {
                const isOwnListing = currentAddress === listing.seller;
                
                return (
                  <tr key={listing.listingId}>
                    <td>
                      <span className="font-mono text-cyber-400">
                        {formatListingId(listing.listingId)}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-200">
                          {listing.itemName}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {listing.itemId}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono">
                        {listing.quantity.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold text-neon-green">
                        {formatSui(listing.price)} SUI
                      </span>
                    </td>
                    <td>
                      <a
                        href={getExplorerAddressUrl(listing.seller)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-400 hover:text-cyber-400 transition-colors"
                      >
                        <span className="font-mono">
                          {truncateAddress(listing.seller)}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {isOwnListing && (
                        <span className="text-xs text-cyber-400">(You)</span>
                      )}
                    </td>
                    <td>
                      <span className="text-gray-400">
                        {formatRelativeTime(listing.timestamp)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => onBuyClick(listing)}
                        disabled={isOwnListing || !currentAddress}
                        className={cn(
                          'btn-cyber !px-4 !py-2 text-sm',
                          (isOwnListing || !currentAddress) && 'opacity-50 cursor-not-allowed'
                        )}
                        title={
                          !currentAddress
                            ? 'Connect wallet to buy'
                            : isOwnListing
                            ? "You can't buy your own listing"
                            : 'Buy this item'
                        }
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
      </div>
    </div>
  );
}