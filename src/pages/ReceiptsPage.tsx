import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { StatusBadge } from '../components/common/Badge';
import {
  ClipboardCheck,
  Plus,
  Search,
  Download,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Layers,
  Printer,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const ReceiptsPage: React.FC = () => {
  const {
    receipts,
    validateReceipt,
    setActiveModal,
    products,
    pendingReceiptsCount,
    showToast,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Active highlighted receipt for inspection console (defaults to REC-2026-0892 if ready, or first pending)
  const activeReceipt =
    receipts.find((r) => r.receiptNumber === 'REC-2026-0892') ||
    receipts.find((r) => r.status === 'Ready' || r.status === 'Waiting') ||
    receipts[0];

  const filteredReceipts = receipts.filter((r) => {
    const matchesQ =
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.poReference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesQ && matchesStatus;
  });

  const handleExport = () => {
    const headers = ['Receipt Number', 'Vendor', 'PO Reference', 'Date', 'Destination', 'Status', 'Operator'];
    const rows = filteredReceipts.map((r) => [
      r.receiptNumber,
      `"${r.vendor}"`,
      r.poReference,
      r.receiptDate,
      `"${r.destinationWarehouseName}"`,
      r.status,
      `"${r.operator}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockSense_Receipts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Completed', 'Inbound receipts downloaded as CSV.', 'success');
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#22C55E]/15 text-[#22C55E] px-2 py-0.5 rounded font-bold">
              Inbound Logistics Engine
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">SYS_GATE_02 ACTIVE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Receipts &amp; Inward Goods
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl">
            Process incoming vendor shipments, inspect items, and automatically update warehouse stock on validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => showToast('Barcode Scanned', 'Waybill QR verified against Gate Bay 2 telemetry.', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-medium rounded-lg transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Scan Slip</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-medium rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setActiveModal('newReceipt')}
            className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Receipt</span>
          </button>
        </div>
      </div>

      {/* Top Inbound Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Pending Inward</span>
            <ClipboardCheck className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">{pendingReceiptsCount}</span>
            <span className="text-xs text-[#94A3B8] ml-2">Shipments</span>
          </div>
          <div className="text-[11px] text-[#F59E0B] font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
            <span>4 arriving today</span>
          </div>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Ready for Inspection</span>
            <Package className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">3</span>
            <span className="text-xs text-[#94A3B8] ml-2">Shipments</span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">Dock Bays 1, 2, 4</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Validated This Week</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#22C55E]">29</span>
            <span className="text-xs text-[#94A3B8] ml-2">Shipments</span>
          </div>
          <span className="text-[11px] text-[#22C55E] font-mono">Stock auto-credited</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Discrepancies Flagged</span>
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#EF4444]">1</span>
            <span className="text-xs text-[#94A3B8] ml-2">Shipment</span>
          </div>
          <span className="text-[11px] text-[#EF4444] font-mono">Damage RMA flagged (#884)</span>
        </div>
      </div>

      {/* PRIMARY WORK UNIT: Active Inspection Console (Matches Image 6) */}
      {activeReceipt && (
        <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Active Receipt Header */}
          <div className="p-5 bg-[#14171D] border-b border-[#292D35] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-lg bg-[#1E222A] flex items-center justify-center text-[#F59E0B]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold font-mono text-[#F8FAFC]">
                    {activeReceipt.receiptNumber}
                  </span>
                  <StatusBadge status={activeReceipt.status} size="sm" pulse={activeReceipt.status === 'Ready'} />
                </div>
                <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
                  <span className="font-semibold text-[#F8FAFC]">{activeReceipt.vendor}</span>
                  <span>•</span>
                  <span className="font-mono">GSTIN: 07AAAAA0000A1Z5</span>
                </div>
              </div>
            </div>

            {/* Quick Metadata pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
              <div className="bg-[#0B0D10] border border-[#292D35]/50 px-3 py-1.5 rounded-lg flex flex-col">
                <span className="text-[9px] font-mono uppercase text-[#64748B]">PO Reference</span>
                <span className="font-mono text-xs font-semibold text-[#F59E0B]">
                  {activeReceipt.poReference}
                </span>
              </div>
              <div className="bg-[#0B0D10] border border-[#292D35]/50 px-3 py-1.5 rounded-lg flex flex-col">
                <span className="text-[9px] font-mono uppercase text-[#64748B]">Destination</span>
                <span className="text-xs font-medium text-[#F8FAFC] truncate">
                  {activeReceipt.destinationWarehouseName}
                </span>
              </div>
              <div className="bg-[#0B0D10] border border-[#292D35]/50 px-3 py-1.5 rounded-lg flex flex-col col-span-2 sm:col-span-1">
                <span className="text-[9px] font-mono uppercase text-[#64748B]">Inbound Staging</span>
                <span className="font-mono text-xs text-[#22C55E] font-medium">Bay 2 - Fast Track</span>
              </div>
            </div>
          </div>

          {/* Itemized Manifest Section */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Itemized Cargo Manifest</h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0B0D10] text-[#94A3B8]">
                  {activeReceipt.items.length} SKU Lines
                </span>
              </div>
              <button
                onClick={() => showToast('Barcode Verified', 'Cargo serial batches verified by scanner.', 'info')}
                className="text-xs font-mono text-[#F59E0B] hover:underline flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Verify Barcodes</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl bg-[#0B0D10] border border-[#292D35]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                    <th className="py-3 px-4">Product &amp; SKU</th>
                    <th className="py-3 px-4 text-right">Expected</th>
                    <th className="py-3 px-4 text-right">Received</th>
                    <th className="py-3 px-4 text-center">Unit</th>
                    <th className="py-3 px-4">Destination Rack / Bin</th>
                    <th className="py-3 px-4">Inspection Status</th>
                    <th className="py-3 px-4 text-right">Live Stock Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#292D35]/50">
                  {activeReceipt.items.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const currentStock = prod ? prod.availableStock : 500;
                    const stockAfterValidation = currentStock + (activeReceipt.status === 'Done' ? 0 : item.receivedQty);

                    return (
                      <tr key={idx} className="hover:bg-[#171A20] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#F8FAFC]">{item.productName}</div>
                          <span className="font-mono text-[10px] text-[#94A3B8]">SKU: {item.sku}</span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-[#94A3B8]">
                          {item.expectedQty}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-block bg-[#171A20] border border-[#292D35] px-2.5 py-0.5 rounded font-mono font-bold text-[#F8FAFC]">
                            {item.receivedQty}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-[#94A3B8]">{item.unit}</td>

                        <td className="py-3.5 px-4 font-mono text-xs">
                          <span className="px-2 py-0.5 rounded bg-[#171A20] text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
                            {item.destinationLocation}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-mono text-[10px] font-semibold uppercase">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Inspected &amp; Passed</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono">
                          {activeReceipt.status === 'Done' ? (
                            <span className="text-[#22C55E] font-bold">
                              {currentStock} {item.unit} (Credited)
                            </span>
                          ) : (
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1">
                                <span className="text-[#94A3B8] line-through">{currentStock} {item.unit}</span>
                                <span className="text-[#22C55E]">→</span>
                                <span className="font-bold text-[#22C55E]">{stockAfterValidation} {item.unit}</span>
                              </div>
                              <span className="text-[10px] text-[#22C55E] font-bold">
                                +{item.receivedQty} {item.unit} upon validation
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Bar at Bottom of Inspection Console */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => showToast('Discrepancy Form', 'Discrepancy ticket #RMA-892 generated.', 'warning')}
                  className="px-3 py-2 rounded-lg bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-xs font-medium text-[#EF4444] transition-colors"
                >
                  Report Discrepancy
                </button>
                <button
                  onClick={() => showToast('GRN Printed', 'Goods Receipt Note sent to printer.', 'info')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-xs font-medium text-[#F8FAFC] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>Print GRN</span>
                </button>
              </div>

              {/* The Key Action Button */}
              {activeReceipt.status !== 'Done' ? (
                <button
                  onClick={() => validateReceipt(activeReceipt.id)}
                  className="flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-sm font-bold px-6 py-2.5 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>✓ Validate Receipt &amp; Update Stock</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E]/20 text-[#22C55E] font-bold text-xs border border-[#22C55E]/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Receipt Validated &amp; Stock Active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historical Inward Receipts Ledger */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-[#14171D] border-b border-[#292D35] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Recent Inward Receipts</h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#0B0D10] text-[#94A3B8]">
              Audit Trail
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter receipts..."
                className="bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] text-xs text-[#F8FAFC] pl-8 pr-3 py-1.5 rounded-lg focus:outline-none w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                <th className="py-3 px-4 font-semibold">Receipt ID</th>
                <th className="py-3 px-4 font-semibold">Vendor</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold">Destination Hub</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292D35]/50">
              {filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-[#1E222A]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#F59E0B]">{r.receiptNumber}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#F8FAFC]">{r.vendor}</div>
                    <span className="font-mono text-[10px] text-[#64748B]">{r.poReference}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#94A3B8]">{r.receiptDate}</td>
                  <td className="py-3 px-4 text-center font-mono text-[#94A3B8]">{r.items.length} SKUs</td>
                  <td className="py-3 px-4 text-[#F8FAFC]">{r.destinationWarehouseName}</td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.status !== 'Done' ? (
                      <button
                        onClick={() => validateReceipt(r.id)}
                        className="px-2.5 py-1 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-[11px] font-bold shadow-sm"
                      >
                        Validate
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-[#22C55E]">Validated</span>
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
