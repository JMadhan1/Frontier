/**
 * Frontier Trade Hub - Smart Terminals Component
 *
 * Connects EVE Frontier Smart Storage Units (SSU) to the on-chain marketplace.
 * Players register their in-game Smart Assemblies as Trade Terminals, sync
 * in-game inventory on-chain, and list items directly through the terminal.
 */

import { useState } from 'react';
import { Cpu, MapPin, Plus, RefreshCw, Package, Zap, CheckCircle, Wallet, ChevronDown } from 'lucide-react';
import { StoredTerminal } from '@/types';
import { EVE_CATEGORIES, EveItem } from '@/data/eve-items';
import { cn } from '@/utils/format';

interface SmartTerminalsProps {
  terminals: StoredTerminal[];
  isConnected: boolean;
  isTransactionPending: boolean;
  onRegister: (assemblyId: string, location: string) => Promise<string>;
  onSyncItem: (terminalId: string, capId: string, itemId: string, itemName: string, quantity: number, category: string) => Promise<string>;
  onListThrough: (terminalId: string, capId: string, itemId: string, quantity: number, price: string) => Promise<string>;
}

interface SyncForm { itemId: string; itemName: string; quantity: number; category: string; }
interface ListForm  { itemId: string; itemName: string; quantity: number; price: string; }

export default function SmartTerminals({
  terminals,
  isConnected,
  isTransactionPending,
  onRegister,
  onSyncItem,
  onListThrough,
}: SmartTerminalsProps) {
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ assemblyId: '', location: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  const [activeSyncId, setActiveSyncId] = useState<string | null>(null);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [syncForm, setSyncForm] = useState<SyncForm>({ itemId: '', itemName: '', quantity: 1, category: 'Minerals' });
  const [listForm, setListForm] = useState<ListForm>({ itemId: '', itemName: '', quantity: 1, price: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isListing, setIsListing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const allItems: EveItem[] = EVE_CATEGORIES.flatMap((c) => c.items);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.assemblyId.trim() || !regForm.location.trim()) return;
    setIsRegistering(true);
    try {
      const digest = await onRegister(regForm.assemblyId.trim(), regForm.location.trim());
      setSuccessMsg(`Terminal registered! Tx: ${digest.slice(0, 12)}...`);
      setRegForm({ assemblyId: '', location: '' });
      setShowRegister(false);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSyncItem = async (terminal: StoredTerminal, e: React.FormEvent) => {
    e.preventDefault();
    if (!syncForm.itemId) return;
    setIsSyncing(true);
    try {
      const digest = await onSyncItem(terminal.id, terminal.capId, syncForm.itemId, syncForm.itemName, syncForm.quantity, syncForm.category);
      setSuccessMsg(`Item synced to terminal! Tx: ${digest.slice(0, 12)}...`);
      setSyncForm({ itemId: '', itemName: '', quantity: 1, category: 'Minerals' });
      setActiveSyncId(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleListThrough = async (terminal: StoredTerminal, e: React.FormEvent) => {
    e.preventDefault();
    if (!listForm.itemId || !listForm.price) return;
    setIsListing(true);
    try {
      const digest = await onListThrough(terminal.id, terminal.capId, listForm.itemId, listForm.quantity, listForm.price);
      setSuccessMsg(`Listed on marketplace via terminal! Tx: ${digest.slice(0, 12)}...`);
      setListForm({ itemId: '', itemName: '', quantity: 1, price: '' });
      setActiveListId(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsListing(false);
    }
  };

  const selectSyncItem = (item: EveItem) => {
    setSyncForm((p) => ({ ...p, itemId: item.id, itemName: item.name, category: EVE_CATEGORIES.find((c) => c.items.some((i) => i.id === item.id))?.name || 'Minerals' }));
  };
  const selectListItem = (item: EveItem) => {
    setListForm((p) => ({ ...p, itemId: item.id, itemName: item.name, price: item.basePrice.toString() }));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neon-purple/20 border border-neon-purple/30 rounded-xl">
            <Cpu className="w-6 h-6 text-neon-purple" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-space text-gray-100">Smart Assembly Terminals</h2>
            <p className="text-sm text-gray-400">
              Register your EVE Frontier SSU as a Trade Terminal — sync inventory &amp; list directly on-chain
            </p>
          </div>
        </div>
        {isConnected && (
          <button
            onClick={() => setShowRegister(true)}
            className="btn-cyber flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Register Terminal
          </button>
        )}
      </div>

      {/* Wallet warning */}
      {!isConnected && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <Wallet className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">Connect your Sui wallet to register and manage Smart Assembly Terminals.</p>
        </div>
      )}

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-neon-green/10 border border-neon-green/30 rounded-xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-neon-green shrink-0" />
          <p className="text-sm text-neon-green font-mono">{successMsg}</p>
        </div>
      )}

      {/* How it works explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🏭', title: '1. Register SSU', desc: 'Link your EVE Frontier Smart Storage Unit to the on-chain marketplace by registering its Assembly ID.' },
          { icon: '🔄', title: '2. Sync Inventory', desc: 'Mirror your in-game item holdings to the terminal\'s on-chain inventory. Items remain verifiable on Sui.' },
          { icon: '⚡', title: '3. List & Sell', desc: 'Directly list synced items onto the Frontier Trade Hub marketplace with a single transaction.' },
        ].map((step) => (
          <div key={step.title} className="card p-4 border border-space-600">
            <div className="text-2xl mb-2">{step.icon}</div>
            <h4 className="font-semibold text-gray-200 mb-1">{step.title}</h4>
            <p className="text-xs text-gray-500">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Register form */}
      {showRegister && (
        <div className="card border border-neon-purple/30">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-neon-purple" />
            <h3 className="font-bold text-gray-100">Register New Terminal</h3>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label-cyber">Smart Assembly ID</label>
              <input
                type="text"
                placeholder="e.g. SSU-34291 or EVE assembly object ID"
                value={regForm.assemblyId}
                onChange={(e) => setRegForm((p) => ({ ...p, assemblyId: e.target.value }))}
                className="input-cyber"
                required
              />
              <p className="mt-1 text-xs text-gray-500">The unique identifier of your SSU in EVE Frontier</p>
            </div>
            <div>
              <label className="label-cyber flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
              <input
                type="text"
                placeholder="e.g. Jita IV - Moon 4, Perimeter Trade Hub"
                value={regForm.location}
                onChange={(e) => setRegForm((p) => ({ ...p, location: e.target.value }))}
                className="input-cyber"
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowRegister(false)} className="flex-1 px-4 py-2 rounded-xl border border-space-600 text-gray-400 hover:text-gray-200 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRegistering || isTransactionPending}
                className="flex-1 btn-cyber flex items-center justify-center gap-2"
              >
                {isRegistering ? <><RefreshCw className="w-4 h-4 animate-spin" /> Registering...</> : <><Cpu className="w-4 h-4" /> Register Terminal</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Terminal cards */}
      {terminals.length === 0 && !showRegister && (
        <div className="card text-center py-16">
          <Cpu className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300 mb-2">No Terminals Registered</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Register your EVE Frontier Smart Storage Unit to bridge your in-game inventory to the on-chain marketplace.
          </p>
          {isConnected && (
            <button onClick={() => setShowRegister(true)} className="btn-cyber inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Register Your First Terminal
            </button>
          )}
        </div>
      )}

      {terminals.map((terminal) => (
        <div key={terminal.id} className="card border border-neon-purple/20">
          {/* Terminal header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-100 font-space">{terminal.assemblyId}</h3>
                  <span className="flex items-center gap-1 text-xs text-neon-green bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {terminal.location}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 font-mono">
              {terminal.id.slice(0, 6)}...{terminal.id.slice(-4)}
            </p>
          </div>

          {/* Terminal stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Object ID', value: `${terminal.id.slice(0, 8)}...` },
              { label: 'TerminalCap', value: `${terminal.capId.slice(0, 8)}...` },
              { label: 'Registered', value: new Date(terminal.registeredAt).toLocaleDateString() },
            ].map((stat) => (
              <div key={stat.label} className="bg-space-700/50 rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xs font-mono text-cyber-400 mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => { setActiveSyncId(activeSyncId === terminal.id ? null : terminal.id); setActiveListId(null); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                activeSyncId === terminal.id
                  ? 'bg-neon-purple/20 border-neon-purple/50 text-neon-purple'
                  : 'border-space-600 text-gray-400 hover:text-gray-200 hover:border-space-500'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Sync Item from SSU
              <ChevronDown className={cn('w-3 h-3 transition-transform', activeSyncId === terminal.id && 'rotate-180')} />
            </button>
            <button
              onClick={() => { setActiveListId(activeListId === terminal.id ? null : terminal.id); setActiveSyncId(null); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                activeListId === terminal.id
                  ? 'bg-cyber-400/20 border-cyber-400/50 text-cyber-400'
                  : 'border-space-600 text-gray-400 hover:text-gray-200 hover:border-space-500'
              )}
            >
              <Zap className="w-4 h-4" />
              List to Marketplace
              <ChevronDown className={cn('w-3 h-3 transition-transform', activeListId === terminal.id && 'rotate-180')} />
            </button>
          </div>

          {/* Sync Item form */}
          {activeSyncId === terminal.id && (
            <form onSubmit={(e) => handleSyncItem(terminal, e)} className="mt-4 pt-4 border-t border-space-600 space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-neon-purple" />
                Sync In-Game Item to Terminal
              </h4>
              <div>
                <label className="label-cyber">Select Item</label>
                <select
                  className="input-cyber"
                  value={syncForm.itemId}
                  onChange={(e) => {
                    const item = allItems.find((i) => i.id === e.target.value);
                    if (item) selectSyncItem(item);
                  }}
                  required
                >
                  <option value="">Choose an EVE item...</option>
                  {EVE_CATEGORIES.map((cat) => (
                    <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                      {cat.items.map((item) => (
                        <option key={item.id} value={item.id}>{item.name} ({item.id})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-cyber">Quantity in SSU</label>
                  <input
                    type="number" min="1"
                    value={syncForm.quantity}
                    onChange={(e) => setSyncForm((p) => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-cyber"
                  />
                </div>
                <div>
                  <label className="label-cyber">Category</label>
                  <input type="text" value={syncForm.category} readOnly className="input-cyber opacity-60" />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSyncing || isTransactionPending || !syncForm.itemId}
                className="w-full btn-cyber flex items-center justify-center gap-2"
              >
                {isSyncing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Syncing...</> : <><RefreshCw className="w-4 h-4" /> Sync to Terminal</>}
              </button>
            </form>
          )}

          {/* List Through Terminal form */}
          {activeListId === terminal.id && (
            <form onSubmit={(e) => handleListThrough(terminal, e)} className="mt-4 pt-4 border-t border-space-600 space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyber-400" />
                List Item via Terminal to Marketplace
              </h4>
              <p className="text-xs text-gray-500">Item must be synced to this terminal first via "Sync Item from SSU".</p>
              <div>
                <label className="label-cyber flex items-center gap-1"><Package className="w-3 h-3" /> Item</label>
                <select
                  className="input-cyber"
                  value={listForm.itemId}
                  onChange={(e) => {
                    const item = allItems.find((i) => i.id === e.target.value);
                    if (item) selectListItem(item);
                  }}
                  required
                >
                  <option value="">Choose item to list...</option>
                  {EVE_CATEGORIES.map((cat) => (
                    <optgroup key={cat.id} label={`${cat.icon} ${cat.name}`}>
                      {cat.items.map((item) => (
                        <option key={item.id} value={item.id}>{item.name} ({item.id})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-cyber">Quantity</label>
                  <input
                    type="number" min="1"
                    value={listForm.quantity}
                    onChange={(e) => setListForm((p) => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                    className="input-cyber"
                  />
                </div>
                <div>
                  <label className="label-cyber">Price (SUI)</label>
                  <input
                    type="number" step="0.001" min="0" placeholder="0.00"
                    value={listForm.price}
                    onChange={(e) => setListForm((p) => ({ ...p, price: e.target.value }))}
                    className="input-cyber"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isListing || isTransactionPending || !listForm.itemId || !listForm.price}
                className="w-full btn-cyber flex items-center justify-center gap-2"
              >
                {isListing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Listing...</> : <><Zap className="w-4 h-4" /> List on Marketplace</>}
              </button>
            </form>
          )}
        </div>
      ))}

      {/* Contract info */}
      <div className="card border border-space-600 bg-space-800/30">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          Smart Assembly Integration — How It Works On-Chain
        </h4>
        <div className="space-y-2 text-xs text-gray-500">
          <p>• <span className="text-gray-300">trade_terminal.move</span> — deployed Move module creating <span className="text-cyber-400">TradeTerminal</span> shared objects, one per SSU</p>
          <p>• <span className="text-gray-300">register_terminal()</span> — creates terminal + issues <span className="text-cyber-400">TerminalCap</span> capability to the player</p>
          <p>• <span className="text-gray-300">sync_item_from_ssu()</span> — mirrors in-game SSU inventory state into on-chain <span className="text-cyber-400">Table&lt;String, SsuItem&gt;</span></p>
          <p>• <span className="text-gray-300">list_item_through_terminal()</span> — atomically deducts inventory and calls <span className="text-cyber-400">trade_hub::list_item()</span> in one transaction</p>
          <p>• All operations emit on-chain events: <span className="text-cyber-400">TerminalRegistered, ItemSynced, TerminalListed, TerminalPurchased</span></p>
        </div>
      </div>
    </div>
  );
}
