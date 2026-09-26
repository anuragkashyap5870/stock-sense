import React, { useState } from 'react';
import { useInventory } from '../../store/inventoryStore';
import { X, PackagePlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ProductCategory } from '../../types/inventory';

export const NewProductModal: React.FC = () => {
  const { activeModal, setActiveModal, addProduct, warehouses } = useInventory();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Raw Materials');
  const [unit, setUnit] = useState('kg');
  const [initialStock, setInitialStock] = useState('100');
  const [reorderLevel, setReorderLevel] = useState('50');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [primaryLocation, setPrimaryLocation] = useState('Rack A-12');
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unitPrice, setUnitPrice] = useState('50.0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (activeModal !== 'newProduct') return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!sku.trim()) errs.sku = 'SKU code is required';
    if (!unit.trim()) errs.unit = 'Unit of measure is required';
    if (isNaN(Number(initialStock)) || Number(initialStock) < 0) {
      errs.initialStock = 'Initial stock must be 0 or greater';
    }
    if (isNaN(Number(reorderLevel)) || Number(reorderLevel) < 0) {
      errs.reorderLevel = 'Reorder buffer must be 0 or greater';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const wh = warehouses.find((w) => w.id === warehouseId);
    const stockVal = Math.max(0, Number(initialStock));

    const success = addProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      unit: unit.trim().toLowerCase(),
      availableStock: stockVal,
      reserved: 0,
      reorderLevel: Number(reorderLevel) || 50,
      warehouseId,
      warehouseName: wh ? wh.name : 'Main Warehouse',
      primaryLocation: primaryLocation.trim() || 'General Bay',
      description: description.trim() || 'Standard inventory catalog item.',
      barcode: barcode.trim() || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      unitPrice: Number(unitPrice) || 50,
      leadTimeDays: 3,
      locationStocks: [
        {
          warehouseId,
          warehouseName: wh ? wh.name : 'Main Warehouse',
          locationName: primaryLocation.trim() || 'General Bay',
          quantity: stockVal,
        },
      ],
    });

    if (success) {
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171A20] border border-[#292D35] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#292D35] flex items-center justify-between bg-[#111318]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F8FAFC]">Add New Product</h2>
              <p className="text-[11px] font-mono text-[#94A3B8]">Register new SKU into StockSense catalog</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="text-[#94A3B8] hover:text-[#F8FAFC] p-1 rounded-lg hover:bg-[#1E222A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
              Product Name <span className="text-[#F59E0B]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stainless Steel Seamless Pipe 3/4 inch"
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
            />
            {errors.name && <p className="text-[11px] text-[#EF4444]">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                SKU / Product Code <span className="text-[#F59E0B]">*</span>
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. STL-209-A"
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
              />
              {errors.sku && <p className="text-[11px] text-[#EF4444]">{errors.sku}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Barcode / UPC
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 89012489012"
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Category <span className="text-[#F59E0B]">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                <option value="Raw Materials">Raw Materials</option>
                <option value="Components">Components</option>
                <option value="Finished Goods">Finished Goods</option>
                <option value="Electrical">Electrical</option>
                <option value="Hardware">Hardware</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Unit of Measure (UoM) <span className="text-[#F59E0B]">*</span>
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="meter">Meters (m)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="units">Units</option>
                <option value="sheet">Sheets</option>
                <option value="bag">Bags</option>
                <option value="liter">Liters (L)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
              {errors.initialStock && <p className="text-[10px] text-[#EF4444]">{errors.initialStock}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Reorder Buffer
              </label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Unit Valuation ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
                Assigned Warehouse
              </label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none cursor-pointer"
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
                Primary Rack / Location
              </label>
              <input
                type="text"
                value={primaryLocation}
                onChange={(e) => setPrimaryLocation(e.target.value)}
                placeholder="e.g. Rack A-12, Bin 14, Zone C"
                className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-xs font-mono text-[#F8FAFC] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-[#94A3B8] font-semibold">
              Description & Specifications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Material grade, supplier specifications, storage constraints..."
              className="w-full bg-[#0B0D10] border border-[#292D35] focus:border-[#F59E0B] rounded-lg p-2.5 text-xs text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#292D35] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-lg bg-[#111318] hover:bg-[#1E222A] border border-[#292D35] text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold transition-all shadow-md active:scale-95"
            >
              Save & Activate SKU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
