import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { BarChart3, Download, Filter, TrendingUp, Layers, CheckCircle2, FileSpreadsheet } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const {
    products,
    movements,
    receipts,
    deliveries,
    warehouses,
    totalProductsCount,
    totalStockUnits,
    totalInventoryValuation,
    lowStockCount,
    showToast,
  } = useInventory();

  const [reportType, setReportType] = useState<
    'summary' | 'movement' | 'low_stock' | 'incoming' | 'outgoing' | 'transfers' | 'adjustments'
  >('summary');
  const [selectedWh, setSelectedWh] = useState<string>('ALL');

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'summary' || reportType === 'low_stock') {
      headers = ['Product Name', 'SKU', 'Category', 'Unit', 'Stock Available', 'Reorder Level', 'Valuation ($)'];
      const targetProds =
        reportType === 'low_stock'
          ? products.filter((p) => p.availableStock <= p.reorderLevel)
          : products;

      rows = targetProds.map((p) => [
        `"${p.name}"`,
        p.sku,
        p.category,
        p.unit,
        p.availableStock,
        p.reorderLevel,
        p.availableStock * (p.unitPrice || 50),
      ]);
    } else {
      headers = ['Timestamp', 'Reference', 'Operation', 'Product Name', 'SKU', 'Quantity', 'From', 'To', 'User'];
      rows = movements.map((m) => [
        m.timestamp,
        m.reference,
        m.operation,
        `"${m.productName}"`,
        m.sku,
        m.quantity,
        `"${m.fromLocation}"`,
        `"${m.toLocation}"`,
        m.user,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_${reportType.toUpperCase()}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report Exported', `${reportType.replace('_', ' ').toUpperCase()} report exported successfully.`, 'success');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded font-bold">
              Business Intelligence &amp; Auditing
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1">
            Inventory Analytics &amp; Reports
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Generate valuation audits, turnover velocity reports, and stock discrepancy summaries.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Report CSV</span>
        </button>
      </div>

      {/* Report Segment Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'summary', label: 'Inventory Summary' },
          { id: 'movement', label: 'Stock Movement Ledger' },
          { id: 'low_stock', label: 'Low Stock & Critical' },
          { id: 'incoming', label: 'Incoming Vendor Goods' },
          { id: 'outgoing', label: 'Outgoing Dispatches' },
          { id: 'transfers', label: 'Internal Transfers' },
          { id: 'adjustments', label: 'Audit Adjustments' },
        ].map((rep) => (
          <button
            key={rep.id}
            onClick={() => setReportType(rep.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
              reportType === rep.id
                ? 'bg-[#1E222A] text-[#F59E0B] border border-[#F59E0B] shadow-sm font-semibold'
                : 'bg-[#171A20] border border-[#292D35] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {rep.label}
          </button>
        ))}
      </div>

      {/* KPI Overview Tiles for Report */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-[#171A20] border border-[#292D35]">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Valuation Total</span>
          <span className="text-xl font-bold font-mono text-[#22C55E] mt-1 block">
            ${totalInventoryValuation.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#64748B]">Across all facilities</span>
        </div>
        <div className="p-4 rounded-xl bg-[#171A20] border border-[#292D35]">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Total Units</span>
          <span className="text-xl font-bold font-mono text-[#F8FAFC] mt-1 block">
            {totalStockUnits.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#64748B]">On-hand available balance</span>
        </div>
        <div className="p-4 rounded-xl bg-[#171A20] border border-[#292D35]">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Low Stock SKUs</span>
          <span className="text-xl font-bold font-mono text-[#F59E0B] mt-1 block">
            {lowStockCount}
          </span>
          <span className="text-[10px] text-[#64748B]">Buffer threshold active</span>
        </div>
        <div className="p-4 rounded-xl bg-[#171A20] border border-[#292D35]">
          <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Ledger Records</span>
          <span className="text-xl font-bold font-mono text-[#3B82F6] mt-1 block">
            {movements.length}
          </span>
          <span className="text-[10px] text-[#64748B]">Audited operations</span>
        </div>
      </div>

      {/* Report Table Display */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-[#14171D] border-b border-[#292D35] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            {reportType.replace('_', ' ').toUpperCase()} TABLE VIEW
          </h3>
          <span className="font-mono text-xs text-[#22C55E]">Automated Audit Reconciled</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'summary' || reportType === 'low_stock' ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                  <th className="py-3 px-4 text-right">Reorder Level</th>
                  <th className="py-3 px-4 text-right">Asset Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292D35]/50">
                {(reportType === 'low_stock'
                  ? products.filter((p) => p.availableStock <= p.reorderLevel)
                  : products
                ).map((p) => (
                  <tr key={p.id} className="hover:bg-[#1E222A]/60">
                    <td className="py-3 px-4 font-semibold text-[#F8FAFC]">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-[#94A3B8]">{p.sku}</td>
                    <td className="py-3 px-4">{p.category}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#22C55E]">
                      {p.availableStock} {p.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#94A3B8]">
                      {p.reorderLevel} {p.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#F8FAFC]">
                      ${((p.availableStock || 0) * (p.unitPrice || 50)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Product &amp; SKU</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292D35]/50">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-[#1E222A]/60">
                    <td className="py-3 px-4 font-mono text-[11px] text-[#94A3B8]">{m.timestamp}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#F8FAFC]">{m.reference}</td>
                    <td className="py-3 px-4 font-mono text-[#F59E0B] font-semibold uppercase">{m.operation}</td>
                    <td className="py-3 px-4 text-[#F8FAFC] font-medium">{m.productName} ({m.sku})</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#22C55E]">
                      {m.quantity > 0 && m.operation === 'Receipt' ? `+${m.quantity}` : m.quantity} {m.unit}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#94A3B8]">
                      {m.fromLocation} → {m.toLocation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
