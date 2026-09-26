import React, { useState } from 'react';
import { useInventory } from '../../store/inventoryStore';
import { X, ClipboardCheck, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const NewReceiptModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    products,
    warehouses,
    createReceipt,
    validateReceipt,
    currentUser,
  } = useInventory();

  const [receiptNumber, setReceiptNumber] = useState(`REC-2026-0${Math.floor(893 + Math.random() * 90)}`);
  const [vendor, setVendor] = useState('Tata Steel Industries Ltd.');
  const [poReference, setPoReference] = useState(`PO-${Math.floor(99410 + Math.random() * 50)}`);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10));
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(warehouses[0]?.id || 'WH-001');

  // Multi-item rows
  const [items, setItems] = useState([
    {
      productId: products[0]?.id || '',
      expectedQty: 100,
      receivedQty: 100,
      destinationLocation: 'Rack A-12',
    },
  ]);

  if (activeModal !== 'newReceipt') return null;

  const destWh = warehouses.find((w) => w.id === destinationWarehouseId);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || '',
        expectedQty: 50,
        receivedQty: 50,
        destinationLocation: 'Receiving Bay 2',
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleSave = (validateImmediate: boolean) => {
    if (!vendor.trim()) return;

    const formattedItems = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod ? prod.name : 'Unknown Product',
        sku: prod ? prod.sku : 'SKU-000',
        expectedQty: Number(it.expectedQty) || 0,
        receivedQty: Number(it.receivedQty) || 0,
        unit: prod ? prod.unit : 'units',
        destinationLocation: it.destinationLocation,
      };
    });

    const newId = createReceipt({
      receiptNumber,
      vendor: vendor.trim(),
      poReference: poReference.trim(),
      receiptDate,
      destinationWarehouseId,
      destinationWarehouseName: destWh ? destWh.name : 'Main Warehouse',
      destinationLocation: items[0]?.destinationLocation || 'Receiving Dock',
      items: formattedItems,
      status: validateImmediate ? 'Ready' : 'Draft',
      operator: currentUser.name,
      notes: 'Incoming vendor consignment registered via Inbound Engine.',
    });

    if (validateImmediate) {
      validateReceipt(newId);
    }

    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#292D35] flex items-center justify-between bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">Create Inward Goods Receipt</h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">Process incoming vendor cargo and credit ledger</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Receipt Number
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Vendor / Supplier <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. Tata Steel Industries Ltd."
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                PO Reference
              </label>
              <input
                type="text"
                value={poReference}
                onChange={(e) => setPoReference(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Receipt Date
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Destination Warehouse
              </label>
              <select
                value={destinationWarehouseId}
                onChange={(e) => setDestinationWarehouseId(e.target.value)}
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

          {/* Itemized Manifest Rows */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F8FAFC]">Cargo Manifest Lines</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-[11px] font-mono text-[#F59E0B] hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#0B0D10] border border-[#292D35] rounded-lg grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                  >
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[#64748B]">Product SKU</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full bg-[#171A20] border border-[#292D35] rounded px-2 py-1.5 text-xs text-[#F8FAFC] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[#64748B]">Expected</label>
                      <input
                        type="number"
                        min="1"
                        value={item.expectedQty}
                        onChange={(e) => handleItemChange(idx, 'expectedQty', e.target.value)}
                        className="w-full bg-[#171A20] border border-[#292D35] rounded px-2 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[#22C55E]">Received</label>
                      <input
                        type="number"
                        min="1"
                        value={item.receivedQty}
                        onChange={(e) => handleItemChange(idx, 'receivedQty', e.target.value)}
                        className="w-full bg-[#171A20] border border-[#292D35] rounded px-2 py-1.5 text-xs font-mono text-[#22C55E] font-bold focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-mono uppercase text-[#64748B]">
                        Rack / Bin ({prod?.unit || 'u'})
                      </label>
                      <input
                        type="text"
                        value={item.destinationLocation}
                        onChange={(e) => handleItemChange(idx, 'destinationLocation', e.target.value)}
                        placeholder="Rack A-12"
                        className="w-full bg-[#171A20] border border-[#292D35] rounded px-2 py-1.5 text-xs font-mono text-[#F8FAFC] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] rounded hover:bg-[#1E222A]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-[#111318] border border-[#292D35] rounded-lg text-xs text-[#94A3B8] flex items-center justify-between">
            <span>
              Validation automatically credits target warehouse stock and writes an immutable audit record.
            </span>
            <span className="font-mono text-[#22C55E] font-bold">Auto-Reconcile Ready</span>
          </div>

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
              onClick={() => handleSave(true)}
              className="px-5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validate Receipt & Update Stock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
