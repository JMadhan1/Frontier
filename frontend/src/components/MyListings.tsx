/**
 * Frontier Trade Hub - My Listings Component
 * 
 * Displays the current user's active listings with cancel functionality
 */

import { useState } from 'react';
import { Package, Trash2, AlertTriangle, Wallet } from 'lucide-react';
import { Listing } from '@/types';
import { formatSui, formatRelativeTime, formatListingId, cn } from '@/utils/format';

interface MyListingsProps {
  listings: Listing[];
  isLoading: boolean;
  isTransactionPending: boolean;
  onCancelListing: (listingId: string) => Promise<void>;
}

export default function MyListings({
  listings,
  isLoading,
  isTransactionPending,
  onCancelListing,
}: MyListingsProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  // Handle cancel click
  const handleCancelClick = (listingId: string) => {
    if (confirmCancel === listingId) {
      // Second click - confirm cancellation
      handleConfirmCancel(listingId);
    } else {
      // First click - show confirmation
      setConfirmCancel(listingId);
    }
  };

  // Confirm cancellation
  const handleConfirmCancel = async (listingId: string) => {
    setCancellingId(listingId);
    try {
      await onCancelListing(listingId);
    } finally {
      setCancellingId(null);
      setConfirmCancel(null);
    }
  };

  // Cancel confirmation (click elsewhere)
  const handleCancelConfirmation = () => {
    setConfirmCancel(null);
  };

  // No listings state
  if (!isLoading && listings.length === 0) {
    return (
      <div className="card text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-space-700 flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-space text-gray-200">
              No Active Listings
            </h3>
            <p className="text-gray-400 mt-2 max-w-md">
              You haven't listed any items for sale yet. Create your first listing
              to start trading on Frontier Trade Hub.
            </p>
          </div>
          <button
            className="btn-cyber mt-4"
            onClick={() => window.location.hash = '#create'}
          >
            Create Your First Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" onClick={handleCancelConfirmation}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold font-space text-gray-100">
          My Listings
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {listings.length} active listing{listings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-space-700/50 rounded-xl p-4 border border-space-600">
              <div className="skeleton h-6 w-24 mb-3" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-2/3 mb-4" />
              <div className="skeleton h-10 w-full" />
            </div>
          ))
        ) : (
          listings.map((listing) => {
            const isCancelling = cancellingId === listing.listingId;
            const isConfirming = confirmCancel === listing.listingId;

            return (
              <div
                key={listing.listingId}
                className={cn(
                  'bg-space-700/30 rounded-xl p-4 border border-space-600',
                  'transition-all duration-300 hover:border-cyber-400/50',
                  isConfirming && 'border-neon-red/50'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Listing ID */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-cyber-400 text-sm">
                    {formatListingId(listing.listingId)}
                  </span>
                  <span className="badge badge-active">Active</span>
                </div>

                {/* Item details */}
                <h3 className="font-semibold text-gray-200 mb-1">
                  {listing.itemName}
                </h3>
                <p className="text-xs text-gray-500 font-mono mb-3">
                  {listing.itemId}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-space-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-200">
                      {listing.quantity.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-space-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Price</p>
                    <p className="font-semibold text-neon-green">
                      {formatSui(listing.price)} SUI
                    </p>
                  </div>
                </div>

                {/* Listed time */}
                <p className="text-xs text-gray-500 mb-4">
                  Listed {formatRelativeTime(listing.timestamp)}
                </p>

                {/* Cancel button */}
                <button
                  onClick={() => handleCancelClick(listing.listingId)}
                  disabled={isCancelling || isTransactionPending}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-2 rounded-lg',
                    'font-medium transition-all duration-200',
                    isConfirming
                      ? 'bg-neon-red text-white hover:bg-neon-red/80'
                      : 'btn-danger'
                  )}
                >
                  {isCancelling ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Cancelling...
                    </>
                  ) : isConfirming ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Click again to confirm
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Cancel Listing
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Earnings summary */}
      {listings.length > 0 && (
        <div className="mt-6 pt-6 border-t border-space-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-green/10 rounded-lg border border-neon-green/30">
                <Wallet className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Potential Earnings</p>
                <p className="text-lg font-bold text-neon-green font-space">
                  {formatSui(listings.reduce((sum, l) => sum + l.price, 0n))} SUI
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              If all listings sell at listed prices
            </p>
          </div>
        </div>
      )}
    </div>
  );
}