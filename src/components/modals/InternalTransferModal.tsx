import React, { useState } from 'react';
import { useInventory } from '../../store/inventoryStore';
import { X, ArrowLeftRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const InternalTransferModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    products,
    warehouses,
    createInternalTransfer,
    executeInternalTransfer,
    currentUser,
  } = useInventory();

  const [transferNumber, setTransferNumber] = useState(`TRF-2026-0${Math.floor(160 + Math.random() * 80)}`);
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [sourceLocation, setSourceLocation] = useState('Rack A-12');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(warehouses[1]?.id || 'WH-002');
  const [destinationLocation, setDestinationLocation] = useState('Production Floor Line #4');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState('30');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [errorMsg, setErrorMsg] = useState('');

  if (activeModal !== 'newTransfer') return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const sourceWh = warehouses.find((w) => w.id === sourceWarehouseId);
  const destWh = warehouses.find((w) => w.id === destinationWarehouseId);

  // Find stock in source warehouse location
  const locStock = selectedProduct?.locationStocks.find(
    (ls) => ls.warehouseId === sourceWarehouseId && ls.locationName === sourceLocation
  );
  const availableInLocation = locStock ? locStock.quantity : selectedProduct?.availableStock || 0;
  const numQty = Number(quantity) || 0;
  const isOverLimit = numQty > availableInLocation;

  const handleSave = (executeImmediate: boolean) => {
    if (numQty <= 0) {
      setErrorMsg('Quantity must be greater than zero');
      return;
    }
    if (executeImmediate && isOverLimit) {
      setErrorMsg(`Cannot transfer ${numQty} ${selectedProduct?.unit}. Only ${availableInLocation} ${selectedProduct?.unit} available at ${sourceLocation}.`);
      return;
    }

    const newId = createInternalTransfer({
      transferNumber,
      sourceWarehouseId,
      sourceWarehouseName: sourceWh ? sourceWh.name : 'Source WH',
      sourceLocation,
      destinationWarehouseId,
      destinationWarehouseName: destWh ? destWh.name : 'Dest WH',
      destinationLocation,
      productId: selectedProductId,
      productName: selectedProduct ? selectedProduct.name : 'Product',
      sku: selectedProduct ? selectedProduct.sku : 'SKU-000',
      quantity: numQty,
      unit: selectedProduct ? selectedProduct.unit : 'units',
      transferDate,
      status: executeImmediate ? 'Ready' : 'Draft',
      operator: currentUser.name,
      notes: `Relocated from ${sourceLocation} to ${destinationLocation}. Total company stock preserved.`,
    });

    if (executeImmediate) {
      const res = executeInternalTransfer(newId);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to execute transfer');
        return;
      }
    }

    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#292D35] flex items-center justify-between bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">Internal Stock Transfer</h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">Inter-facility and bay relocation • Company stock conserved</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Transfer Reference
              </label>
              <input
                type="text"
                value={transferNumber}
                onChange={(e) => setTransferNumber(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Transfer Date
              </label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          {/* Product Selection */}
          <div className="p-3.5 bg-[#0B0D10] border border-[#292D35] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F8FAFC]">Product To Transfer</span>
              <span className="text-[11px] font-mono text-[#94A3B8]">
                Company Stock: <span className="text-[#22C55E] font-bold">{selectedProduct?.availableStock} {selectedProduct?.unit}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">Select SKU</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-[#171A20] border border-[#292D35] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - {p.availableStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">
                  Quantity ({selectedProduct?.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-[#171A20] border border-[#292D35] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Source vs Destination Route Mapping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Source */}
            <div className="p-3.5 bg-[#111318] border border-[#292D35] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#F59E0B] font-semibold">
                <span>ORIGIN (Source)</span>
                <span className="text-[10px] font-mono text-[#94A3B8]">
                  Available: {availableInLocation} {selectedProduct?.unit}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">Source Facility</label>
                <select
                  value={sourceWarehouseId}
                  onChange={(e) => setSourceWarehouseId(e.target.value)}
                  className="w-full bg-[#171A20] border border-[#292D35] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.code}] {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">Source Location / Bay</label>
                <input
                  type="text"
                  value={sourceLocation}
                  onChange={(e) => setSourceLocation(e.target.value)}
                  placeholder="Rack A-12"
                  className="w-full bg-[#171A20] border border-[#292D35] rounded px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>

            {/* Destination */}
            <div className="p-3.5 bg-[#111318] border border-[#292D35] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#22C55E] font-semibold">
                <span>DESTINATION (Target)</span>
                <span className="text-[10px] font-mono text-[#22C55E]">Receives +{numQty} {selectedProduct?.unit}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">Target Facility</label>
                <select
                  value={destinationWarehouseId}
                  onChange={(e) => setDestinationWarehouseId(e.target.value)}
                  className="w-full bg-[#171A20] border border-[#292D35] rounded px-2.5 py-1.5 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.code}] {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">Target Location / Line</label>
                <input
                  type="text"
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  placeholder="Production Floor Line #4"
                  className="w-full bg-[#171A20] border border-[#292D35] rounded px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {isOverLimit && (
            <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center gap-2 text-xs text-[#EF4444]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                Quantity ({numQty}) exceeds available balance ({availableInLocation}) in source location.
              </span>
            </div>
          )}

          {errorMsg && <p className="text-xs text-[#EF4444] font-medium">{errorMsg}</p>}

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
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-lg bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-xs font-medium text-[#F8FAFC] transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={isOverLimit}
              onClick={() => handleSave(true)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                isOverLimit
                  ? 'bg-[#1E222A] text-[#64748B] cursor-not-allowed border border-[#292D35]'
                  : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Execute Transfer &amp; Relocate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
