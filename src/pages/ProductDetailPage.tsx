import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { StatusBadge } from '../components/common/Badge';
import {
  ArrowLeft,
  Package,
  Layers,
  MapPin,
  History,
  ShieldAlert,
  Plus,
  ArrowLeftRight,
  Truck,
  SlidersHorizontal,
  Clock,
  TrendingUp,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    setActiveTab,
    movements,
    receipts,
    deliveries,
    setActiveModal,
  } = useInventory();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'stock' | 'movements' | 'reorder'>('overview');

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  if (!product) {
    return (
      <div className="p-8 text-center text-xs text-[#64748B]">
        Product not found.{' '}
        <button onClick={() => setActiveTab('products')} className="text-[#F59E0B] underline ml-1">
          Back to Catalog
        </button>
      </div>
    );
  }

  // Related movements for this product
  const productMovements = movements.filter((m) => m.productId === product.id);

  // Incoming quantity from pending receipts
  const incomingQty = receipts
    .filter((r) => r.status !== 'Done' && r.status !== 'Cancelled')
    .reduce((sum, r) => {
      const match = r.items.find((it) => it.productId === product.id);
      return sum + (match ? match.expectedQty : 0);
    }, 0);

  // Outgoing quantity from pending deliveries
  const outgoingQty = deliveries
    .filter((d) => d.status !== 'Done' && d.status !== 'Cancelled')
    .reduce((sum, d) => {
      const match = d.items.find((it) => it.productId === product.id);
      return sum + (match ? match.quantity : 0);
    }, 0);

  let status = 'In Stock';
  if (product.availableStock <= 0) status = 'Out of Stock';
  else if (product.availableStock <= product.reorderLevel) status = 'Low Stock';

  return (
    <div className="space-y-5 pb-8">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#171A20] border border-[#292D35] p-5 rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('products')}
            className="p-2 rounded-lg bg-[#111318] hover:bg-[#1E222A] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#292D35] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">{product.name}</h1>
              <StatusBadge status={status} size="sm" pulse={status !== 'In Stock'} />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] mt-1">
              <span>SKU: <strong className="text-[#F8FAFC]">{product.sku}</strong></span>
              <span>•</span>
              <span>Category: {product.category}</span>
              <span>•</span>
              <span>Primary: {product.primaryLocation}</span>
            </div>
          </div>
        </div>

        {/* Quick Operations toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveModal('newReceipt')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Receive Stock</span>
          </button>
          <button
            onClick={() => setActiveModal('newTransfer')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Transfer</span>
          </button>
          <button
            onClick={() => setActiveModal('newDelivery')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Deliver Order</span>
          </button>
          <button
            onClick={() => setActiveModal('newAdjustment')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Adjust</span>
          </button>
        </div>
      </div>

      {/* 4 Quantities Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Available Stock</span>
          <div className="text-2xl font-bold font-mono text-[#22C55E] mt-1">
            {product.availableStock.toLocaleString()} <span className="text-xs font-normal text-[#94A3B8]">{product.unit}</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Unreserved &amp; solvent</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Reserved</span>
          <div className="text-2xl font-bold font-mono text-[#F8FAFC] mt-1">
            {product.reserved.toLocaleString()} <span className="text-xs font-normal text-[#94A3B8]">{product.unit}</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Committed to active dispatches</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Incoming</span>
          <div className="text-2xl font-bold font-mono text-[#3B82F6] mt-1">
            +{incomingQty.toLocaleString()} <span className="text-xs font-normal text-[#94A3B8]">{product.unit}</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Pending vendor delivery</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Outgoing</span>
          <div className="text-2xl font-bold font-mono text-[#F59E0B] mt-1">
            -{outgoingQty.toLocaleString()} <span className="text-xs font-normal text-[#94A3B8]">{product.unit}</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Staged in transit bays</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 border-b border-[#292D35] pb-1">
        {(['overview', 'stock', 'movements', 'reorder'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-colors capitalize ${
              activeSubTab === tab
                ? 'bg-[#1E222A] text-[#F59E0B] font-semibold border-b-2 border-[#F59E0B]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {tab === 'movements' ? 'Movement History' : tab === 'stock' ? 'Stock by Location' : tab === 'reorder' ? 'Reorder Rules' : 'Overview'}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-[#171A20] border border-[#292D35] p-5 rounded-xl shadow-md space-y-4">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Product Specifications</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block">Unit Price</span>
                <span className="text-sm font-bold font-mono text-[#F8FAFC]">${product.unitPrice || 68.5}</span>
              </div>
              <div className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block">Inventory Value</span>
                <span className="text-sm font-bold font-mono text-[#22C55E]">
                  ${((product.availableStock || 0) * (product.unitPrice || 68.5)).toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-[#64748B] block">Barcode</span>
                <span className="text-xs font-mono text-[#94A3B8]">{product.barcode || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#171A20] border border-[#292D35] p-5 rounded-xl shadow-md space-y-4">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Storage Health</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Safe Reorder Level:</span>
                <span className="font-mono text-[#F8FAFC] font-semibold">{product.reorderLevel} {product.unit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Buffer Surplus:</span>
                <span className={`font-mono font-semibold ${product.availableStock >= product.reorderLevel ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {product.availableStock - product.reorderLevel} {product.unit}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8]">Supplier Lead Time:</span>
                <span className="font-mono text-[#F8FAFC]">{product.leadTimeDays || 2} days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'stock' && (
        <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Stock Breakdown by Warehouse &amp; Location</h3>
            <button
              onClick={() => setActiveModal('newTransfer')}
              className="text-xs font-mono text-[#F59E0B] hover:underline"
            >
              + Move Stock Between Locations
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                  <th className="py-2.5 px-4 font-semibold">Warehouse</th>
                  <th className="py-2.5 px-4 font-semibold">Location / Rack</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Physical Quantity</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292D35]/50">
                {product.locationStocks.map((ls, idx) => (
                  <tr key={idx} className="hover:bg-[#1E222A]/60">
                    <td className="py-3 px-4 font-semibold text-[#F8FAFC]">{ls.warehouseName}</td>
                    <td className="py-3 px-4 font-mono text-[#94A3B8]">{ls.locationName}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#F8FAFC]">
                      {ls.quantity} {product.unit}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveModal('newTransfer')}
                        className="text-[11px] font-mono text-[#F59E0B] hover:underline"
                      >
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'movements' && (
        <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-[#14171D] border-b border-[#292D35]">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Audit Movement Ledger for {product.name}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                  <th className="py-2.5 px-4 font-semibold">Time</th>
                  <th className="py-2.5 px-4 font-semibold">Reference</th>
                  <th className="py-2.5 px-4 font-semibold">Operation</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Quantity</th>
                  <th className="py-2.5 px-4 font-semibold">Route</th>
                  <th className="py-2.5 px-4 font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292D35]/50">
                {productMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-[#64748B]">
                      No movement history recorded yet for this product.
                    </td>
                  </tr>
                ) : (
                  productMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-[#1E222A]/60">
                      <td className="py-3 px-4 font-mono text-[11px] text-[#94A3B8]">{m.timestamp}</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#F8FAFC]">{m.reference}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] font-bold text-[#F59E0B] uppercase">
                          {m.operation}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          m.quantity > 0 && m.operation !== 'Delivery' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                        }`}
                      >
                        {m.quantity > 0 && m.operation === 'Receipt' ? `+${m.quantity}` : m.quantity} {m.unit}
                      </td>
                      <td className="py-3 px-4 text-xs text-[#94A3B8] truncate max-w-[200px]">
                        {m.fromLocation} → {m.toLocation}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#64748B]">{m.user}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'reorder' && (
        <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-5 shadow-md space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Automated Reorder Rules &amp; Triggers</h3>
          <div className="space-y-3">
            <div className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC]">Minimum Safe Buffer</span>
                <p className="text-[11px] text-[#94A3B8]">Alert triggered when inventory drops below threshold.</p>
              </div>
              <span className="font-mono font-bold text-sm text-[#F59E0B]">{product.reorderLevel} {product.unit}</span>
            </div>

            <div className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#F8FAFC]">Automated PO Generation</span>
                <p className="text-[11px] text-[#94A3B8]">Auto-draft PO with preferred supplier when stock hits 50% buffer.</p>
              </div>
              <span className="font-mono text-xs text-[#22C55E] font-bold">Enabled</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
