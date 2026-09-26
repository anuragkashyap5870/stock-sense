import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { StatusBadge } from '../components/common/Badge';
import {
  Truck,
  Plus,
  Search,
  Download,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Printer,
  Check,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const DeliveryOrdersPage: React.FC = () => {
  const {
    deliveries,
    validateDelivery,
    setActiveModal,
    products,
    pendingDeliveriesCount,
    showToast,
  } = useInventory();

  const [filterState, setFilterState] = useState<'ALL' | 'Ready' | 'Waiting' | 'Done'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active highlighted delivery order (defaults to DEL-2026-0423 or first ready)
  const activeDelivery =
    deliveries.find((d) => d.deliveryNumber === 'DEL-2026-0423') ||
    deliveries.find((d) => d.status === 'Ready') ||
    deliveries[0];

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesQ =
      d.deliveryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = filterState === 'ALL' || d.status.toLowerCase() === filterState.toLowerCase();
    return matchesQ && matchesState;
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#171A20] border border-[#292D35] p-5 sm:p-6 rounded-xl shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#3B82F6]/15 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
              Outbound Logistics v4.8
            </span>
            <span className="font-mono text-xs text-[#94A3B8]">Gate Control Synchronized</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC]">
            Delivery Orders &amp; Outbound Logistics
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl">
            Fulfill customer orders, verify available inventory, track pick-and-pack workflow, and validate stock deductions in compliance with strict ledger quotas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => showToast('Barcode Scanned', 'Outbound dispatch barcode verified.', 'info')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-[#F8FAFC] text-xs font-medium rounded-lg transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Scan Barcode</span>
          </button>
          <button
            onClick={() => setActiveModal('newDelivery')}
            className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Delivery Order</span>
          </button>
        </div>
      </div>

      {/* Realtime Outbound Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Outbound Velocity</span>
            <span className="font-mono text-xs text-[#22C55E]">+14.2%</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">142 Orders</span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">Active Batch #4 staged</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Awaiting Dispatch</span>
            <span className="font-mono text-xs text-[#F59E0B]">{pendingDeliveriesCount} Orders</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">2,410 Units</span>
          </div>
          <span className="text-[11px] text-[#3B82F6]">98.4% SLA fulfilment</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Negative Stock Blocks</span>
            <Lock className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#22C55E]">100% Guarded</span>
          </div>
          <span className="text-[11px] text-[#22C55E] font-mono">0 balance anomalies</span>
        </div>

        <div className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#94A3B8]">
            <span className="text-[10px] font-mono uppercase tracking-wider">Bay Utilization</span>
            <span className="font-mono text-xs text-[#3B82F6]">Bay 04 Loaded</span>
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-[#F8FAFC]">8 / 12 Bays</span>
          </div>
          <span className="text-[11px] text-[#94A3B8]">66% peak throughput</span>
        </div>
      </div>

      {/* ACTIVE STAGING CONSOLE (Matches Image 10) */}
      {activeDelivery && (
        <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-xl p-5 space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111318] border border-[#292D35] p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-bold font-mono text-[#F8FAFC]">
                    {activeDelivery.deliveryNumber}
                  </span>
                  <StatusBadge status={activeDelivery.status} size="sm" pulse={activeDelivery.status === 'Ready'} />
                </div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  <span className="font-semibold text-[#F8FAFC]">{activeDelivery.customer}</span>
                  <span className="mx-2">•</span>
                  <span>{activeDelivery.destinationAddress}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
              <div>
                <span className="text-[9px] uppercase text-[#64748B] block">Source Facility</span>
                <span className="font-semibold text-[#F8FAFC]">{activeDelivery.sourceWarehouseName}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-[#64748B] block">Assigned Picker</span>
                <span className="text-[#22C55E] font-medium">{activeDelivery.assignedPicker || 'Devinder S.'}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-[#64748B] block">Cutoff Window</span>
                <span className="text-[#F59E0B] font-bold">{activeDelivery.cutoffTime}</span>
              </div>
            </div>
          </div>

          {/* Stepper Workflow Tracker */}
          <div className="bg-[#0B0D10] border border-[#292D35] p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono text-[#94A3B8]">
              <span className="text-[#F8FAFC] font-semibold uppercase">Outbound Chain of Custody</span>
              <span className="text-[#3B82F6]">
                {activeDelivery.status === 'Done' ? 'Step 4 of 4: Completed' : 'Step 3 of 4: Staged for Carrier Handoff'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded bg-[#171A20] border border-[#22C55E]/30 flex items-center gap-2 text-xs">
                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[#F8FAFC]">1: Created</span>
              </div>
              <div className="p-2 rounded bg-[#171A20] border border-[#22C55E]/30 flex items-center gap-2 text-xs">
                <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[#F8FAFC]">2: Picking Done</span>
              </div>
              <div
                className={`p-2 rounded flex items-center gap-2 text-xs border ${
                  activeDelivery.status === 'Done'
                    ? 'bg-[#171A20] border-[#22C55E]/30 text-[#F8FAFC]'
                    : 'bg-[#1E222A] border-[#F59E0B] text-[#F59E0B] font-bold'
                }`}
              >
                {activeDelivery.status === 'Done' ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />}
                <span>3: Staged in Bay 4</span>
              </div>
              <div
                className={`p-2 rounded flex items-center gap-2 text-xs border ${
                  activeDelivery.status === 'Done'
                    ? 'bg-[#1E222A] border-[#22C55E] text-[#22C55E] font-bold'
                    : 'bg-[#111318] border-[#292D35] text-[#64748B]'
                }`}
              >
                {activeDelivery.status === 'Done' ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <span>4</span>}
                <span>4: Dispatched</span>
              </div>
            </div>
          </div>

          {/* Allocated Outbound Manifest Table */}
          <div className="overflow-x-auto rounded-lg bg-[#0B0D10] border border-[#292D35]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                  <th className="py-3 px-4">Product &amp; SKU</th>
                  <th className="py-3 px-4 text-right">Available in WH</th>
                  <th className="py-3 px-4 text-right">Requested Qty</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Source Location</th>
                  <th className="py-3 px-4 text-center">Verification State</th>
                  <th className="py-3 px-4 text-right">Real-time Stock Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292D35]/50">
                {activeDelivery.items.map((item, idx) => {
                  const prod = products.find((p) => p.id === item.productId);
                  const currentStock = prod ? prod.availableStock : 500;
                  const newStock = Math.max(0, currentStock - (activeDelivery.status === 'Done' ? 0 : item.quantity));

                  return (
                    <tr key={idx} className="hover:bg-[#171A20] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#F8FAFC]">{item.productName}</div>
                        <span className="font-mono text-[10px] text-[#94A3B8]">SKU: {item.sku}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#F8FAFC]">
                        {currentStock.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#F59E0B]">
                        {item.quantity.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#94A3B8]">{item.unit}</td>

                      <td className="py-3.5 px-4 font-mono text-xs text-[#F8FAFC]">
                        <span className="px-2 py-0.5 rounded bg-[#171A20] border border-[#292D35]">
                          {item.sourceLocation}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] font-mono text-[10px] font-bold uppercase">
                          <Check className="w-3.5 h-3.5" />
                          <span>Verified Picked</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono">
                        {activeDelivery.status === 'Done' ? (
                          <span className="text-[#22C55E] font-bold">
                            {currentStock} {item.unit} (Deducted)
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[#94A3B8]">{currentStock} {item.unit}</span>
                            <span className="text-[#3B82F6]">→</span>
                            <span className="text-[#22C55E] font-bold">{newStock} {item.unit}</span>
                            <span className="text-[#EF4444] text-[10px] font-bold">(-{item.quantity} {item.unit})</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Strict Zero Negative Stock Alert Banner */}
          <div className="bg-[#0B0D10] border border-[#22C55E]/30 p-3.5 rounded-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#22C55E]/15 text-[#22C55E] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                  Strict Zero Negative Stock Policy Active
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#22C55E]/20 text-[#22C55E] uppercase">
                    Guaranteed Solvent
                  </span>
                </span>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Requested quantities verified against available stock. Deduction executes atomic balance decrement and signs the movement ledger.
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#64748B]">
              <Lock className="w-3.5 h-3.5" />
              <span>Mutex Locked</span>
            </div>
          </div>

          {/* Dispatch Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('BOL Generated', 'Bill of Lading & Packing Slip exported.', 'info')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-xs font-medium text-[#F8FAFC] transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Generate Packing Slip &amp; BOL</span>
              </button>
            </div>

            {activeDelivery.status !== 'Done' ? (
              <button
                onClick={() => validateDelivery(activeDelivery.id)}
                className="flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-sm font-bold px-6 py-2.5 rounded-lg shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>✓ Validate Delivery &amp; Deduct Stock</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#22C55E]/20 text-[#22C55E] font-bold text-xs border border-[#22C55E]/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Delivery Validated &amp; Stock Deducted</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Outbound Orders Queue */}
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-md p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Outbound Queue &amp; Order Pipeline</h3>
            <span className="text-xs text-[#94A3B8]">Recent dispatches and pending allocations</span>
          </div>

          <div className="flex items-center bg-[#0B0D10] border border-[#292D35] p-1 rounded-lg">
            {(['ALL', 'Ready', 'Waiting', 'Done'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterState(st)}
                className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                  filterState === st
                    ? 'bg-[#1E222A] text-[#F8FAFC] font-semibold shadow-sm'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg bg-[#0B0D10] border border-[#292D35]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0E1015] text-[#94A3B8] font-mono uppercase text-[10px] tracking-wider border-b border-[#292D35]">
                <th className="py-3 px-4 font-semibold">Delivery ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Source WH</th>
                <th className="py-3 px-4 font-semibold text-center">Items</th>
                <th className="py-3 px-4 font-semibold">Cutoff Time</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292D35]/50">
              {filteredDeliveries.map((d) => (
                <tr key={d.id} className="hover:bg-[#171A20] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#F59E0B]">{d.deliveryNumber}</td>
                  <td className="py-3 px-4 font-semibold text-[#F8FAFC]">{d.customer}</td>
                  <td className="py-3 px-4 text-[#94A3B8]">{d.sourceWarehouseName}</td>
                  <td className="py-3 px-4 text-center font-mono text-[#94A3B8]">{d.items.length} SKUs</td>
                  <td className="py-3 px-4 font-mono text-[#F59E0B]">{d.cutoffTime}</td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={d.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    {d.status !== 'Done' ? (
                      <button
                        onClick={() => validateDelivery(d.id)}
                        className="px-2.5 py-1 rounded bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[11px] font-bold shadow-sm"
                      >
                        Validate
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-[#22C55E]">Dispatched</span>
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
