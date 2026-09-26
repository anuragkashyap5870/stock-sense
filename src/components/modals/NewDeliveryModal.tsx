import React, { useState } from 'react';
import { useInventory } from '../../store/inventoryStore';
import { X, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const NewDeliveryModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    products,
    warehouses,
    createDelivery,
    validateDelivery,
  } = useInventory();

  const [deliveryNumber, setDeliveryNumber] = useState(`DEL-2026-0${Math.floor(424 + Math.random() * 80)}`);
  const [customer, setCustomer] = useState('Metro Infra Builders Pvt Ltd');
  const [destinationAddress, setDestinationAddress] = useState('Ludhiana Project Site 3-B');
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [cutoffTime, setCutoffTime] = useState('17:30 IST');
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id || 'WH-001');

  // Product selection & quantity
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState('20');
  const [sourceLocation, setSourceLocation] = useState('Rack A-12');
  const [errorMsg, setErrorMsg] = useState('');

  if (activeModal !== 'newDelivery') return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const sourceWh = warehouses.find((w) => w.id === sourceWarehouseId);

  const availableStock = selectedProduct ? selectedProduct.availableStock : 0;
  const numQty = Number(quantity) || 0;
  const isInsufficient = numQty > availableStock;

  const handleSave = (validateImmediate: boolean) => {
    if (!customer.trim()) {
      setErrorMsg('Customer name is required');
      return;
    }
    if (numQty <= 0) {
      setErrorMsg('Quantity must be greater than zero');
      return;
    }

    if (validateImmediate && isInsufficient) {
      setErrorMsg(`Insufficient stock available. Only ${availableStock} ${selectedProduct?.unit} in stock.`);
      return;
    }

    const newId = createDelivery({
      deliveryNumber,
      customer: customer.trim(),
      destinationAddress: destinationAddress.trim() || 'Client Logistics Yard',
      deliveryDate,
      cutoffTime,
      sourceWarehouseId,
      sourceWarehouseName: sourceWh ? sourceWh.name : 'Main Warehouse',
      status: validateImmediate ? 'Ready' : 'Draft',
      workflowStep: validateImmediate ? 'staged' : 'order_created',
      assignedPicker: 'Devinder S. (Scanner #12)',
      notes: 'Outbound dispatch scheduled for client release.',
      items: [
        {
          productId: selectedProductId,
          productName: selectedProduct ? selectedProduct.name : 'Product',
          sku: selectedProduct ? selectedProduct.sku : 'SKU-000',
          quantity: numQty,
          availableStock,
          unit: selectedProduct ? selectedProduct.unit : 'units',
          sourceLocation: sourceLocation.trim() || 'General Bay',
        },
      ],
    });

    if (validateImmediate) {
      const res = validateDelivery(newId);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to validate delivery');
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
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">Create Delivery Order</h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">Outbound client dispatch & inventory deduction</p>
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
                Delivery ID
              </label>
              <input
                type="text"
                value={deliveryNumber}
                onChange={(e) => setDeliveryNumber(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Customer Name <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Metro Infra Builders Pvt Ltd"
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Cutoff Time
              </label>
              <input
                type="text"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Source Warehouse
              </label>
              <select
                value={sourceWarehouseId}
                onChange={(e) => setSourceWarehouseId(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    [{w.code}] {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
              Delivery Destination / Site
            </label>
            <input
              type="text"
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder="e.g. Ludhiana Project Site 3-B, Ring Road"
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
            />
          </div>

          {/* Product & Stock Allocation Card */}
          <div className="p-4 bg-[#0B0D10] border border-[#292D35] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F8FAFC]">Product Stock Allocation</span>
              <span className="text-[11px] font-mono text-[#94A3B8]">
                Available:{' '}
                <span className={`font-bold ${availableStock > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {availableStock} {selectedProduct?.unit}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6 space-y-1">
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

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setErrorMsg('');
                  }}
                  className={`w-full bg-[#171A20] border rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#F8FAFC] focus:outline-none ${
                    isInsufficient ? 'border-[#EF4444] text-[#EF4444]' : 'border-[#292D35]'
                  }`}
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#64748B]">Bay Location</label>
                <input
                  type="text"
                  value={sourceLocation}
                  onChange={(e) => setSourceLocation(e.target.value)}
                  placeholder="Rack A-12"
                  className="w-full bg-[#171A20] border border-[#292D35] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
                />
              </div>
            </div>

            {/* Zero Negative Stock Warning Check */}
            {isInsufficient ? (
              <div className="p-3 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center gap-2 text-xs text-[#EF4444]">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">
                  Insufficient stock available. Order quantity ({numQty}) exceeds available warehouse balance ({availableStock}).
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono pt-1">
                <span>Solvent Order Allocation:</span>
                <span className="text-[#22C55E]">
                  Balance after delivery: {availableStock - numQty} {selectedProduct?.unit}
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-[#EF4444] font-medium">{errorMsg}</p>
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
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-lg bg-[#1E222A] hover:bg-[#292D35] border border-[#292D35] text-xs font-medium text-[#F8FAFC] transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={isInsufficient}
              onClick={() => handleSave(true)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                isInsufficient
                  ? 'bg-[#1E222A] text-[#64748B] cursor-not-allowed border border-[#292D35]'
                  : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validate Delivery & Deduct Stock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
