/**
 * Frontier Trade Hub - Create Listing Component
 *
 * Form for creating new marketplace listings with EVE item selection
 */

import { useState, useRef, useEffect } from 'react';
import { Package, Hash, DollarSign, Layers, AlertCircle, Rocket, Wallet, ChevronDown, Search, Sparkles } from 'lucide-react';
import { CreateListingForm } from '@/types';
import { cn } from '@/utils/format';
import { EVE_CATEGORIES, EveItem, getRarityBadge } from '@/data/eve-items';

interface CreateListingProps {
  onSubmit: (form: CreateListingForm) => Promise<void>;
  isConnected: boolean;
  isTransactionPending: boolean;
}

interface FormErrors {
  itemId?: string;
  itemName?: string;
  quantity?: string;
  price?: string;
}

export default function CreateListing({
  onSubmit,
  isConnected,
  isTransactionPending,
}: CreateListingProps) {
  const [form, setForm] = useState<CreateListingForm>({
    itemId: '',
    itemName: '',
    quantity: 1,
    price: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowItemPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items for picker
  const getFilteredItems = (): EveItem[] => {
    const allItems = EVE_CATEGORIES.flatMap((cat) =>
      selectedCategory === 'all' ? cat.items : cat.id === selectedCategory ? cat.items : []
    );
    if (!itemSearch) return allItems;
    const lower = itemSearch.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.id.toLowerCase().includes(lower)
    );
  };

  // Handle item selection from picker
  const handleSelectItem = (item: EveItem) => {
    setForm((prev) => ({
      ...prev,
      itemId: item.id,
      itemName: item.name,
      price: item.basePrice.toString(),
    }));
    setShowItemPicker(false);
    setItemSearch('');
    if (errors.itemId) setErrors((prev) => ({ ...prev, itemId: undefined }));
    if (errors.itemName) setErrors((prev) => ({ ...prev, itemName: undefined }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.itemId.trim()) {
      newErrors.itemId = 'Item ID is required';
    }

    if (!form.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }

    if (form.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      // Reset form on success
      setForm({ itemId: '', itemName: '', quantity: 1, price: '' });
      setErrors({});
    } catch (error) {
      // Error is handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleChange = (field: keyof CreateListingForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        {/* Wallet warning banner */}
        {!isConnected && (
          <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <Wallet className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              Connect your Sui wallet to submit this listing on-chain.
            </p>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-cyber rounded-xl">
              <Package className="w-6 h-6 text-space-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-space text-gray-100">
                Create New Listing
              </h2>
              <p className="text-sm text-gray-400">
                List your items for sale on the marketplace
              </p>
            </div>
          </div>
        </div>

        {/* Quick Select: EVE Items */}
        <div className="mb-6">
          <label className="label-cyber flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick Select Item
          </label>
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setShowItemPicker(!showItemPicker)}
              className="input-cyber flex items-center justify-between text-left"
            >
              <span className={form.itemId ? 'text-gray-200' : 'text-gray-500'}>
                {form.itemId ? `${form.itemName} (${form.itemId})` : 'Select an EVE item...'}
              </span>
              <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', showItemPicker && 'rotate-180')} />
            </button>

            {showItemPicker && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-space-800 border border-space-600 rounded-xl shadow-cyber-lg overflow-hidden">
                {/* Search + Filter */}
                <div className="p-3 border-b border-space-600 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="input-cyber pl-10 !py-2 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors',
                        selectedCategory === 'all'
                          ? 'bg-cyber-400/20 text-cyber-400 border border-cyber-400/30'
                          : 'bg-space-700 text-gray-400 hover:text-gray-200'
                      )}
                    >
                      All
                    </button>
                    {EVE_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors',
                          selectedCategory === cat.id
                            ? 'bg-cyber-400/20 text-cyber-400 border border-cyber-400/30'
                            : 'bg-space-700 text-gray-400 hover:text-gray-200'
                        )}
                      >
                        {cat.icon} {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items List */}
                <div className="max-h-64 overflow-y-auto">
                  {getFilteredItems().map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3 hover:bg-space-700/50 transition-colors text-left',
                        form.itemId === item.id && 'bg-cyber-400/10'
                      )}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200 text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-neon-green">{item.basePrice} SUI</p>
                        <span className={getRarityBadge(item.rarity)}>
                          {item.rarity}
                        </span>
                      </div>
                    </button>
                  ))}
                  {getFilteredItems().length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No items found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item ID */}
          <div>
            <label htmlFor="itemId" className="label-cyber flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Item ID
            </label>
            <input
              id="itemId"
              type="text"
              value={form.itemId}
              onChange={(e) => handleChange('itemId', e.target.value)}
              placeholder="e.g., TRIT_001, NOCX_005"
              className={cn(
                'input-cyber',
                errors.itemId && 'border-neon-red focus:border-neon-red focus:ring-neon-red/20'
              )}
            />
            {errors.itemId && (
              <p className="mt-1 text-sm text-neon-red flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.itemId}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The unique in-game identifier for your item
            </p>
          </div>

          {/* Item Name */}
          <div>
            <label htmlFor="itemName" className="label-cyber flex items-center gap-2">
              <Package className="w-4 h-4" />
              Item Name
            </label>
            <input
              id="itemName"
              type="text"
              value={form.itemName}
              onChange={(e) => handleChange('itemName', e.target.value)}
              placeholder="e.g., Tritanium Ore, Nocxium"
              className={cn(
                'input-cyber',
                errors.itemName && 'border-neon-red focus:border-neon-red focus:ring-neon-red/20'
              )}
            />
            {errors.itemName && (
              <p className="mt-1 text-sm text-neon-red flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.itemName}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              A human-readable name for display
            </p>
          </div>

          {/* Quantity and Price row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="label-cyber flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                className={cn(
                  'input-cyber',
                  errors.quantity && 'border-neon-red focus:border-neon-red focus:ring-neon-red/20'
                )}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-neon-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="label-cyber flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price (SUI)
              </label>
              <div className="relative">
                <input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="0.00"
                  className={cn(
                    'input-cyber pr-14',
                    errors.price && 'border-neon-red focus:border-neon-red focus:ring-neon-red/20'
                  )}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  SUI
                </span>
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-neon-red flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          {form.itemName && form.price && parseFloat(form.price) > 0 && (
            <div className="bg-space-700/50 rounded-xl p-4 border border-space-600">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">
                Listing Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Item:</span>
                  <span className="text-gray-200">
                    {form.quantity}x {form.itemName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Price:</span>
                  <span className="text-neon-green font-semibold">
                    {parseFloat(form.price).toFixed(4)} SUI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform Fee (1%):</span>
                  <span className="text-gray-400">
                    -{(parseFloat(form.price) * 0.01).toFixed(4)} SUI
                  </span>
                </div>
                <div className="pt-2 border-t border-space-600 flex justify-between">
                  <span className="text-gray-300 font-medium">You Receive:</span>
                  <span className="text-cyber-400 font-bold">
                    {(parseFloat(form.price) * 0.99).toFixed(4)} SUI
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || isTransactionPending || !isConnected}
            className="btn-cyber w-full flex items-center justify-center gap-2"
          >
            {isSubmitting || isTransactionPending ? (
              <>
                <span className="animate-spin">⏳</span>
                Creating Listing...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Create Listing
              </>
            )}
          </button>

          {/* Info note */}
          <p className="text-xs text-gray-500 text-center">
            By creating a listing, you agree to the marketplace terms.
            A 1% platform fee is deducted from successful sales.
          </p>
        </form>
      </div>
    </div>
  );
}
