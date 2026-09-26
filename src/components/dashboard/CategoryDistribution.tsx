import React from 'react';
import { useInventory } from '../../store/inventoryStore';
import { Layers } from 'lucide-react';
import { ProductCategory } from '../../types/inventory';

export const CategoryDistribution: React.FC = () => {
  const { products, setActiveTab } = useInventory();

  const categories: ProductCategory[] = [
    'Raw Materials',
    'Components',
    'Finished Goods',
    'Electrical',
    'Hardware',
  ];

  const categoryCounts = categories.map((cat) => {
    const prods = products.filter((p) => p.category === cat);
    const stockUnits = prods.reduce((sum, p) => sum + p.availableStock, 0);
    return {
      category: cat,
      count: prods.length,
      stockUnits,
    };
  });

  const totalAllStock = categoryCounts.reduce((sum, c) => sum + c.stockUnits, 0) || 1;

  const colorMap: Record<ProductCategory, string> = {
    'Raw Materials': 'bg-[#F59E0B]',
    'Components': 'bg-[#3B82F6]',
    'Finished Goods': 'bg-[#22C55E]',
    'Electrical': 'bg-[#A855F7]',
    'Hardware': 'bg-[#EC4899]',
  };

  return (
    <div className="bg-[#171A20] border border-[#292D35] p-4 sm:p-5 rounded-xl shadow-md flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Stock by Category</h3>
        </div>
        <button
          onClick={() => setActiveTab('categories')}
          className="text-[11px] font-mono uppercase text-[#F59E0B] hover:underline"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {categoryCounts.map((item) => {
          const percent = Math.round((item.stockUnits / totalAllStock) * 100);
          const color = colorMap[item.category] || 'bg-[#94A3B8]';

          return (
            <div key={item.category} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#F8FAFC] font-medium">{item.category}</span>
                <span className="font-mono text-[#94A3B8]">
                  {item.stockUnits.toLocaleString()} units ({percent}%)
                </span>
              </div>
              <div className="w-full bg-[#0B0D10] h-1.5 rounded-full overflow-hidden border border-[#292D35]/40">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${color}`}
                  style={{ width: `${Math.max(4, percent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
