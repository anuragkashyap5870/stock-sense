import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { StatusBadge } from '../components/common/Badge';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const InternalTransfersPage: React.FC = () => {
  const {
    transfers,
    executeInternalTransfer,
    setActiveModal,
    products,
    scheduledTransfersCount,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransfers = transfers.filter((t) => {
    return (
      t.transferNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceWarehouseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationWarehouseName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#F59E0B]/15 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
              Inter-Facility Logistics
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">Stock Conservation Invariant</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Internal Transfers
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl">
            Move stock seamlessly between primary storage, assembly lines, and dispatch hubs. Total company inventory remains exactly conserved.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('newTransfer')}
          className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Internal Transfer</span>
        </button>
      </div>

      {/* Featured Scheduled Transfer Callout (Demo Step 3) */}
      <div className="bg-[#171A20] border border-[#292D35] p-5 rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
            <h3 className="text-xs font-bold font-mono uppercase text-[#F8FAFC] tracking-wider">
              Featured Operational Route: Main WH → Production Floor
            </h3>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">{scheduledTransfersCount} Scheduled</span>
        </div>

        <div className="p-4 bg-[#0B0D10] border border-[#292D35] rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="p-3 rounded-lg bg-[#171A20] border border-[#292D35] text-center">
              <span className="text-[10px] font-mono text-[#64748B] uppercase block">Source Facility</span>
              <span className="text-xs font-bold text-[#F8FAFC]">Main Warehouse</span>
              <span className="text-[10px] font-mono text-[#F59E0B] block">Rack A-12</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-xs font-mono font-bold text-[#F59E0B]">30 kg Steel Rod</span>
              <ArrowRight className="w-5 h-5 text-[#F59E0B]" />
              <span className="text-[9px] font-mono text-[#22C55E]">Zero Net Change</span>
            </div>

            <div className="p-3 rounded-lg bg-[#171A20] border border-[#292D35] text-center">
              <span className="text-[10px] font-mono text-[#64748B] uppercase block">Target Facility</span>
              <span className="text-xs font-bold text-[#F8FAFC]">Production Warehouse</span>
              <span className="text-[10px] font-mono text-[#22C55E] block">Production Line #4</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-[#64748B] block">Invariant Ledger State</span>
            <span className="text-xs font-bold text-[#22C55E] font-mono">Total Company Stock: 600 kg</span>
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-[#14171D] border-b border-[#292D35] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Transfer Queue &amp; Movement Logs</h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0B0D10] text-[#94A3B8]">
              Inter-bay Transit
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transfers..."
              className="bg-[#0B0D10] border border-[#292D35] text-xs text-[#F8FAFC] pl-8 pr-3 py-1.5 rounded-lg focus:outline-none w-48 sm:w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                <th className="py-3 px-4 font-semibold">Transfer #</th>
                <th className="py-3 px-4 font-semibold">Product SKU</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold">Source Location</th>
                <th className="py-3 px-4 font-semibold">Destination Location</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292D35]/50">
              {filteredTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-[#1E222A]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#F59E0B]">{t.transferNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#F8FAFC]">{t.productName}</div>
                    <span className="font-mono text-[10px] text-[#64748B]">{t.sku}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#F8FAFC]">
                    {t.quantity} {t.unit}
                  </td>
                  <td className="py-3 px-4 text-[#94A3B8]">
                    <span className="text-[#F8FAFC] font-medium">{t.sourceWarehouseName}</span>
                    <span className="block text-[10px] font-mono">({t.sourceLocation})</span>
                  </td>
                  <td className="py-3 px-4 text-[#94A3B8]">
                    <span className="text-[#22C55E] font-medium">{t.destinationWarehouseName}</span>
                    <span className="block text-[10px] font-mono">({t.destinationLocation})</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#94A3B8]">{t.transferDate}</td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={t.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {t.status !== 'Done' ? (
                      <button
                        onClick={() => executeInternalTransfer(t.id)}
                        className="px-2.5 py-1 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-[11px] font-bold shadow-sm"
                      >
                        Execute
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-[#22C55E]">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
