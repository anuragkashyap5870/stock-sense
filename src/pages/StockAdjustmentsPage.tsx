import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { StatusBadge } from '../components/common/Badge';
import {
  SlidersHorizontal,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export const StockAdjustmentsPage: React.FC = () => {
  const { adjustments, applyStockAdjustment, setActiveModal } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAdjustments = adjustments.filter((a) => {
    return (
      a.adjustmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#EF4444]/15 text-[#EF4444] px-2 py-0.5 rounded font-bold">
              Audit &amp; Write-Off Engine
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">Physical Cycle Counting</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Stock Adjustments
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl">
            Reconcile physical stock count variances, write off damaged or scrap goods, and record auditing adjustments with full traceable justification.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('newAdjustment')}
          className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Stock Adjustment</span>
        </button>
      </div>

      {/* Adjustments Table */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-[#14171D] border-b border-[#292D35] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Audit Adjustments History</h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0B0D10] text-[#94A3B8]">
              Verified Logs
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search adjustments..."
              className="bg-[#0B0D10] border border-[#292D35] text-xs text-[#F8FAFC] pl-8 pr-3 py-1.5 rounded-lg focus:outline-none w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                <th className="py-3 px-4 font-semibold">Adjustment Doc</th>
                <th className="py-3 px-4 font-semibold">Product &amp; SKU</th>
                <th className="py-3 px-4 font-semibold">Facility &amp; Location</th>
                <th className="py-3 px-4 font-semibold text-right">System Qty</th>
                <th className="py-3 px-4 font-semibold text-right">Physical Count</th>
                <th className="py-3 px-4 font-semibold text-right">Variance</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292D35]/50">
              {filteredAdjustments.map((a) => {
                const isNeg = a.difference < 0;
                return (
                  <tr key={a.id} className="hover:bg-[#1E222A]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#F8FAFC]">{a.adjustmentNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F8FAFC]">{a.productName}</div>
                      <span className="font-mono text-[10px] text-[#64748B]">{a.sku}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8]">
                      <span className="text-[#F8FAFC]">{a.warehouseName}</span>
                      <span className="block text-[10px] font-mono">({a.location})</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#94A3B8]">
                      {a.systemQuantity} {a.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#F8FAFC]">
                      {a.physicalCount} {a.unit}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        isNeg ? 'text-[#EF4444]' : 'text-[#22C55E]'
                      }`}
                    >
                      {a.difference > 0 ? `+${a.difference}` : a.difference} {a.unit}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#0B0D10] text-[#94A3B8]">
                        {a.reason}
                      </span>
                      {a.notes && <span className="block text-[10px] text-[#64748B] truncate max-w-[180px]">{a.notes}</span>}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={a.status === 'Done' ? 'Done' : 'Draft'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {a.status !== 'Done' ? (
                        <button
                          onClick={() => applyStockAdjustment(a.id)}
                          className="px-2.5 py-1 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-bold shadow-sm"
                        >
                          Apply
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-[#22C55E]">Applied</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
