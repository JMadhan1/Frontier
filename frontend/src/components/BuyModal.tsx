/**
 * Frontier Trade Hub - Buy Modal Component
 * 
 * Confirmation modal for purchasing listings
 */

import { useEffect, useCallback } from 'react';
import { X, ShoppingCart, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { Listing } from '@/types';
import { formatSui, truncateAddress, cn } from '@/utils/format';

interface BuyModalProps {
  isOpen: boolean;
  listing: Listing | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  balance: bigint;
}

export default function BuyModal({
  isOpen,
  listing,
  onClose,
  onConfirm,
  isLoading,
  balance,
}: BuyModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !listing) return null;

  const hasEnoughBalance = balance >= listing.price;
  const total = listing.price;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-cyber rounded-lg">
              <ShoppingCart className="w-5 h-5 text-space-900" />
            </div>
            <h3 className="text-lg font-bold font-space text-gray-100">
              Confirm Purchase
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-space-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Item details */}
        <div className="bg-space-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-200">{listing.itemName}</h4>
              <p className="text-xs text-gray-500 font-mono">{listing.itemId}</p>
            </div>
            <span className="px-2 py-1 bg-cyber-400/20 text-cyber-400 rounded text-xs font-medium">
              {listing.quantity}x
            </span>
          </div>

          <div className="pt-3 border-t border-space-600">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Seller</span>
              <span className="font-mono text-gray-300">
                {truncateAddress(listing.seller)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price</span>
              <span className="font-semibold text-neon-green">
                {formatSui(listing.price)} SUI
              </span>
            </div>
          </div>
        </div>

        {/* Balance check */}
        <div
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg mb-6',
            hasEnoughBalance
              ? 'bg-neon-green/10 border border-neon-green/30'
              : 'bg-neon-red/10 border border-neon-red/30'
          )}
        >
          {hasEnoughBalance ? (
            <CheckCircle className="w-5 h-5 text-neon-green flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-neon-red flex-shrink-0" />
          )}
          <div className="flex-1">
            <p
              className={cn(
                'text-sm font-medium',
                hasEnoughBalance ? 'text-neon-green' : 'text-neon-red'
              )}
            >
              {hasEnoughBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
            </p>
            <p className="text-xs text-gray-400">
              Your balance: {formatSui(balance)} SUI
            </p>
          </div>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Item Price</span>
            <span className="text-gray-200">{formatSui(listing.price)} SUI</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Platform Fee (1%)</span>
            <span className="text-gray-400">Included</span>
          </div>
          <div className="pt-2 border-t border-space-600 flex justify-between">
            <span className="text-gray-200 font-medium">Total Cost</span>
            <span className="text-cyber-400 font-bold text-lg">
              {formatSui(total)} SUI
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !hasEnoughBalance}
            className={cn(
              'btn-cyber flex-1 flex items-center justify-center gap-2',
              !hasEnoughBalance && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Confirm Purchase
              </>
            )}
          </button>
        </div>

        {/* Warning note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          This transaction is final and cannot be reversed.
          Please verify all details before confirming.
        </p>
      </div>
    </div>
  );
}