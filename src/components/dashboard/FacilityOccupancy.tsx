import React from 'react';
import { useInventory } from '../../store/inventoryStore';
import { Warehouse, CheckCircle2 } from 'lucide-react';

export const FacilityOccupancy: React.FC = () => {
  const { warehouses, setActiveTab } = useInventory();

  return (
    <div className="bg-[#171A20] border border-[#292D35] p-4 sm:p-5 rounded-xl shadow-md flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Facility Occupancy</h3>
        </div>
        <span className="font-mono text-xs text-[#94A3B8]">{warehouses.length} Sites Connected</span>
      </div>

      <div className="space-y-3.5">
        {warehouses.map((wh) => {
          let barColor = 'bg-[#F59E0B]';
          if (wh.occupiedCapacityPercent < 50) barColor = 'bg-[#3B82F6]';
          if (wh.occupiedCapacityPercent >= 50 && wh.occupiedCapacityPercent < 80) barColor = 'bg-[#22C55E]';

          return (
            <div key={wh.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#F8FAFC] truncate">{wh.name}</span>
                <span className="font-mono font-bold text-[#F8FAFC]">{wh.occupiedCapacityPercent}%</span>
              </div>
              <div className="w-full bg-[#0B0D10] h-2 rounded-full overflow-hidden border border-[#292D35]/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${wh.occupiedCapacityPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#94A3B8] font-mono">
                <span>{wh.totalProductsCount} Products Active</span>
                <span>Cap: {wh.totalCapacityM3.toLocaleString()} m³</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 rounded-lg bg-[#0B0D10] border border-[#292D35]/60 flex items-center justify-between text-[#94A3B8]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          <span className="text-xs">All bay telemetry active</span>
        </div>
        <button
          onClick={() => setActiveTab('warehouses')}
          className="text-[11px] font-mono uppercase text-[#F59E0B] hover:underline"
        >
          Manage Bays
        </button>
      </div>
    </div>
  );
};
