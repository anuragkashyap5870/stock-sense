import React from 'react';
import { useInventory } from '../../store/inventoryStore';
import { AlertTriangle, ArrowRight, ShoppingCart } from 'lucide-react';
import { Product } from '../../types/inventory';

export const LowStockAlerts: React.FC = () => {
  const { products, setSelectedProductId, setActiveTab, setActiveModal } = useInventory();

  // Find products that are at or below reorder level, plus ensure key alert items are featured
  const alertProducts = products
    .filter((p) => p.availableStock <= p.reorderLevel)
    .sort((a, b) => a.availableStock / a.reorderLevel - b.availableStock / b.reorderLevel)
    .slice(0, 4);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setActiveTab('product-detail');
  };

  const handleReorder = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setActiveModal('newReceipt');
  };

  return (
    <div className="bg-[#171A20] border border-[#292D35] p-4 sm:p-5 rounded-xl shadow-md flex flex-col space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Priority Replenishment</h3>
        </div>
        <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#EF4444]/20 text-[#EF4444]">
          {alertProducts.length} Urgent
        </span>
      </div>

      <div className="space-y-3">
        {alertProducts.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#64748B]">All stock levels are currently healthy!</div>
        ) : (
          alertProducts.map((p) => {
            const isCritical = p.availableStock === 0 || p.availableStock <= p.reorderLevel * 0.5;
            const percent = Math.min(100, Math.round((p.availableStock / Math.max(1, p.reorderLevel)) * 100));

            return (
              <div
                key={p.id}
                onClick={() => handleProductClick(p.id)}
                className="bg-[#111318] border border-[#292D35] hover:border-[#F59E0B]/50 p-3 rounded-lg space-y-2 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors truncate">
                      {p.name}
                    </h4>
                    <span className="text-[10px] font-mono text-[#94A3B8]">
                      {p.sku} • {p.primaryLocation} • Unit: {p.unit.toUpperCase()}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                      isCritical
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : 'bg-[#F59E0B]/20 text-[#F59E0B]'
                    }`}
                  >
                    {isCritical ? 'Critical' : 'Low Stock'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold ${isCritical ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                    {p.availableStock} {p.unit} current
                  </span>
                  <span className="text-[#94A3B8]">Reorder: {p.reorderLevel} {p.unit}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#1E222A] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
                    }`}
                    style={{ width: `${Math.max(5, percent)}%` }}
                  />
                </div>

                <div className="pt-0.5 flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B]">Lead time: {p.leadTimeDays || 2} days</span>
                  <button
                    onClick={(e) => handleReorder(e, p)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-[11px] font-semibold rounded transition-colors shadow-sm"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        onClick={() => setActiveTab('products')}
        className="w-full text-center py-1.5 text-xs font-mono text-[#F59E0B] hover:underline flex items-center justify-center gap-1"
      >
        <span>View Full Stock Catalog</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
