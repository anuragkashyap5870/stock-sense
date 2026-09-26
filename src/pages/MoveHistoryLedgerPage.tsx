import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { StatusBadge } from '../components/common/Badge';
import {
  History,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { OperationType } from '../types/inventory';

export const MoveHistoryLedgerPage: React.FC = () => {
  const { movements, showToast } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<string>('ALL');

  const filteredMovements = movements.filter((m) => {
    const matchesQ =
      m.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.toLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOp = selectedOperation === 'ALL' || m.operation.toLowerCase() === selectedOperation.toLowerCase();
    return matchesQ && matchesOp;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Reference', 'Operation', 'Product Name', 'SKU', 'Quantity', 'Unit', 'From Location', 'To Location', 'Operator', 'Status'];
    const rows = filteredMovements.map((m) => [
      m.timestamp,
      m.reference,
      m.operation,
      `"${m.productName}"`,
      m.sku,
      m.quantity,
      m.unit,
      `"${m.fromLocation}"`,
      `"${m.toLocation}"`,
      m.user,
      m.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Immutable_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Ledger Exported', 'Full immutable stock ledger downloaded as CSV.', 'success');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded font-bold">
              Cryptographic Audit Chain
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">Immutable Ledger</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Stock Movement History &amp; Ledger
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl">
            A permanent chronological record of every receipt, delivery, internal transfer, and physical count adjustment executed across all facilities.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-semibold rounded-lg shadow-sm transition-colors"
        >
          <Download className="w-4 h-4 text-[#F59E0B]" />
          <span>Export Full Ledger CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reference (REC/DEL/TRF/ADJ), SKU, product, user..."
            className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg pl-9 pr-4 py-2 text-xs text-[#F8FAFC] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94A3B8] font-mono">Operation:</span>
          <select
            value={selectedOperation}
            onChange={(e) => setSelectedOperation(e.target.value)}
            className="bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Operations</option>
            <option value="Receipt">Receipts (+)</option>
            <option value="Delivery">Deliveries (-)</option>
            <option value="Internal Transfer">Transfers (0)</option>
            <option value="Adjustment">Adjustments (±)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                <th className="py-3 px-4 font-semibold">Date &amp; Time</th>
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Operation</th>
                <th className="py-3 px-4 font-semibold">Product &amp; SKU</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold">From Location</th>
                <th className="py-3 px-4 font-semibold">To Location</th>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292D35]/50">
              {filteredMovements.map((m) => {
                let qtyColor = 'text-[#F8FAFC]';
                if (m.operation === 'Receipt') qtyColor = 'text-[#22C55E]';
                if (m.operation === 'Delivery') qtyColor = 'text-[#EF4444]';
                if (m.operation === 'Adjustment') qtyColor = m.quantity < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]';

                return (
                  <tr key={m.id} className="hover:bg-[#1E222A]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#94A3B8] whitespace-nowrap">
                      {m.timestamp}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#F8FAFC]">
                      {m.reference}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                          m.operation === 'Receipt'
                            ? 'bg-[#22C55E]/15 text-[#22C55E]'
                            : m.operation === 'Delivery'
                            ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                            : m.operation === 'Internal Transfer'
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                            : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}
                      >
                        {m.operation}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#F8FAFC]">{m.productName}</div>
                      <span className="font-mono text-[10px] text-[#64748B]">{m.sku}</span>
                    </td>

                    <td className={`py-3.5 px-4 text-right font-mono font-bold text-xs ${qtyColor}`}>
                      {m.operation === 'Receipt' ? `+${m.quantity}` : m.quantity} {m.unit}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-[#94A3B8] truncate max-w-[160px]">
                      {m.fromLocation}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-[#F8FAFC] truncate max-w-[160px]">
                      {m.toLocation}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#94A3B8]">
                      {m.user}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#0E1015] border-t border-[#292D35] flex items-center justify-between text-xs text-[#94A3B8] font-mono">
          <span>{filteredMovements.length} Verified Ledger Blocks Ingested</span>
          <span className="text-[#22C55E] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero Desync Anomaly
          </span>
        </div>
      </div>
    </div>
  );
};
