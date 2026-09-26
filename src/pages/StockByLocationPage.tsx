import React, { useState } from 'react';
import { useInventory } from '../store/inventoryStore';
import { Warehouse, MapPin, ArrowLeftRight, Package, Search } from 'lucide-react';

export const StockByLocationPage: React.FC = () => {
  const { warehouses, products, setActiveModal, setSelectedProductId, setActiveTab } = useInventory();
  const [selectedWhId, setSelectedWhId] = useState(warehouses[0]?.id || 'WH-001');

  const currentWh = warehouses.find((w) => w.id === selectedWhId) || warehouses[0];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-[#171A20] border border-[#292D35] p-5 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase bg-[#3B82F6]/20 text-[#3B82F6] px-2 py-0.5 rounded font-bold">
              Facility Telemetry
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F8FAFC] mt-1">
            Stock by Facility &amp; Location
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Physical balance distribution across storage racks, staging bays, and production lines.
          </p>
        </div>

        <button
          onClick={() => setActiveModal('newTransfer')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#0B0D10] text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Internal Transfer</span>
        </button>
      </div>

      {/* Warehouse Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {warehouses.map((wh) => (
          <button
            key={wh.id}
            onClick={() => setSelectedWhId(wh.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${
              selectedWhId === wh.id
                ? 'bg-[#1E222A] border-[#F59E0B] text-[#F8FAFC] shadow-sm font-semibold'
                : 'bg-[#171A20] border-[#292D35] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            <Warehouse className={`w-4 h-4 ${selectedWhId === wh.id ? 'text-[#F59E0B]' : 'text-[#94A3B8]'}`} />
            <span>[{wh.code}] {wh.name}</span>
            <span className="font-mono text-[10px] bg-[#0B0D10] px-1.5 py-0.5 rounded text-[#94A3B8]">
              {wh.occupiedCapacityPercent}%
            </span>
          </button>
        ))}
      </div>

      {/* Locations in Selected Warehouse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentWh.locations.map((loc) => {
          // Find products in this location
          const itemsHere = products.filter((p) =>
            p.locationStocks.some(
              (ls) => ls.warehouseId === currentWh.id && ls.locationName === loc.name && ls.quantity > 0
            )
          );

          return (
            <div
              key={loc.id}
              className="bg-[#171A20] border border-[#292D35] p-4 rounded-xl shadow-md space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F59E0B]" />
                    <h3 className="text-xs font-bold text-[#F8FAFC]">{loc.name}</h3>
                  </div>
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#0B0D10] text-[#94A3B8]">
                    {loc.type}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-1">
                  <span>Capacity: {loc.capacityM3} m³</span>
                  <span className="text-[#22C55E]">{itemsHere.length} Active SKUs</span>
                </div>

                {/* Products stored here */}
                <div className="space-y-1.5 pt-2 border-t border-[#292D35]/50">
                  {itemsHere.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#64748B]">Bay available for staging.</div>
                  ) : (
                    itemsHere.map((p) => {
                      const qty =
                        p.locationStocks.find(
                          (ls) => ls.warehouseId === currentWh.id && ls.locationName === loc.name
                        )?.quantity || 0;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setActiveTab('product-detail');
                          }}
                          className="flex items-center justify-between p-2 rounded bg-[#0B0D10] hover:bg-[#1E222A] cursor-pointer text-xs transition-colors"
                        >
                          <div className="truncate pr-2">
                            <span className="text-[#F8FAFC] font-medium">{p.name}</span>
                            <span className="text-[10px] font-mono text-[#64748B] ml-1.5">({p.sku})</span>
                          </div>
                          <span className="font-mono font-bold text-xs text-[#22C55E] flex-shrink-0">
                            {qty} {p.unit}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-[#292D35]/40 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-[#64748B]">Telemetry: Active</span>
                <button
                  onClick={() => setActiveModal('newTransfer')}
                  className="text-xs font-mono text-[#F59E0B] hover:underline"
                >
                  Transfer into Bay
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
