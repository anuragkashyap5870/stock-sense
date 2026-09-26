import React, { useState } from 'react';
import { useInventory } from '../../store/inventoryStore';
import { StatusBadge } from '../common/Badge';
import { History, Filter, Download, ArrowUpRight, ChevronRight } from 'lucide-react';

export const RecentOperationsTable: React.FC = () => {
  const { movements, setActiveTab, setSelectedProductId } = useInventory();
  const [selectedOperation, setSelectedOperation] = useState<string>('ALL');

  const filteredMovements = movements.filter((m) => {
    if (selectedOperation === 'ALL') return true;
    return m.operation.toLowerCase() === selectedOperation.toLowerCase();
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Reference', 'Operation', 'Product', 'SKU', 'Quantity', 'Unit', 'From', 'To', 'User'];
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
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Recent_Moves_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden flex flex-col">
      {/* Table Title and Actions */}
      <div className="p-4 sm:p-4.5 bg-[#14171D] border-b border-[#292D35] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Live Operational Moves</h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-medium">
            Real-Time Sync
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Operation Filter */}
          <div className="relative">
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="bg-[#171A20] border border-[#292D35] text-[#94A3B8] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F59E0B] cursor-pointer"
            >
              <option value="ALL">All Operations</option>
              <option value="Receipt">Receipts</option>
              <option value="Delivery">Deliveries</option>
              <option value="Internal Transfer">Transfers</option>
              <option value="Adjustment">Adjustments</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171A20] hover:bg-[#1E222A] border border-[#292D35] text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
              <th className="py-3 px-4 font-semibold">Reference</th>
              <th className="py-3 px-4 font-semibold">Operation</th>
              <th className="py-3 px-4 font-semibold">Product / SKU</th>
              <th className="py-3 px-4 font-semibold text-right">Quantity</th>
              <th className="py-3 px-4 font-semibold">Facility Route</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292D35]/50 font-normal">
            {filteredMovements.slice(0, 6).map((m) => {
              const isPositive = m.quantity > 0 && m.operation !== 'Delivery';
              const isNegative = m.quantity < 0 || m.operation === 'Delivery';

              let qtyColor = 'text-[#F8FAFC]';
              if (m.operation === 'Receipt') qtyColor = 'text-[#22C55E]';
              if (m.operation === 'Delivery') qtyColor = 'text-[#EF4444]';
              if (m.operation === 'Adjustment') qtyColor = m.quantity < 0 ? 'text-[#EF4444]' : 'text-[#22C55E]';

              return (
                <tr
                  key={m.id}
                  className="hover:bg-[#1E222A]/70 transition-colors group cursor-pointer"
                  onClick={() => {
                    setSelectedProductId(m.productId);
                    setActiveTab('product-detail');
                  }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                      <span>{m.reference}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8]" />
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                        m.operation === 'Receipt'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : m.operation === 'Delivery'
                          ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                          : m.operation === 'Internal Transfer'
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                          : 'bg-[#EF4444]/15 text-[#EF4444]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          m.operation === 'Receipt'
                            ? 'bg-[#22C55E]'
                            : m.operation === 'Delivery'
                            ? 'bg-[#3B82F6]'
                            : m.operation === 'Internal Transfer'
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#EF4444]'
                        }`}
                      />
                      {m.operation}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-[#F8FAFC] truncate max-w-[200px]">{m.productName}</div>
                    <div className="font-mono text-[10px] text-[#64748B]">{m.sku}</div>
                  </td>

                  <td className={`py-3 px-4 text-right font-mono font-bold text-xs ${qtyColor}`}>
                    {m.operation === 'Receipt' ? `+${m.quantity}` : m.quantity} {m.unit}
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-xs text-[#F8FAFC] truncate max-w-[220px]">
                      {m.operation === 'Internal Transfer' ? (
                        <span>
                          {m.fromLocation} → <span className="text-[#F59E0B]">{m.toLocation}</span>
                        </span>
                      ) : (
                        <span>{m.toLocation}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-[#64748B] block truncate">By {m.user}</span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={m.status} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-[#94A3B8] text-[11px] whitespace-nowrap">
                    {m.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer link */}
      <div className="p-3 bg-[#0E1015] border-t border-[#292D35] flex items-center justify-between text-xs">
        <span className="text-[#64748B] text-[11px]">
          Showing latest operations across active facilities
        </span>
        <button
          onClick={() => setActiveTab('move-history-ledger')}
          className="text-[#F59E0B] hover:text-[#FBBF24] font-medium flex items-center gap-1 transition-colors"
        >
          <span>View Complete Audit Ledger</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
