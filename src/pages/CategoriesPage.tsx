import React from 'react';
import { useInventory } from '../store/inventoryStore';
import { Layers, ArrowRight, Package } from 'lucide-react';
import { ProductCategory } from '../types/inventory';

export const CategoriesPage: React.FC = () => {
  const { products, setActiveTab, setSelectedProductId } = useInventory();

  const categories: { name: ProductCategory; desc: string; iconColor: string }[] = [
    { name: 'Raw Materials', desc: 'Steel rods, aluminum plates, cement, and unprocessed structural bulk stock.', iconColor: 'text-[#F59E0B] bg-[#F59E0B]/10' },
    { name: 'Electrical', desc: 'Copper core wire, industrial cables, switchgear components, and insulation.', iconColor: 'text-[#A855F7] bg-[#A855F7]/10' },
    { name: 'Hardware', desc: 'Fasteners, hex bolts, threaded fasteners, brackets, and structural fixtures.', iconColor: 'text-[#EC4899] bg-[#EC4899]/10' },
    { name: 'Components', desc: 'PVC pipelines, pneumatic couplings, valves, and modular hydraulic units.', iconColor: 'text-[#3B82F6] bg-[#3B82F6]/10' },
    { name: 'Finished Goods', desc: 'Assembled planetary gearboxes, certified structural trusses, and ready-to-dispatch assemblies.', iconColor: 'text-[#22C55E] bg-[#22C55E]/10' },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-[#171A20] border border-[#292D35] p-5 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#F59E0B]/20 text-[#F59E0B] px-2 py-0.5 rounded font-bold">
              Classification Engine
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1">
            Product Categories &amp; Segments
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Hierarchical grouping of materials, hardware, and assemblies across all 3 warehouse facilities.
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const categoryProducts = products.filter((p) => p.category === cat.name);
          const totalUnits = categoryProducts.reduce((sum, p) => sum + p.availableStock, 0);
          const totalValuation = categoryProducts.reduce((sum, p) => sum + p.availableStock * (p.unitPrice || 50), 0);

          return (
            <div
              key={cat.name}
              className="bg-[#171A20] border border-[#292D35] hover:border-[#F59E0B]/50 p-5 rounded-xl shadow-md flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.iconColor}`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#F59E0B] transition-colors">
                        {cat.name}
                      </h3>
                      <span className="font-mono text-[10px] text-[#94A3B8]">
                        {categoryProducts.length} Catalog SKUs
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] leading-relaxed min-h-[36px]">
                  {cat.desc}
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-[#0B0D10] border border-[#292D35]/50 rounded-lg text-center font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-[#64748B] block">On-Hand Stock</span>
                    <span className="text-sm font-bold text-[#22C55E]">
                      {totalUnits.toLocaleString()} units
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#64748B] block">Valuation</span>
                    <span className="text-sm font-semibold text-[#F8FAFC]">
                      ${totalValuation.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Top SKUs in Category */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-[#64748B]">Featured SKUs</span>
                  {categoryProducts.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductId(p.id);
                        setActiveTab('product-detail');
                      }}
                      className="flex items-center justify-between p-2 rounded bg-[#111318] hover:bg-[#1E222A] cursor-pointer text-xs transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="text-[#F8FAFC] font-medium">{p.name}</span>
                        <span className="text-[10px] font-mono text-[#64748B] ml-2">({p.sku})</span>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#F59E0B] flex-shrink-0">
                        {p.availableStock} {p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#292D35] mt-4 flex items-center justify-end">
                <button
                  onClick={() => setActiveTab('products')}
                  className="flex items-center gap-1 text-xs font-mono text-[#F59E0B] hover:underline"
                >
                  <span>Filter Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
