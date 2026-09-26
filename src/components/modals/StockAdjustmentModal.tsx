import React, { useState } from 'react';
import { useInventory } from '../../store/inventoryStore';
import { X, SlidersHorizontal, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AdjustmentReason } from '../../types/inventory';

export const StockAdjustmentModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    products,
    warehouses,
    createStockAdjustment,
    applyStockAdjustment,
    currentUser,
  } = useInventory();

  const [adjustmentNumber, setAdjustmentNumber] = useState(`ADJ-2026-0${Math.floor(95 + Math.random() * 90)}`);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [location, setLocation] = useState('Rack A-12');
  const [reason, setReason] = useState<AdjustmentReason>('Damaged');
  const [notes, setNotes] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedWh = warehouses.find((w) => w.id === warehouseId);

  const systemQuantity = selectedProduct ? selectedProduct.availableStock : 0;
  const [physicalCount, setPhysicalCount] = useState(systemQuantity.toString());

  const numPhysical = Number(physicalCount) || 0;
  const difference = numPhysical - systemQuantity;

  if (activeModal !== 'newAdjustment') return null;

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const p = products.find((prod) => prod.id === prodId);
    if (p) {
      setPhysicalCount(p.availableStock.toString());
      setWarehouseId(p.warehouseId);
      setLocation(p.primaryLocation);
    }
  };

  const handleApply = () => {
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    const adjId = createStockAdjustment({
      adjustmentNumber,
      productId: selectedProductId,
      productName: selectedProduct ? selectedProduct.name : 'Product',
      sku: selectedProduct ? selectedProduct.sku : 'SKU-000',
      warehouseId,
      warehouseName: selectedWh ? selectedWh.name : 'Main Warehouse',
      location: location.trim() || 'General Bay',
      systemQuantity,
      physicalCount: numPhysical,
      difference,
      unit: selectedProduct ? selectedProduct.unit : 'units',
      reason,
      notes: notes.trim() || `Physical audit reconciliation (${reason})`,
      operator: currentUser.name,
      status: 'Draft',
    });

    applyStockAdjustment(adjId);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#292D35] flex items-center justify-between bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">Physical Stock Adjustment</h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">Audit variance &amp; write-off reconciliation</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-[#1E222A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Adjustment Doc
              </label>
              <input
                type="text"
                value={adjustmentNumber}
                onChange={(e) => setAdjustmentNumber(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Variance Reason <span className="text-[#F59E0B]">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
                <option value="Counting Error">Counting Error</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
              Select Product SKU <span className="text-[#F59E0B]">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - {p.availableStock} {p.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Facility
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Bay / Aisle Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Rack A-12 / Scrap QA Zone"
                className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          {/* Reconciliation Count Box */}
          <div className="p-4 bg-[#0B0D10] border border-[#292D35] rounded-xl grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-[#64748B]">System Quantity</span>
              <span className="text-lg font-bold font-mono text-[#F8FAFC] mt-1">
                {systemQuantity} <span className="text-xs font-normal text-[#94A3B8]">{selectedProduct?.unit}</span>
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-[#F59E0B]">Physical Count</span>
              <input
                type="number"
                min="0"
                value={physicalCount}
                onChange={(e) => setPhysicalCount(e.target.value)}
                className="w-24 mx-auto mt-1 bg-[#171A20] border border-[#F59E0B] rounded px-2 py-1 text-center font-mono font-bold text-sm text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] font-mono uppercase text-[#64748B]">Calculated Delta</span>
              <span
                className={`text-lg font-bold font-mono mt-1 ${
                  difference < 0 ? 'text-[#EF4444]' : difference > 0 ? 'text-[#22C55E]' : 'text-[#94A3B8]'
                }`}
              >
                {difference > 0 ? `+${difference}` : difference} <span className="text-xs font-normal">{selectedProduct?.unit}</span>
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
              Inspection Notes / Incident Log
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Forklift impact damage during transit or physical stock recount variance..."
              className="w-full bg-[#0B0D10] border border-[#292D35] rounded-lg p-2.5 text-xs text-[#F8FAFC] focus:outline-none resize-none"
            />
          </div>

          {/* Confirmation Warning Step */}
          {confirmStep && (
            <div className="p-3.5 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/40 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Confirmation Required to Overwrite Inventory Balance</span>
              </div>
              <p className="text-xs text-[#E2E8F0]">
                Applying this adjustment will immediately change system stock for{' '}
                <span className="font-bold text-[#F8FAFC]">{selectedProduct?.name}</span> from{' '}
                <span className="font-mono text-[#F59E0B]">{systemQuantity}</span> to{' '}
                <span className="font-mono text-[#22C55E]">{numPhysical} {selectedProduct?.unit}</span>.
              </p>
            </div>
          )}

          <div className="pt-3 border-t border-[#292D35] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-lg bg-[#111318] hover:bg-[#1E222A] border border-[#292D35] text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                confirmStep
                  ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white active:scale-95 animate-pulse'
                  : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{confirmStep ? 'Confirm & Apply Adjustment' : 'Review & Adjust Stock'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
