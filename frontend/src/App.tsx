/**
 * Frontier Trade Hub - Main Application
 * 
 * EVE Frontier Hackathon 2026 Submission
 * A decentralized peer-to-peer marketplace for trading in-game items
 */

import { useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import ListingsTable from '@/components/ListingsTable';
import MyListings from '@/components/MyListings';
import CreateListing from '@/components/CreateListing';
import BuyModal from '@/components/BuyModal';
import ToastContainer from '@/components/ToastContainer';
import { useWallet } from '@/hooks/useWallet';
import { useTradeHub } from '@/hooks/useTradeHub';
import { useToast } from '@/hooks/useToast';
import { Listing, MarketplaceTab } from '@/types';

// ===========================================
// Context for Toast Notifications
// ===========================================

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

// ===========================================
// Main App Component
// ===========================================

function App() {
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const wallet = useWallet();
  const tradeHub = useTradeHub();
  const { toasts, removeToast, toast } = useToast();

  // Handle buy button click
  const handleBuyClick = (listing: Listing) => {
    setSelectedListing(listing);
    setShowBuyModal(true);
  };

  // Handle purchase confirmation
  const handleConfirmPurchase = async () => {
    if (!selectedListing) return;

    try {
      const txDigest = await tradeHub.buyItem(selectedListing);
      toast.success('Purchase Successful!', `Transaction: ${txDigest.slice(0, 10)}...`);
      setShowBuyModal(false);
      setSelectedListing(null);
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Handle listing creation
  const handleCreateListing = async (form: Parameters<typeof tradeHub.listItem>[0]) => {
    try {
      const txDigest = await tradeHub.listItem(form);
      toast.success('Item Listed!', `Transaction: ${txDigest.slice(0, 10)}...`);
      setActiveTab('my-listings');
    } catch (error) {
      console.error('Listing failed:', error);
      toast.error('Listing Failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  // Handle listing cancellation
  const handleCancelListing = async (listingId: string) => {
    try {
      const txDigest = await tradeHub.cancelListing(listingId);
      toast.success('Listing Cancelled', `Transaction: ${txDigest.slice(0, 10)}...`);
    } catch (error) {
      console.error('Cancel failed:', error);
      toast.error('Cancel Failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="min-h-screen bg-gradient-space">
        {/* Background effects */}
        <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none" />
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />

        {/* Main content */}
        <div className="relative z-10">
          <Header
            wallet={wallet}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={
                <>
                  {/* Stats Dashboard */}
                  <Dashboard stats={tradeHub.stats} isLoading={tradeHub.isLoading} />

                  {/* Tab Content */}
                  <div className="mt-8">
                    {activeTab === 'all' && (
                      <ListingsTable
                        listings={tradeHub.listings}
                        isLoading={tradeHub.isLoading}
                        currentAddress={wallet.address}
                        onBuyClick={handleBuyClick}
                        onRefresh={tradeHub.fetchListings}
                      />
                    )}

                    {activeTab === 'my-listings' && (
                      <MyListings
                        listings={tradeHub.myListings}
                        isLoading={tradeHub.isLoading}
                        isTransactionPending={tradeHub.isTransactionPending}
                        onCancelListing={handleCancelListing}
                      />
                    )}

                    {activeTab === 'create' && (
                      <CreateListing
                        onSubmit={handleCreateListing}
                        isConnected={wallet.isConnected}
                        isTransactionPending={tradeHub.isTransactionPending}
                      />
                    )}
                  </div>
                </>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-space-600 py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              <p className="font-space">
                Frontier Trade Hub &copy; 2026 | EVE Frontier Hackathon Submission
              </p>
              <p className="mt-2">
                Built on <span className="text-cyber-400">Sui</span> blockchain
              </p>
            </div>
          </footer>
        </div>

        {/* Buy Modal */}
        <BuyModal
          isOpen={showBuyModal}
          listing={selectedListing}
          onClose={() => setShowBuyModal(false)}
          onConfirm={handleConfirmPurchase}
          isLoading={tradeHub.isTransactionPending}
          balance={wallet.balance}
        />

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}

export default App;