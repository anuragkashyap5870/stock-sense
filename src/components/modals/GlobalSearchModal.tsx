import React, { useState, useEffect, useRef } from 'react';
import { useInventory } from '../../store/inventoryStore';
import { Search, X, Package, ClipboardCheck, Truck, ArrowLeftRight, Warehouse, ArrowRight } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    products,
    receipts,
    deliveries,
    transfers,
    warehouses,
    setActiveTab,
    setSelectedProductId,
  } = useInventory();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  // Search Results
  const matchedProducts = cleanQ
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(cleanQ) ||
          p.sku.toLowerCase().includes(cleanQ) ||
          p.category.toLowerCase().includes(cleanQ) ||
          (p.barcode && p.barcode.includes(cleanQ))
      )
    : products.slice(0, 3);

  const matchedReceipts = cleanQ
    ? receipts.filter(
        (r) =>
          r.receiptNumber.toLowerCase().includes(cleanQ) ||
          r.vendor.toLowerCase().includes(cleanQ) ||
          r.poReference.toLowerCase().includes(cleanQ) ||
          r.items.some((it) => it.sku.toLowerCase().includes(cleanQ) || it.productName.toLowerCase().includes(cleanQ))
      )
    : [];

  const matchedDeliveries = cleanQ
    ? deliveries.filter(
        (d) =>
          d.deliveryNumber.toLowerCase().includes(cleanQ) ||
          d.customer.toLowerCase().includes(cleanQ) ||
          d.items.some((it) => it.sku.toLowerCase().includes(cleanQ) || it.productName.toLowerCase().includes(cleanQ))
      )
    : [];

  const matchedTransfers = cleanQ
    ? transfers.filter(
        (t) =>
          t.transferNumber.toLowerCase().includes(cleanQ) ||
          t.productName.toLowerCase().includes(cleanQ) ||
          t.sku.toLowerCase().includes(cleanQ) ||
          t.sourceLocation.toLowerCase().includes(cleanQ)
      )
    : [];

  const matchedWarehouses = cleanQ
    ? warehouses.filter(
        (w) =>
          w.name.toLowerCase().includes(cleanQ) ||
          w.code.toLowerCase().includes(cleanQ) ||
          w.address.toLowerCase().includes(cleanQ)
      )
    : [];

  const handleSelectProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    setActiveTab('product-detail');
    setIsGlobalSearchOpen(false);
  };

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setIsGlobalSearchOpen(false);
  };

  const hasResults =
    matchedProducts.length > 0 ||
    matchedReceipts.length > 0 ||
    matchedDeliveries.length > 0 ||
    matchedTransfers.length > 0 ||
    matchedWarehouses.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#292D35] flex items-center gap-3 bg-[#111318]">
          <Search className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type SKU (e.g. STL-001), product, PO, receipt, delivery or warehouse..."
            className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#64748B] hover:text-[#F8FAFC] p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#0B0D10] border border-[#292D35] text-[10px] font-mono text-[#64748B]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!hasResults && cleanQ && (
            <div className="p-8 text-center text-xs text-[#64748B]">
              No inventory records matching &quot;{query}&quot;.
            </div>
          )}

          {/* Matched Products */}
          {matchedProducts.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#64748B] font-semibold flex items-center justify-between">
                <span>Products &amp; SKUs</span>
                <span>{matchedProducts.length}</span>
              </div>
              {matchedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id)}
                  className="p-2.5 rounded-lg bg-[#111318] hover:bg-[#1E222A] border border-[#292D35]/50 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center font-mono text-xs font-bold">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#94A3B8]">
                        SKU: <span className="text-[#F8FAFC] font-bold">{p.sku}</span> • {p.category} • {p.primaryLocation}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#22C55E]">
                      {p.availableStock} {p.unit}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#F8FAFC] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Matched Receipts */}
          {matchedReceipts.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#64748B] font-semibold flex items-center justify-between">
                <span>Related Receipts (Inward)</span>
                <span>{matchedReceipts.length}</span>
              </div>
              {matchedReceipts.map((r) => (
                <div
                  key={r.id}
                  onClick={() => handleSelectTab('receipts')}
                  className="p-2.5 rounded-lg bg-[#111318] hover:bg-[#1E222A] border border-[#292D35]/50 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-4 h-4 text-[#22C55E]" />
                    <div>
                      <span className="font-mono text-xs font-bold text-[#F8FAFC] group-hover:text-[#22C55E] transition-colors">
                        {r.receiptNumber}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] ml-2">Vendor: {r.vendor} ({r.poReference})</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#22C55E] font-semibold uppercase">{r.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Deliveries */}
          {matchedDeliveries.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#64748B] font-semibold flex items-center justify-between">
                <span>Related Deliveries (Outbound)</span>
                <span>{matchedDeliveries.length}</span>
              </div>
              {matchedDeliveries.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSelectTab('delivery-orders')}
                  className="p-2.5 rounded-lg bg-[#111318] hover:bg-[#1E222A] border border-[#292D35]/50 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-4 h-4 text-[#3B82F6]" />
                    <div>
                      <span className="font-mono text-xs font-bold text-[#F8FAFC] group-hover:text-[#3B82F6] transition-colors">
                        {d.deliveryNumber}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] ml-2">Customer: {d.customer}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#3B82F6] font-semibold uppercase">{d.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Transfers */}
          {matchedTransfers.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#64748B] font-semibold flex items-center justify-between">
                <span>Transfers</span>
                <span>{matchedTransfers.length}</span>
              </div>
              {matchedTransfers.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTab('internal-transfers')}
                  className="p-2.5 rounded-lg bg-[#111318] hover:bg-[#1E222A] border border-[#292D35]/50 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ArrowLeftRight className="w-4 h-4 text-[#F59E0B]" />
                    <div>
                      <span className="font-mono text-xs font-bold text-[#F8FAFC]">{t.transferNumber}</span>
                      <span className="text-[10px] text-[#94A3B8] ml-2">
                        {t.productName} ({t.quantity} {t.unit})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#F59E0B] uppercase">{t.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched Warehouses */}
          {matchedWarehouses.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#64748B] font-semibold flex items-center justify-between">
                <span>Warehouses</span>
                <span>{matchedWarehouses.length}</span>
              </div>
              {matchedWarehouses.map((w) => (
                <div
                  key={w.id}
                  onClick={() => handleSelectTab('warehouses')}
                  className="p-2.5 rounded-lg bg-[#111318] hover:bg-[#1E222A] border border-[#292D35]/50 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Warehouse className="w-4 h-4 text-[#F59E0B]" />
                    <div>
                      <span className="font-mono text-xs font-bold text-[#F8FAFC]">[{w.code}] {w.name}</span>
                      <span className="text-[10px] text-[#94A3B8] block">{w.address}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#F8FAFC]">{w.occupiedCapacityPercent}% cap</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#0B0D10] border-t border-[#292D35] flex items-center justify-between text-[11px] font-mono text-[#64748B]">
          <span>Tip: Try searching &quot;Steel Rod&quot; or &quot;STL-001&quot;</span>
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="text-[#94A3B8] hover:text-[#F8FAFC]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
